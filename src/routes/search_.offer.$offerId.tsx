import { z } from 'zod'
import { Link, Await, createFileRoute, redirect } from '@tanstack/react-router'

import { authClient } from '#/lib/auth-client'
import { searchFlightsFn } from '#/server/flights'
import type { Flight, FlightResult, BookingOption } from '#/lib/serpapi'

import { airports } from '#/lib/airports'
import { fetchBookingOptionsFn } from '#/server/flights'

function cityName(iata: string): string {
  return airports.find((a) => a.iata === iata)?.city ?? iata
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function formatTime(dateTime: string): string {
  return dateTime.split(' ')[1] ?? dateTime
}

function OfferSkeleton() {
  return (
    <main className="page-wrap px-4 pb-8 pt-10">
      <div className="mb-6 h-4 w-32 animate-pulse rounded bg-[var(--border)]" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="island-shell mb-4 rounded-2xl p-5">
          <div className="space-y-3">
            <div className="h-4 w-1/3 animate-pulse rounded bg-[var(--border)]" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-[var(--border)]" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-[var(--border)]" />
          </div>
        </div>
      ))}
    </main>
  )
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

export const Route = createFileRoute('/search_/offer/$offerId')({
  validateSearch: searchSchema,
  beforeLoad: async () => {
    const session = await authClient.getSession()
    if (!session.data) throw redirect({ to: '/' })
  },
  loaderDeps: ({ search }) => search,
  loader: async ({ params, deps }) => {
    const data = await (searchFlightsFn({
      data: deps,
    }) as Promise<FlightResult>)
    const flights = [
      ...(data.best_flights ?? []),
      ...(data.other_flights ?? []),
    ]
    const offer = flights[Number(params.offerId)] ?? null

    const bookingOptionsPromise = offer?.booking_token
      ? fetchBookingOptionsFn({ data: { bookingToken: offer.booking_token } })
      : Promise.resolve(null)

    return { offer, search: deps, bookingOptionsPromise }
  },

  pendingComponent: OfferSkeleton,
  component: OfferPage,
})

