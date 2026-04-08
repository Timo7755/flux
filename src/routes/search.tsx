import { z } from 'zod'
import { Await, Link, createFileRoute, redirect } from '@tanstack/react-router'
import { authClient } from '#/lib/auth-client'
import FlightCard from '#/components/FlightCard'
import SearchForm from '#/components/SearchForm'
import type { FlightResult } from '#/lib/serpapi'
import { searchFlightsFn } from '#/server/flights'
import { airports } from '#/lib/airports'

function cityName(iata: string): string {
  return airports.find((a) => a.iata === iata)?.city ?? iata
}

const searchSchema = z.object({
  origin: z.string().length(3),
  destination: z.string().length(3),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  returnDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  tripType: z.enum(['1', '2']).default('2'),
  passengers: z.string().default('1'),
  travelClass: z.enum(['1', '2', '3', '4']).default('1'),
})

export const Route = createFileRoute('/search')({
  validateSearch: searchSchema,
  beforeLoad: async () => {
    const session = await authClient.getSession()
    if (!session.data) {
      throw redirect({ to: '/' })
    }
  },
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => ({
    flightsPromise: searchFlightsFn({ data: deps }) as Promise<FlightResult>,
  }),
  errorComponent: SearchError,
  component: SearchPage,
})

const classLabels: Record<string, string> = {
  '1': 'Economy',
  '2': 'Premium Economy',
  '3': 'Business',
  '4': 'First Class',
}

function SearchPage() {
  const {
    origin,
    destination,
    date,
    returnDate,
    tripType,
    passengers,
    travelClass,
  } = Route.useSearch()
  const { flightsPromise } = Route.useLoaderData()

  const displayDate = new Date(date + 'T00:00:00').toLocaleDateString('sl-SI', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const displayReturn = returnDate
    ? new Date(returnDate + 'T00:00:00').toLocaleDateString('sl-SI', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

  return (
    <main className="page-wrap px-4 pb-8 pt-10">
      <div className="mb-6">
        <SearchForm
          initialOrigin={origin}
          initialDestination={destination}
          initialDate={date}
          initialReturnDate={returnDate}
          initialTripType={tripType}
          initialPassengers={passengers}
          initialTravelClass={travelClass}
        />
      </div>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="island-kicker mb-1">Results</p>
          <h1 className="display-title text-3xl font-bold text-[var(--sea-ink)]">
            {cityName(origin)} → {cityName(destination)}
            {tripType === '1' && ` → ${cityName(origin)}`}
          </h1>
          <p className="mt-1 text-sm text-[var(--sea-ink-soft)]">
            {cityName(origin)} ({origin}) → {cityName(destination)} (
            {destination}){' · '}
            {displayDate}
            {displayReturn && ` — ${displayReturn}`}
            {' · '}
            {passengers} passenger{Number(passengers) > 1 ? 's' : ''}
            {' · '}
            {classLabels[travelClass]}
          </p>
        </div>
      </div>

      <Await promise={flightsPromise} fallback={<ResultsSpinner />}>
        {(data: FlightResult) => <SearchResults data={data} />}
      </Await>
    </main>
  )
}

function SearchResults({ data }: { data: FlightResult }) {
  const flights = [...(data.best_flights ?? []), ...(data.other_flights ?? [])]

  return (
    <>
      {data.price_insights && (
        <div className="island-shell mb-4 rounded-xl p-4 text-sm">
          <span className="font-semibold text-[var(--sea-ink)]">
            Price insight:{' '}
          </span>
          <span className="text-[var(--sea-ink-soft)]">
            Lowest available is{' '}
            <span className="font-semibold text-[var(--lagoon-deep)]">
              €{data.price_insights.lowest_price}
            </span>
            . Typical range: €{data.price_insights.typical_price_range[0]}–€
            {data.price_insights.typical_price_range[1]}.
          </span>
        </div>
      )}

      {flights.length === 0 ? (
        <div className="island-shell rounded-2xl p-10 text-center">
          <p className="text-[var(--sea-ink-soft)]">
            No flights found for this route and date.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {flights.map((flight, i) => (
            <FlightCard key={i} flight={flight} />
          ))}
        </div>
      )}
    </>
  )
}

function ResultsSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--line)] border-t-[var(--lagoon-deep)]" />
      <p className="text-sm text-[var(--sea-ink-soft)]">Searching flights…</p>
    </div>
  )
}

function SearchError({ error }: { error: Error }) {
  const isUnauth = error.message === 'Unauthorized'
  return (
    <main className="page-wrap px-4 pb-8 pt-10">
      <div className="island-shell rounded-2xl p-10 text-center">
        <p className="mb-2 font-semibold text-[var(--sea-ink)]">
          {isUnauth ? 'Sign in required' : 'Something went wrong'}
        </p>
        <p className="mb-4 text-sm text-[var(--sea-ink-soft)]">
          {isUnauth
            ? 'You need to be signed in to search for flights.'
            : error.message}
        </p>
        <Link
          to="/"
          className="rounded-xl bg-[var(--lagoon-deep)] px-4 py-2 text-sm font-semibold text-[var(--btn-text)] no-underline"
        >
          {isUnauth ? 'Sign in' : 'Go home'}
        </Link>
      </div>
    </main>
  )
}
