/**
 * Bihar District & Block Master — verified data only.
 * Block data is verified ONLY for Madhepura; other districts rely
 * on Supabase school data rather than invented block names.
 */
export interface BlockInfo { name: string; code?: string; }
export interface DistrictInfo { name: string; code?: string; blocks?: BlockInfo[]; }

export const BIHAR_DISTRICTS: DistrictInfo[] = [
  { name: 'Araria' }, { name: 'Arwal' }, { name: 'Aurangabad' }, { name: 'Banka' },
  { name: 'Begusarai' }, { name: 'Bhagalpur' }, { name: 'Bhojpur' }, { name: 'Buxar' },
  { name: 'Darbhanga' }, { name: 'East Champaran' }, { name: 'Gaya' }, { name: 'Gopalganj' },
  { name: 'Jamui' }, { name: 'Jehanabad' }, { name: 'Kaimur' }, { name: 'Katihar' },
  { name: 'Khagaria' }, { name: 'Kishanganj' }, { name: 'Lakhisarai' },
  { name: 'Madhepura', blocks: [
    { name: 'Alamnagar' }, { name: 'Bihariganj' }, { name: 'Chausa' },
    { name: 'Gamharia' }, { name: 'Ghailar' }, { name: 'Gwalpara' },
    { name: 'Kumarkhand' }, { name: 'Madhepura' }, { name: 'Murliganj' },
    { name: 'Puraini' }, { name: 'Shankarpur' }, { name: 'Singheshwar' },
    { name: 'Udakishunganj' },
  ]},
  { name: 'Madhubani' }, { name: 'Munger' }, { name: 'Muzaffarpur' }, { name: 'Nalanda' },
  { name: 'Nawada' }, { name: 'Patna' }, { name: 'Purnia' }, { name: 'Rohtas' },
  { name: 'Saharsa' }, { name: 'Samastipur' }, { name: 'Saran' }, { name: 'Sheikhpura' },
  { name: 'Sheohar' }, { name: 'Sitamarhi' }, { name: 'Siwan' }, { name: 'Supaul' },
  { name: 'Vaishali' }, { name: 'West Champaran' },
];

export const BIHAR_DISTRICT_NAMES = BIHAR_DISTRICTS.map((d) => d.name);

export const MADHEPURA_BLOCKS = BIHAR_DISTRICTS.find(
  (d) => d.name === 'Madhepura'
)?.blocks?.map((b) => b.name) || [
  'Alamnagar', 'Bihariganj', 'Chausa', 'Gamharia', 'Ghailar',
  'Gwalpara', 'Kumarkhand', 'Madhepura', 'Murliganj', 'Puraini',
  'Shankarpur', 'Singheshwar', 'Udakishunganj',
];
