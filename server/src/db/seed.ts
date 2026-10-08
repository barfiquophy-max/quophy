import bcrypt from 'bcryptjs';
import { pool, query } from './pool.js';

const CONDITIONS = [
  {
    name: 'Fall Armyworm',
    kind: 'pest',
    crops: ['Maize', 'Rice', 'Sorghum'],
    description:
      'A caterpillar that eats young leaves and growing points, leaving ragged holes and sawdust-like droppings.',
    symptoms: ['Ragged holes in leaves', 'Sawdust-like droppings', 'Damaged tassels', 'Young plants eaten at the base'],
    treatments: [
      'Check the funnel (center) of young plants early in the morning for caterpillars.',
      'Hand-pick and destroy caterpillars where numbers are small.',
      'Apply an approved biopesticide (e.g. neem-based) per label instructions.',
      'For heavy attack, use an approved insecticide recommended by your agricultural officer.',
    ],
    prevention: [
      'Plant early and at the same time as neighbors.',
      'Keep the field free of weeds that host the pest.',
      'Scout fields at least twice a week during the first 8 weeks.',
    ],
  },
  {
    name: 'Aphid Infestation',
    kind: 'pest',
    crops: ['Pepper', 'Tomato', 'Cocoa', 'Cassava'],
    description:
      'Small soft insects that cluster under leaves and suck sap, causing curling leaves and sticky honeydew.',
    symptoms: ['Curling or distorted leaves', 'Sticky shiny leaf surface', 'Clusters of small green/black insects', 'Ants moving on plants'],
    treatments: [
      'Spray a strong jet of water to knock aphids off leaves.',
      'Apply soapy water or neem-based spray on affected plants.',
      'Encourage natural enemies like ladybirds — avoid broad insecticides.',
    ],
    prevention: ['Inspect undersides of leaves weekly.', 'Remove heavily infested plant tips.', 'Control weeds around the field.'],
  },
  {
    name: 'Early Blight',
    kind: 'disease',
    crops: ['Tomato', 'Potato', 'Pepper'],
    description:
      'A fungal disease causing dark spots with rings (target-like) on older leaves, which then turn yellow.',
    symptoms: ['Dark spots with concentric rings', 'Yellowing around spots', 'Lower leaves affected first', 'Leaf drop in severe cases'],
    treatments: [
      'Remove and destroy severely affected leaves.',
      'Improve airflow between plants — space and stake them well.',
      'Avoid wetting leaves when watering.',
      'Apply an approved fungicide according to agricultural guidance.',
    ],
    prevention: ['Rotate with non-solanaceous crops for 2+ seasons.', 'Mulch to prevent soil splash onto leaves.', 'Use certified disease-free seed/seedlings.'],
  },
  {
    name: 'Leaf Spot',
    kind: 'disease',
    crops: ['Cassava', 'Maize', 'Pepper', 'Tomato', 'Plantain'],
    description: 'Fungal or bacterial spots on leaves that can merge and cause leaves to dry out.',
    symptoms: ['Small round brown or black spots', 'Yellow halo around spots', 'Spots merging into large dead areas'],
    treatments: ['Remove badly affected leaves.', 'Avoid overhead watering.', 'Apply approved fungicide where recommended.'],
    prevention: ['Space plants for good airflow.', 'Use resistant varieties when available.', 'Destroy crop residues after harvest.'],
  },
  {
    name: 'Powdery Mildew',
    kind: 'disease',
    crops: ['Cocoa', 'Pepper', 'Tomato', 'Plantain'],
    description: 'A white powdery coating on leaves that weakens the plant and reduces yield.',
    symptoms: ['White powdery patches on leaves', 'Distorted young leaves', 'Premature leaf drop'],
    treatments: ['Remove affected leaves early.', 'Apply sulphur-based or approved fungicide.', 'Improve air circulation.'],
    prevention: ['Avoid overcrowding plants.', 'Water at the base, not on leaves.', 'Choose resistant varieties.'],
  },
  {
    name: 'Nutrient Deficiency',
    kind: 'deficiency',
    crops: ['Maize', 'Rice', 'Tomato', 'Cassava', 'Plantain', 'Cocoa', 'Pepper'],
    description:
      'Yellowing, pale leaves, or stunted growth caused by lack of nitrogen, potassium, or other nutrients.',
    symptoms: ['General yellowing of older leaves', 'Stunted slow growth', 'Pale green color', 'Weak stems'],
    treatments: [
      'Apply a balanced fertilizer suited to the crop and soil.',
      'Add well-decomposed compost or manure.',
      'Consider a soil test to confirm which nutrient is missing.',
    ],
    prevention: ['Maintain soil fertility with organic matter.', 'Follow a fertilization schedule.', 'Rotate with legumes where possible.'],
  },
];

