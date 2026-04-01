import { Link, createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import FlightCard from '#/components/FlightCard'
import SearchForm from '#/components/SearchForm'
import { searchFlightsFn } from '#/server/flights'

const searchSchema = z.object({
  origin: z.string().length(3),
  destination: z.string().length(3),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

export const Route = createFileRoute('/search')({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => searchFlightsFn({ data: deps }),
  pendingComponent: SearchPending,
  errorComponent: SearchError,
  component: SearchPage,
})

function SearchPage() {
  const { origin, destination, date } = Route.useSearch()
  const data = Route.useLoaderData()
  const flights = [...(data.best_flights ?? []), ...(data.other_flights ?? [])]

  const displayDate = new Date(date + 'T00:00:00').toLocaleDateString('sl-SI', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <main className="page-wrap px-4 pb-8 pt-10">
      <div className="mb-6">
        <SearchForm
          initialOrigin={origin}
          initialDestination={destination}
          initialDate={date}
        />
      </div>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="island-kicker mb-1">Results</p>
          <h1 className="display-title text-3xl font-bold text-[var(--sea-ink)]">
            {origin} → {destination}
          </h1>
          <p className="mt-1 text-sm text-[var(--sea-ink-soft)]">
            {displayDate}
          </p>
        </div>
        <p className="text-sm text-[var(--sea-ink-soft)]">
          {flights.length} flight{flights.length !== 1 ? 's' : ''} found
        </p>
      </div>

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
    </main>
  )
}

function SearchPending() {
  return (
    <main className="page-wrap px-4 pb-8 pt-10">
      <div className="island-shell mb-6 rounded-2xl p-4 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-xl bg-[var(--line)]"
            />
          ))}
        </div>
        <div className="mt-4 h-11 animate-pulse rounded-xl bg-[var(--line)]" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="island-shell h-24 animate-pulse rounded-2xl"
          />
        ))}
      </div>
    </main>
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
          to={isUnauth ? '/sign-in' : '/'}
          className="rounded-xl bg-[var(--lagoon-deep)] px-4 py-2 text-sm font-semibold text-white no-underline"
        >
          {isUnauth ? 'Sign in' : 'Go home'}
        </Link>
      </div>
    </main>
  )
}
