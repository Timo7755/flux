import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import DateRangePicker from './DateRangePicker'
import { authClient } from '#/lib/auth-client'
import AirportCombobox from './AirportCombobox'

type Props = {
  initialOrigin?: string
  initialDestination?: string
  initialDate?: string
  initialReturnDate?: string
  initialTripType?: '1' | '2'
  initialPassengers?: string
  initialTravelClass?: '1' | '2' | '3' | '4'
}

function ChevronDown() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="pointer-events-none"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

function Select({
  value,
  onChange,
  children,
}: {
  value: string
  onChange: (v: string) => void
  children: React.ReactNode
}) {
  return (
    <div className="relative inline-flex items-center">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none cursor-pointer rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] py-2.5 pl-3 pr-8 text-sm text-[var(--input-text)] outline-none focus:border-[var(--input-border-focus)] focus:bg-[var(--input-bg-focus)]"
      >
        {children}
      </select>
      <span className="pointer-events-none absolute right-2.5 text-[var(--text-muted)]">
        <ChevronDown />
      </span>
    </div>
  )
}

export default function SearchForm({
  initialOrigin = '',
  initialDestination = '',
  initialDate = '',
  initialReturnDate = '',
  initialTripType = '2',
  initialPassengers = '1',
  initialTravelClass = '1',
}: Props) {
  const { data: session } = authClient.useSession()
  const navigate = useNavigate()
  const [origin, setOrigin] = useState(initialOrigin)
  const [destination, setDestination] = useState(initialDestination)
  const [date, setDate] = useState(initialDate)
  const [returnDate, setReturnDate] = useState(initialReturnDate)
  const [tripType, setTripType] = useState<'1' | '2'>(initialTripType)
  const [passengers, setPassengers] = useState(initialPassengers)
  const [travelClass, setTravelClass] = useState<'1' | '2' | '3' | '4'>(
    initialTravelClass,
  )

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!session) {
      void navigate({ to: '/' })
      return
    }
    if (!origin || !destination || !date) return
    if (tripType === '1' && !returnDate) return
    void navigate({
      to: '/search',
      search: {
        origin,
        destination,
        date,
        ...(tripType === '1' && returnDate ? { returnDate } : {}),
        tripType,
        passengers,
        travelClass,
      },
    })
  }

  return (
    <form onSubmit={handleSearch} className="card p-4 sm:p-6">
      {/* Row 1: trip options */}
      <div className="mb-4 flex flex-wrap gap-2">
        <Select value={tripType} onChange={(v) => setTripType(v as '1' | '2')}>
          <option value="2">One way</option>
          <option value="1">Round trip</option>
        </Select>

        <Select value={passengers} onChange={setPassengers}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <option key={n} value={String(n)}>
              {n} passenger{n > 1 ? 's' : ''}
            </option>
          ))}
        </Select>

        <Select
          value={travelClass}
          onChange={(v) => setTravelClass(v as '1' | '2' | '3' | '4')}
        >
          <option value="1">Economy</option>
          <option value="2">Premium Economy</option>
          <option value="3">Business</option>
          <option value="4">First Class</option>
        </Select>
      </div>

      {/* Row 2: airports  */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
        <AirportCombobox
          label="From"
          value={origin}
          onChange={setOrigin}
          placeholder="City or airport"
        />
        <AirportCombobox
          label="To"
          value={destination}
          onChange={setDestination}
          placeholder="City or airport"
        />

        <DateRangePicker
          date={date}
          returnDate={returnDate}
          tripType={tripType}
          onDateChange={setDate}
          onReturnDateChange={setReturnDate}
          onTripTypeChange={setTripType}
        />
      </div>

      <button
        type="submit"
        className="mt-4 w-full rounded-xl bg-[var(--brand-deep)] px-6 py-3 text-sm font-semibold text-[var(--btn-text)] transition hover:opacity-90 active:scale-[0.99]"
      >
        Search flights
      </button>
    </form>
  )
}