const ALERTS = [
  {
    title: 'Fall Armyworm activity reported',
    message: 'Possible Fall Armyworm activity has been reported near your area. Scout maize fields this week.',
    type: 'pest',
    location: 'Northern Region',
    severity: 'warning',
  },
  {
    title: 'Heavy rainfall expected',
    message: 'Heavy rainfall is expected in the coming days. Check your farm drainage and avoid spraying before rain.',
    type: 'weather',
    location: '',
    severity: 'info',
  },
  {
    title: 'Early blight outbreak in tomatoes',
    message: 'Early blight has been confirmed on tomato farms in the region. Inspect lower leaves for dark ringed spots.',
    type: 'disease',
    location: 'Ashanti Region',
    severity: 'critical',
  },
  {
    title: 'Treatment reminder',
    message: 'If you scheduled a crop treatment this week, it is due. Apply treatments in the early morning or evening.',
    type: 'treatment',
    location: '',
    severity: 'info',
  },
];

async function main() {
  const password = await bcrypt.hash('Password1', 10);

  const users = [
    { name: 'Admin User', email: 'admin@quophy.app', phone: '+233200000001', role: 'admin', location: 'Accra' },
    { name: 'Dr. Ama Serwaa', email: 'expert@quophy.app', phone: '+233200000002', role: 'expert', location: 'Kumasi' },
    { name: 'Kwame Mensah', email: 'farmer@quophy.app', phone: '+233200000003', role: 'farmer', location: 'Northern Region' },
    { name: 'Efua Owusu', email: 'efua@example.com', phone: '+233200000004', role: 'farmer', location: 'Ashanti Region' },
  ];

  const ids: Record<string, string> = {};
  for (const u of users) {
    const { rows } = await query(
      `INSERT INTO users (name, email, phone, password_hash, role, location, email_verified)
       VALUES ($1,$2,$3,$4,$5,$6,TRUE)
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [u.name, u.email, u.phone, password, u.role, u.location],
    );
    ids[u.email] = rows[0].id;
  }

  for (const c of CONDITIONS) {
    await query(
      `INSERT INTO conditions (name, kind, affected_crops, description, symptoms, treatments, prevention)
       SELECT $1,$2,$3,$4,$5,$6,$7
       WHERE NOT EXISTS (SELECT 1 FROM conditions WHERE name = $1)`,
      [c.name, c.kind, c.crops, c.description, c.symptoms, c.treatments, c.prevention],
    );
  }

  for (const a of ALERTS) {
    await query(
      `INSERT INTO alerts (title, message, alert_type, location, severity)
       SELECT $1,$2,$3,$4,$5 WHERE NOT EXISTS (SELECT 1 FROM alerts WHERE title = $1)`,
      [a.title, a.message, a.type, a.location, a.severity],
    );
  }

  const farmer = ids['farmer@quophy.app']!;
  const { rows: farmRows } = await query(
    `INSERT INTO farms (user_id, farm_name, location, size, notes)
     SELECT $1,'Green Valley Farm','Northern Region',4.5,'Maize and tomato rotation'
     WHERE NOT EXISTS (SELECT 1 FROM farms WHERE farm_name='Green Valley Farm' AND user_id=$1)
     RETURNING id`,
    [farmer],
  );
  const farmId =
    farmRows[0]?.id ??
    (await query('SELECT id FROM farms WHERE farm_name=$1 AND user_id=$2', ['Green Valley Farm', farmer])).rows[0]?.id;

  if (farmId) {
    const crops = [
      { type: 'Maize', status: 'attention', score: 62, plant: '2026-08-15', harvest: '2026-12-15' },
      { type: 'Tomato', status: 'healthy', score: 91, plant: '2026-09-01', harvest: '2026-12-01' },
      { type: 'Pepper', status: 'growing', score: 84, plant: '2026-09-10', harvest: '2027-01-10' },
    ];
    for (const c of crops) {
      await query(
        `INSERT INTO crops (farm_id, crop_type, planting_date, expected_harvest_date, status, health_score)
         SELECT $1,$2,$3,$4,$5,$6
         WHERE NOT EXISTS (SELECT 1 FROM crops WHERE farm_id=$1 AND crop_type=$2)`,
        [farmId, c.type, c.plant, c.harvest, c.status, c.score],
      );
    }
    await query(
      `INSERT INTO notifications (user_id, title, message, type)
       SELECT $1,'Welcome to Quophy','Upload a photo of a crop to get an AI health check.','general'
       WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE user_id=$1 AND title='Welcome to Quophy')`,
      [farmer],
    );
  }

  console.log('Seed complete. Demo credentials (password: Password1):');
  console.log('  farmer@quophy.app / expert@quophy.app / admin@quophy.app');
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
