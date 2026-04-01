import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

import { authClient } from '#/lib/auth-client'

type Props = {
  initialOrigin?: string
  initialDestination?: string
  initialDate?: string
}

export default function SearchForm({
  initialOrigin = '',
  initialDestination = '',
  initialDate = '',
}: Props) {
  const { data: session } = authClient.useSession()
  const navigate = useNavigate()
  const [origin, setOrigin] = useState(initialOrigin)
  const [destination, setDestination] = useState(initialDestination)
  const [date, setDate] = useState(initialDate)

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!session) {
      void navigate({ to: '/sign-in' })
      return
    }
    void navigate({
      to: '/search',
      search: {
        origin: origin.toUpperCase(),
        destination: destination.toUpperCase(),
        date,
      },
    })
  }

  return (
    <form
      onSubmit={handleSearch}
      className="island-shell rounded-2xl p-4 sm:p-6"
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="flex flex-col gap-1 text-left">
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
            From
          </label>
          <input
            type="text"
            placeholder="e.g. LJU"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            maxLength={3}
            required
            className="rounded-xl border border-[var(--line)] bg-white/60 px-4 py-3 text-sm font-semibold uppercase tracking-widest text-[var(--sea-ink)] outline-none placeholder:normal-case placeholder:tracking-normal placeholder:text-[var(--sea-ink-soft)] focus:border-[var(--lagoon)] focus:bg-white/80"
          />
        </div>

        <div className="flex flex-col gap-1 text-left">
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
            To
          </label>
          <input
            type="text"
            placeholder="e.g. JFK"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            maxLength={3}
            required
            className="rounded-xl border border-[var(--line)] bg-white/60 px-4 py-3 text-sm font-semibold uppercase tracking-widest text-[var(--sea-ink)] outline-none placeholder:normal-case placeholder:tracking-normal placeholder:text-[var(--sea-ink-soft)] focus:border-[var(--lagoon)] focus:bg-white/80"
          />
        </div>

        <div className="flex flex-col gap-1 text-left">
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            min={new Date().toISOString().split('T')[0]}
            className="rounded-xl border border-[var(--line)] bg-white/60 px-4 py-3 text-sm text-[var(--sea-ink)] outline-none focus:border-[var(--lagoon)] focus:bg-white/80"
          />
        </div>
      </div>

      <button
        type="submit"
        className="mt-4 w-full rounded-xl bg-[var(--lagoon-deep)] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
      >
        {session ? 'Search flights' : 'Sign in to search'}
      </button>
    </form>
  )
}
