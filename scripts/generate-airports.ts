import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

const csv = readFileSync(resolve('airports.csv'), 'utf-8')
const lines = csv.trim().split('\n')

// Parse CSV respecting quoted fields
function parseLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current)
  return result
}

const headers = parseLine(lines[0])
const idxType = headers.indexOf('type')
const idxName = headers.indexOf('name')
const idxCountry = headers.indexOf('iso_country')
const idxMunicipality = headers.indexOf('municipality')
const idxIata = headers.indexOf('iata_code')
const idxScheduled = headers.indexOf('scheduled_service')

// Country code to name map
const countryNames: Record<string, string> = {
  SI: 'Slovenia',
  AT: 'Austria',
  DE: 'Germany',
  IT: 'Italy',
  FR: 'France',
  ES: 'Spain',
  PT: 'Portugal',
  NL: 'Netherlands',
  BE: 'Belgium',
  CH: 'Switzerland',
  GB: 'United Kingdom',
  IE: 'Ireland',
  DK: 'Denmark',
  SE: 'Sweden',
  NO: 'Norway',
  FI: 'Finland',
  PL: 'Poland',
  CZ: 'Czech Republic',
  HU: 'Hungary',
  SK: 'Slovakia',
  RO: 'Romania',
  BG: 'Bulgaria',
  HR: 'Croatia',
  RS: 'Serbia',
  BA: 'Bosnia and Herzegovina',
  ME: 'Montenegro',
  MK: 'North Macedonia',
  AL: 'Albania',
  XK: 'Kosovo',
  GR: 'Greece',
  TR: 'Turkey',
  UA: 'Ukraine',
  BY: 'Belarus',
  MD: 'Moldova',
  LT: 'Lithuania',
  LV: 'Latvia',
  EE: 'Estonia',
  RU: 'Russia',
  US: 'USA',
  CA: 'Canada',
  MX: 'Mexico',
  BR: 'Brazil',
  AR: 'Argentina',
  CL: 'Chile',
  CO: 'Colombia',
  PE: 'Peru',
  CU: 'Cuba',
  DO: 'Dominican Republic',
  AU: 'Australia',
  NZ: 'New Zealand',
  JP: 'Japan',
  CN: 'China',
  KR: 'South Korea',
  HK: 'Hong Kong',
  SG: 'Singapore',
  TH: 'Thailand',
  MY: 'Malaysia',
  ID: 'Indonesia',
  PH: 'Philippines',
  IN: 'India',
  AE: 'UAE',
  QA: 'Qatar',
  SA: 'Saudi Arabia',
  KW: 'Kuwait',
  BH: 'Bahrain',
  IL: 'Israel',
  JO: 'Jordan',
  EG: 'Egypt',
  MA: 'Morocco',
  TN: 'Tunisia',
  ZA: 'South Africa',
  KE: 'Kenya',
  NG: 'Nigeria',
  ET: 'Ethiopia',
  TZ: 'Tanzania',
  LU: 'Luxembourg',
  MT: 'Malta',
  CY: 'Cyprus',
  IS: 'Iceland',
  LI: 'Liechtenstein',
  MC: 'Monaco',
  SM: 'San Marino',
  AD: 'Andorra',
}

const airports: Array<{
  iata: string
  name: string
  city: string
  country: string
}> = []
const seen = new Set<string>()

for (let i = 1; i < lines.length; i++) {
  const cols = parseLine(lines[i])
  const type = cols[idxType]
  const iata = cols[idxIata]
  const scheduled = cols[idxScheduled]
  const countryCode = cols[idxCountry]

  // Only airports with IATA codes that have scheduled service
  if (!iata || iata.length !== 3) continue
  if (scheduled !== 'yes') continue
  if (seen.has(iata)) continue

  // Only include proper airports (not heliports, seaplane bases etc.)
  const validTypes = ['large_airport', 'medium_airport', 'small_airport']
  if (!validTypes.includes(type)) continue

  const name = cols[idxName]
  const city = cols[idxMunicipality] || name
  const country = countryNames[countryCode] ?? countryCode

  seen.add(iata)
  airports.push({ iata, name, city, country })
}

// Sort: large airports first (already filtered), then alphabetically by country then city
airports.sort((a, b) => {
  const cc = a.country.localeCompare(b.country)
  if (cc !== 0) return cc
  return a.city.localeCompare(b.city)
})

const lines_out = [
  `export type Airport = {`,
  `  iata: string`,
  `  name: string`,
  `  city: string`,
  `  country: string`,
  `}`,
  ``,
  `export const airports: Airport[] = [`,
  ...airports.map(
    (a) =>
      `  { iata: '${a.iata}', name: ${JSON.stringify(a.name)}, city: ${JSON.stringify(a.city)}, country: ${JSON.stringify(a.country)} },`,
  ),
  `]`,
  ``,
  `export function searchAirports(query: string): Airport[] {`,
  `  if (query.length < 1) return []`,
  `  const q = query.toLowerCase()`,
  `  return airports`,
  `    .filter(`,
  `      (a) =>`,
  `        a.iata.toLowerCase().startsWith(q) ||`,
  `        a.city.toLowerCase().includes(q) ||`,
  `        a.country.toLowerCase().includes(q) ||`,
  `        a.name.toLowerCase().includes(q),`,
  `    )`,
  `    .slice(0, 8)`,
  `}`,
]

writeFileSync(resolve('src/lib/airports.ts'), lines_out.join('\n'), 'utf-8')
console.log(`Generated ${airports.length} airports → src/lib/airports.ts`)