function OfferPage() {
  const { offer, search, bookingOptionsPromise } = Route.useLoaderData()

  if (!offer) {
    return (
      <main className="page-wrap px-4 pb-8 pt-10">
        <div className="island-shell rounded-2xl p-10 text-center">
          <p className="mb-2 font-semibold text-[var(--sea-ink)]">
            Offer not found
          </p>
          <p className="mb-4 text-sm text-[var(--sea-ink-soft)]">
            This offer may have expired. Try searching again.
          </p>
          <Link
            to="/search"
            search={search}
            className="rounded-xl bg-[var(--lagoon-deep)] px-4 py-2 text-sm font-semibold text-[var(--btn-text)] no-underline"
          >
            Back to results
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="page-wrap px-4 pb-8 pt-10">
      <div className="mb-6">
        <Link
          to="/search"
          search={search}
          className="text-sm text-[var(--sea-ink-soft)] no-underline hover:text-[var(--sea-ink)]"
        >
          ← Back to results
        </Link>
      </div>
      <OfferHeader offer={offer} search={search} />
      <FlightTimeline offer={offer} />
      {offer.layovers && offer.layovers.length > 0 && (
        <Layovers offer={offer} />
      )}
      {offer.extensions && offer.extensions.length > 0 && (
        <FareNotes offer={offer} />
      )}
      {offer.carbon_emissions && <Emissions offer={offer} />}
      <BookingSection
        offer={offer}
        bookingOptionsPromise={bookingOptionsPromise}
      />
    </main>
  )
}

function OfferHeader({
  offer,
  search,
}: {
  offer: Flight
  search: {
    origin: string
    destination: string
    date: string
    returnDate?: string
    passengers: string
    travelClass: '1' | '2' | '3' | '4'
  }
}) {
  const classLabels: Record<string, string> = {
    '1': 'Economy',
    '2': 'Premium Economy',
    '3': 'Business',
    '4': 'First Class',
  }
  return (
    <div className="island-shell mb-4 rounded-2xl p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="island-kicker mb-1">Flight details</p>
          <h1 className="display-title text-2xl font-bold text-[var(--sea-ink)]">
            {cityName(search.origin)} → {cityName(search.destination)}
          </h1>
          <p className="mt-1 text-sm text-[var(--sea-ink-soft)]">
            {search.date}
            {search.returnDate ? ` — ${search.returnDate}` : ``} ·{` `}
            {search.passengers} pax · {classLabels[search.travelClass]}
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-[var(--lagoon-deep)]">
            €{offer.price}
          </p>
          <p className="text-xs text-[var(--sea-ink-soft)]">per person</p>
        </div>
      </div>
    </div>
  )
}

function FlightTimeline({ offer }: { offer: Flight }) {
  return (
    <div className="island-shell mb-4 rounded-2xl p-5">
      <p className="mb-4 text-sm font-semibold text-[var(--sea-ink)]">
        Flight details
      </p>
      <div className="space-y-4">
        {offer.flights.map((seg, i) => (
          <div key={i} className="flex gap-4">
            {seg.airline_logo && (
              <img
                src={seg.airline_logo}
                alt=""
                className="mt-0.5 h-6 w-6 flex-shrink-0 object-contain"
              />
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-[var(--sea-ink)]">
                    {formatTime(seg.departure_airport.time)}
                  </span>
                  <span className="mx-2 text-[var(--sea-ink-soft)]">→</span>
                  <span className="font-semibold text-[var(--sea-ink)]">
                    {formatTime(seg.arrival_airport.time)}
                  </span>
                </div>
                <span className="text-xs text-[var(--sea-ink-soft)]">
                  {formatDuration(seg.duration)}
                </span>
              </div>
              <p className="text-xs text-[var(--sea-ink-soft)]">
                {seg.departure_airport.id} → {seg.arrival_airport.id} ·{' '}
                {seg.airline} {seg.flight_number}
              </p>
              {seg.airplane && (
                <p className="text-xs text-[var(--sea-ink-soft)]">
                  {seg.airplane}
                  {seg.legroom ? ` · ${seg.legroom}` : ``}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Layovers({ offer }: { offer: Flight }) {
  return (
    <div className="island-shell mb-4 rounded-2xl p-5">
      <p className="mb-3 text-sm font-semibold text-[var(--sea-ink)]">
        Layovers
      </p>
      <div className="space-y-2">
        {offer.layovers!.map((l, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <span className="text-[var(--sea-ink)]">
              {l.name} ({l.id})
            </span>
            <span className="text-[var(--sea-ink-soft)]">
              {formatDuration(l.duration)}
              {l.overnight ? ' · overnight' : ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function FareNotes({ offer }: { offer: Flight }) {
  return (
    <div className="island-shell mb-4 rounded-2xl p-5">
      <p className="mb-3 text-sm font-semibold text-[var(--sea-ink)]">
        Fare notes
      </p>
      <ul className="space-y-1">
        {offer.extensions!.map((note, i) => (
          <li key={i} className="text-sm text-[var(--sea-ink-soft)]">
            • {note}
          </li>
        ))}
      </ul>
    </div>
  )
}

function Emissions({ offer }: { offer: Flight }) {
  const e = offer.carbon_emissions!
  const isLower = e.difference_percent < 0
  return (
    <div className="island-shell mb-4 rounded-2xl p-5">
      <p className="mb-1 text-sm font-semibold text-[var(--sea-ink)]">
        Carbon emissions
      </p>
      <p className="text-sm text-[var(--sea-ink-soft)]">
        {(e.this_flight / 1000).toFixed(0)} kg CO₂ ·{' '}
        <span className={isLower ? 'text-green-600' : 'text-orange-500'}>
          {Math.abs(e.difference_percent)}% {isLower ? 'below' : 'above'}{' '}
          average
        </span>
      </p>
    </div>
  )
}

function BookingSection({
  offer,
  bookingOptionsPromise,
}: {
  offer: Flight
  bookingOptionsPromise: Promise<{ booking_options?: BookingOption[] } | null>
}) {
  const staticOptions = offer.booking_options?.filter((o) => o.url) ?? []

  if (staticOptions.length > 0) {
    return (
      <div className="island-shell rounded-2xl p-5">
        <p className="mb-3 text-sm font-semibold text-[var(--sea-ink)]">
          Book this flight
        </p>
        <BookingOptions options={staticOptions} />
      </div>
    )
  }

  if (!offer.booking_token) {
    return (
      <div className="island-shell rounded-2xl p-5 text-center">
        <p className="mb-1 text-sm font-semibold text-[var(--sea-ink)]">
          Book this flight
        </p>
        <p className="text-sm text-[var(--sea-ink-soft)]">
          No booking links available for this flight.
        </p>
      </div>
    )
  }

  return (
    <div className="island-shell rounded-2xl p-5">
      <p className="mb-3 text-sm font-semibold text-[var(--sea-ink)]">
        Book this flight
      </p>
      <Await
        promise={bookingOptionsPromise}
        fallback={
          <div className="flex items-center gap-2 text-sm text-[var(--sea-ink-soft)]">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--line)] border-t-[var(--lagoon-deep)]" />
            Loading booking options…
          </div>
        }
      >
        {(result) => {
          const options = result?.booking_options?.filter((o) => o.url) ?? []
          if (options.length === 0) {
            return (
              <p className="text-sm text-[var(--sea-ink-soft)]">
                No booking links available for this flight.
              </p>
            )
          }
          return <BookingOptions options={options} />
        }}
      </Await>
    </div>
  )
}

function BookingOptions({ options }: { options: BookingOption[] }) {
  return (
    <div className="space-y-2">
      {options.map((opt, i) => (
        <a
          key={i}
          href={opt.url!}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between rounded-xl border border-[var(--line)] px-4 py-3 no-underline hover:border-[var(--lagoon)]"
        >
          <span className="text-sm font-semibold text-[var(--sea-ink)]">
            {opt.name ?? 'Book'}
          </span>
          {opt.price && (
            <span className="text-sm font-bold text-[var(--lagoon-deep)]">
              €{opt.price}
            </span>
          )}
        </a>
      ))}
    </div>
  )
}
