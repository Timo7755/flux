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
  legroom?: string
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
  type?: string
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

export type SearchOptions = {
  origin: string
  destination: string
  date: string
  returnDate?: string
  tripType: '1' | '2'
  passengers: string
  travelClass: '1' | '2' | '3' | '4'
}

export async function searchFlights(
  opts: SearchOptions,
): Promise<FlightResult> {
  const params: Record<string, string> = {
    engine: 'google_flights',
    departure_id: opts.origin,
    arrival_id: opts.destination,
    outbound_date: opts.date,
    type: opts.tripType,
    adults: opts.passengers,
    travel_class: opts.travelClass,
    currency: 'EUR',
    hl: 'en',
  }

  if (opts.tripType === '1' && opts.returnDate) {
    params.return_date = opts.returnDate
  }

  return fetchSerpApi<FlightResult>(params)
}
