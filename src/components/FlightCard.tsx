import type { Flight } from '#/lib/serpapi'

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function formatTime(dateTime: string): string {
  return dateTime.split(' ')[1] ?? dateTime
}

export default function FlightCard({ flight }: { flight: Flight }) {
  const first = flight.flights[0]
  const last = flight.flights[flight.flights.length - 1]
  const stops = flight.flights.length - 1

  if (!first || !last) return null

  return (
    <div className="island-shell rounded-2xl p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex w-28 flex-shrink-0 items-center gap-2">
          {flight.airline_logo && (
            <img
              src={flight.airline_logo}
              alt=""
              className="h-6 w-6 object-contain"
            />
          )}
          <span className="truncate text-sm text-[var(--sea-ink-soft)]">
            {first.airline}
          </span>
        </div>

        <div className="flex flex-1 items-center justify-center gap-3">
          <div className="text-right">
            <p className="text-lg font-bold text-[var(--sea-ink)]">
              {formatTime(first.departure_airport.time)}
            </p>
            <p className="text-xs text-[var(--sea-ink-soft)]">
              {first.departure_airport.id}
            </p>
          </div>

          <div className="flex flex-1 flex-col items-center gap-0.5">
            <p className="text-xs text-[var(--sea-ink-soft)]">
              {formatDuration(flight.total_duration)}
            </p>
            <div className="flex w-full items-center gap-1">
              <div className="h-px flex-1 bg-[var(--line)]" />
              <div className="h-1.5 w-1.5 rounded-full bg-[var(--lagoon)]" />
              <div className="h-px flex-1 bg-[var(--line)]" />
            </div>
            <p className="text-xs text-[var(--sea-ink-soft)]">
              {stops === 0 ? 'Direct' : `${stops} stop${stops > 1 ? 's' : ''}`}
            </p>
          </div>

          <div>
            <p className="text-lg font-bold text-[var(--sea-ink)]">
              {formatTime(last.arrival_airport.time)}
            </p>
            <p className="text-xs text-[var(--sea-ink-soft)]">
              {last.arrival_airport.id}
            </p>
          </div>
        </div>

        <div className="flex-shrink-0 text-right">
          <p className="text-xl font-bold text-[var(--lagoon-deep)]">
            €{flight.price}
          </p>
          <p className="text-xs text-[var(--sea-ink-soft)]">per person</p>
        </div>
      </div>
    </div>
  )
}
