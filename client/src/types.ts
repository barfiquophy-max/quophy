export type Role = 'farmer' | 'expert' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  location?: string;
  profileImage?: string;
  farmInfo?: string;
  preferredLanguage?: string;
  notificationPrefs?: { alerts?: boolean; weather?: boolean; reminders?: boolean; expert?: boolean };
  emailVerified: boolean;
  createdAt: string;
}

export interface Farm {
  id: string;
  user_id: string;
  farm_name: string;
  location?: string;
  size?: number;
  notes?: string;
  crop_count?: number;
  attention_count?: number;
  created_at: string;
}

export interface Crop {
  id: string;
  farm_id: string;
  farm_name?: string;
  farm_location?: string;
  crop_type: string;
  variety?: string;
  planting_date?: string;
  expected_harvest_date?: string;
  status: 'growing' | 'healthy' | 'attention' | 'harvested';
  health_score: number;
  notes?: string;
  created_at: string;
  analyses?: Analysis[];
}

export type AnalysisStatus =
  | 'healthy'
  | 'possible_pest'
  | 'possible_disease'
  | 'possible_stress'
  | 'undetermined';

export interface Analysis {
  id: string;
  user_id: string;
  farm_id?: string;
  crop_id?: string;
  image_url?: string;
  crop_type?: string;
  linked_crop_type?: string;
  farm_name?: string;
  farmer_name?: string;
  symptoms?: string;
  location?: string;
  notes?: string;
  status: AnalysisStatus;
  detected_condition?: string;
  confidence?: number;
  severity?: 'Low' | 'Moderate' | 'High' | 'None';
  symptoms_detected: string[];
  cause?: string;
  recommendations: string[];
  prevention: string[];
  needs_expert_review: boolean;
  is_mock: boolean;
  created_at: string;
}

export interface Indicator {
  label: string;
  value: number;
}

export interface Alert {
  id: string;
  title: string;
  message: string;
  alert_type: 'pest' | 'disease' | 'crop' | 'weather' | 'treatment' | 'general';
  location?: string;
  severity: 'info' | 'warning' | 'critical';
  created_at: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  read: boolean;
  created_at: string;
}

export interface ExpertCase {
  id: string;
  review_id?: string;
  analysis_id: string;
  farmer_id: string;
  expert_id?: string;
  status?: string;
  review_status?: 'pending' | 'under_review' | 'resolved';
  request_comment?: string;
  comments?: string;
  recommendation?: string;
  urgent: boolean;
  crop_type?: string;
  image_url?: string;
  detected_condition?: string;
  confidence?: number;
  severity?: string;
  ai_status?: AnalysisStatus;
  symptoms?: string;
  location?: string;
  farmer_name?: string;
  farmer_location?: string;
  farmer_phone?: string;
  expert_name?: string;
  analyzed_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface Condition {
  id: string;
  name: string;
  kind: 'pest' | 'disease' | 'deficiency' | 'stress';
  affected_crops: string[];
  description?: string;
  symptoms: string[];
  treatments: string[];
  prevention: string[];
}
