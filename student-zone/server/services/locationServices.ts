/**
 * Bihar Location Service — verified static master.
 * District names are complete (38). Block data is verified ONLY for Madhepura.
 * Other districts rely on Supabase real school/block data.
 */

export const BIHAR_LOCATION_DATA: Record<string, string[]> = {
  'Madhepura': [
    'Alamnagar', 'Bihariganj', 'Chausa', 'Gamharia', 'Ghailar',
    'Gwalpara', 'Kumarkhand', 'Madhepura', 'Murliganj', 'Puraini',
    'Shankarpur', 'Singheshwar', 'Udakishunganj',
  ],
};

export const BIHAR_DISTRICT_NAMES: string[] = [
  'Araria', 'Arwal', 'Aurangabad', 'Banka', 'Begusarai', 'Bhagalpur',
  'Bhojpur', 'Buxar', 'Darbhanga', 'East Champaran', 'Gaya', 'Gopalganj',
  'Jamui', 'Jehanabad', 'Kaimur', 'Katihar', 'Khagaria', 'Kishanganj',
  'Lakhisarai', 'Madhepura', 'Madhubani', 'Munger', 'Muzaffarpur',
  'Nalanda', 'Nawada', 'Patna', 'Purnia', 'Rohtas', 'Saharsa',
  'Samastipur', 'Saran', 'Sheikhpura', 'Sheohar', 'Sitamarhi', 'Siwan',
  'Supaul', 'Vaishali', 'West Champaran',
];

export const MADHEPURA_BLOCKS = BIHAR_LOCATION_DATA['Madhepura'];

export function getAllDistricts(): string[] {
  return [...BIHAR_DISTRICT_NAMES].sort((a, b) => a.localeCompare(b));
}

export function getBlocksByDistrict(district: string): string[] {
  const direct = BIHAR_LOCATION_DATA[district?.trim()];
  if (direct) return [...direct].sort((a, b) => a.localeCompare(b));
  return [];
}

export function hasDistrict(name: string): boolean {
  if (!name) return false;
  return BIHAR_DISTRICT_NAMES.some(
    (d) => d.toLowerCase() === name.trim().toLowerCase()
  );
}
