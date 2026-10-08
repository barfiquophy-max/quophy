import crypto from 'node:crypto';
import { config } from '../config.js';
import { query } from '../db/pool.js';

export interface AnalyzeInput {
  imagePath?: string;
  imageMime?: string;
  cropType?: string;
  symptoms?: string;
  location?: string;
  notes?: string;
}

export interface AiResult {
  status: 'healthy' | 'possible_pest' | 'possible_disease' | 'possible_stress' | 'undetermined';
  crop: string;
  condition: string;
  confidence: number;
  severity: 'Low' | 'Moderate' | 'High' | 'None';
  symptomsDetected: string[];
  cause: string;
  recommendations: string[];
  prevention: string[];
  needsExpertReview: boolean;
  isMock: boolean;
  indicators: { label: string; value: number }[];
}

interface ConditionRow {
  name: string;
  kind: 'pest' | 'disease' | 'deficiency' | 'stress';
  affected_crops: string[];
  description: string | null;
  symptoms: string[];
  treatments: string[];
  prevention: string[];
}

function seededRandom(seed: string) {
  const h = crypto.createHash('sha256').update(seed).digest();
  let i = 0;
  return () => {
    const n = h[i % 28]! / 255 + h[(i + 1) % 28]! / 255 / 255;
    i += 2;
    return n % 1;
  };
}

const STATUS_BY_KIND: Record<string, AiResult['status']> = {
  pest: 'possible_pest',
  disease: 'possible_disease',
  deficiency: 'possible_stress',
  stress: 'possible_stress',
};

const CONDITION_SYMPTOM_KEYWORDS: Record<string, string[]> = {
  'fall armyworm': ['holes', 'caterpillar', 'worm', 'ragged', 'frass', 'eaten'],
  'aphid infestation': ['aphid', 'sticky', 'curl', 'curling', 'clusters', 'ants'],
  'early blight': ['spots', 'rings', 'yellow', 'blight', 'brown spots', 'concentric'],
  'leaf spot': ['spot', 'spots', 'lesion', 'brown', 'dots'],
  'powdery mildew': ['powder', 'white', 'mildew', 'dusty', 'flour'],
  'nutrient deficiency': ['yellow', 'pale', 'stunted', 'chlorosis', 'weak', 'deficiency'],
};

function scoreConditions(conditions: ConditionRow[], input: AnalyzeInput, rand: () => number) {
  const symptomText = `${input.symptoms ?? ''} ${input.notes ?? ''}`.toLowerCase();
  const crop = (input.cropType ?? '').toLowerCase();
  return conditions.map((c) => {
    let score = rand() * 0.25;
    if (crop && c.affected_crops.some((a) => a.toLowerCase() === crop)) score += 0.35;
    if (crop && c.affected_crops.some((a) => a.toLowerCase().includes(crop) || crop.includes(a.toLowerCase()))) score += 0.15;
    const keywords = CONDITION_SYMPTOM_KEYWORDS[c.name.toLowerCase()] ?? [];
    for (const kw of keywords) {
      if (symptomText.includes(kw)) score += 0.2;
    }
    for (const s of c.symptoms) {
      const key = s.toLowerCase().split(' ')[0]!;
      if (key.length > 4 && symptomText.includes(key)) score += 0.1;
    }
    return { condition: c, score };
  });
}

