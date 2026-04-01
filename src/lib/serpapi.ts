import { env } from '#/env'

const BASE_URL = 'https://serpapi.com/search'

function buildUrl(params: Record<string, string>): string {
  const searchParams = new URLSearchParams({
    ...params,
    api_key: env.SERPAPI_KEY,
  })
  return `${BASE_URL}?${searchParams.toString()}`
}

async function fetchSerpApi<T>(params: Record<string, string>): Promise<T> {
  const url = buildUrl(params)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`SerpAPI error: ${res.status} ${res.statusText}`)
  return res.json() as Promise<T>
}

export type FlightSegment = {
  departure_airport: { name: string; id: string; time: string }
  arrival_airport: { name: string; id: string; time: string }
  duration: number
  airline: string
  airline_logo: string
  flight_number: string
  airplane?: string
  travel_class?: string
}

export type Layover = {
  duration: number
  name: string
  id: string
  overnight?: boolean
}

export type Flight = {
  flights: FlightSegment[]
  layovers?: Layover[]
  total_duration: number
  price: number
  airline_logo?: string
  departure_token?: string
  carbon_emissions?: {
    this_flight: number
    typical_for_this_route: number
    difference_percent: number
  }
}

export type FlightResult = {
  best_flights?: Flight[]
  other_flights?: Flight[]
  price_insights?: {
    lowest_price: number
    price_level: string
    typical_price_range: [number, number]
  }
}

export async function searchFlights(
  origin: string,
  destination: string,
  date: string,
): Promise<FlightResult> {
  return fetchSerpApi<FlightResult>({
    engine: 'google_flights',
    departure_id: origin,
    arrival_id: destination,
    outbound_date: date,
    type: '2',
    currency: 'EUR',
    hl: 'en',
  })
}