async function mockAnalyze(input: AnalyzeInput): Promise<AiResult> {
  const rand = seededRandom(
    `${input.imagePath ?? ''}|${input.cropType ?? ''}|${input.symptoms ?? ''}|${input.notes ?? ''}`,
  );
  const crop = input.cropType?.trim() || 'Crop';
  const { rows: conditions } = await query<ConditionRow>('SELECT * FROM conditions');

  // Very small files are usually not real photos — flag low confidence.
  const suspiciouslySmall = input.imagePath
    ? (await import('node:fs')).statSync(input.imagePath).size < 2048
    : true;

  const scored = scoreConditions(conditions, input, rand).sort((a, b) => b.score - a.score);
  const top = scored[0];
  const secondScore = scored[1]?.score ?? 0;

  const indicators = [
    { label: 'Leaf condition', value: Math.round(40 + rand() * 60) },
    { label: 'Color patterns', value: Math.round(30 + rand() * 70) },
    { label: 'Visible spots', value: Math.round(rand() * 100) },
    { label: 'Pest indicators', value: Math.round(rand() * 100) },
    { label: 'Disease indicators', value: Math.round(rand() * 100) },
  ];

  // Undetermined when image is weak and no useful signals.
  if (suspiciouslySmall && (!input.symptoms || input.symptoms.trim().length < 8)) {
    return {
      status: 'undetermined',
      crop,
      condition: 'Unable to determine',
      confidence: 0.32 + rand() * 0.1,
      severity: 'None',
      symptomsDetected: [],
      cause: 'The image or description did not contain enough detail for the AI to assess the crop.',
      recommendations: [
        'Take a close, well-lit photo of the affected leaves or stems.',
        'Describe what you see: spots, insects, yellowing, wilting.',
        'If the problem keeps spreading, request an expert review.',
      ],
      prevention: ['Inspect crops at least twice a week.', 'Keep field edges free of weeds.'],
      needsExpertReview: true,
      isMock: true,
      indicators,
    };
  }

  const healthy = rand() < 0.22 && (!input.symptoms || input.symptoms.trim().length === 0);
  if (healthy || !top || top.score < 0.3) {
    return {
      status: 'healthy',
      crop,
      condition: 'No pest or disease detected',
      confidence: 0.78 + rand() * 0.18,
      severity: 'None',
      symptomsDetected: [],
      cause: 'The crop looks healthy in this image.',
      recommendations: [
        'Continue normal crop care and watering.',
        'Keep monitoring leaves weekly for early signs of trouble.',
      ],
      prevention: [
        'Rotate crops each season to reduce soil-borne problems.',
        'Remove crop residues after harvest.',
      ],
      needsExpertReview: false,
      isMock: true,
      indicators,
    };
  }

  const c = top.condition;
  const margin = top.score - secondScore;
  const confidence = Math.min(0.97, 0.55 + top.score * 0.35 + margin * 0.1);
  const severity: AiResult['severity'] =
    confidence > 0.85 && rand() > 0.4 ? 'High' : confidence > 0.7 ? 'Moderate' : 'Low';
  const lowConfidence = confidence < 0.6;

  return {
    status: STATUS_BY_KIND[c.kind] ?? 'possible_disease',
    crop,
    condition: `Possible ${c.name}`,
    confidence: Math.round(confidence * 1000) / 1000,
    severity,
    symptomsDetected: c.symptoms.slice(0, 4),
    cause: c.description ?? `Signs consistent with ${c.name}.`,
    recommendations: c.treatments.length
      ? c.treatments
      : ['Remove and destroy heavily affected plant parts.', 'Consult a local agricultural officer.'],
    prevention: c.prevention.length
      ? c.prevention
      : ['Monitor the crop every few days.', 'Keep the field clean and well drained.'],
    needsExpertReview: lowConfidence,
    isMock: true,
    indicators,
  };
}

async function remoteAnalyze(input: AnalyzeInput): Promise<AiResult> {
  const res = await fetch(config.aiProviderUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.aiProviderApiKey}`,
    },
    body: JSON.stringify({
      cropType: input.cropType,
      symptoms: input.symptoms,
      location: input.location,
      notes: input.notes,
      imagePath: input.imagePath,
    }),
  });
  if (!res.ok) throw new Error(`AI provider returned ${res.status}`);
  const data = (await res.json()) as Partial<AiResult>;
  return {
    status: data.status ?? 'undetermined',
    crop: data.crop ?? input.cropType ?? 'Crop',
    condition: data.condition ?? 'Unable to determine',
    confidence: data.confidence ?? 0,
    severity: data.severity ?? 'None',
    symptomsDetected: data.symptomsDetected ?? [],
    cause: data.cause ?? '',
    recommendations: data.recommendations ?? [],
    prevention: data.prevention ?? [],
    needsExpertReview: data.needsExpertReview ?? true,
    isMock: false,
    indicators: data.indicators ?? [],
  };
}

export async function analyzeCrop(input: AnalyzeInput): Promise<AiResult> {
  if (config.aiProviderUrl) return remoteAnalyze(input);
  return mockAnalyze(input);
}
