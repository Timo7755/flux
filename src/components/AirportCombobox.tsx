import { useEffect, useRef, useState } from 'react'
import { airports, searchAirports, getAirportByIata } from '#/lib/airports'
import type { Airport } from '#/lib/airports'

type Props = {
  label: string
  value: string
  onChange: (iata: string) => void
  placeholder?: string
}

export default function AirportCombobox({
  label,
  value,
  onChange,
  placeholder = 'Country, city or airport',
}: Props) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [results, setResults] = useState<Airport[]>([])
  const [selected, setSelected] = useState<Airport | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (value && !selected) {
      const found = airports.find((a) => a.iata === value)
      if (found) setSelected(found)
    }
  }, [value, selected])

  useEffect(() => {
    setResults(searchAirports(query))
  }, [query])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function select(airport: Airport) {
    setSelected(airport)
    setQuery('')
    setOpen(false)
    onChange(airport.iata)
    saveToHistory(airport.iata)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value)
    setSelected(null)
    onChange('')
    setOpen(true)
  }

  function handleFocus() {
    setOpen(true)
  }

  const regionNames = new Intl.DisplayNames(['en'], { type: 'region' })

  function resolveCountry(code: string): string {
    if (code.length !== 2) return code
    try {
      return regionNames.of(code.toUpperCase()) ?? code
    } catch {
      return code
    }
  }

  const HISTORY_KEY = 'flux_airport_history'

  function useAirportHistory() {
    function getHistory(): Airport[] {
      try {
        const raw = localStorage.getItem(HISTORY_KEY)
        const codes: string[] = raw ? JSON.parse(raw) : []
        return codes.map(getAirportByIata).filter(Boolean) as Airport[]
      } catch {
        return []
      }
    }

    function saveToHistory(iata: string) {
      try {
        const raw = localStorage.getItem(HISTORY_KEY)
        const codes: string[] = raw ? JSON.parse(raw) : []
        const updated = [iata, ...codes.filter((c) => c !== iata)].slice(0, 5)
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
      } catch {}
    }

    return { getHistory, saveToHistory }
  }

  const { getHistory, saveToHistory } = useAirportHistory()

  return (
    <div ref={containerRef} className="flex flex-col gap-1 text-left">
      <label className="text-xs font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
        {label}
      </label>

      <div className="relative">
        {selected ? (
          <button
            type="button"
            onClick={() => {
              setSelected(null)
              onChange('')
              setOpen(true)
            }}
            className="flex w-full items-center justify-between rounded-xl border border-[var(--input-border-focus)] bg-[var(--input-bg-focus)] px-6 py-3.5 text-left transition hover:bg-[var(--input-bg-focus)]"
          >
            <div>
              <span className="block text-sm font-semibold text-[var(--input-text)]">
                {selected.city}
              </span>
              <span className="block text-xs text-[var(--input-placeholder)]">
                {selected.name} · {resolveCountry(selected.country)}
              </span>
            </div>
            <span className="block text-xs text-[var(--input-placeholder)] mt-0.5">
              {selected.iata}
            </span>
          </button>
        ) : (
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleFocus}
            placeholder={placeholder}
            className="w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-sm text-[var(--input-text)] outline-none placeholder:text-[var(--input-placeholder)] focus:border-[var(--input-border-focus)] focus:bg-[var(--input-bg-focus)]"
          />
        )}

        {open &&
          (() => {
            const items = query.length > 0 ? results : getHistory()
            if (items.length === 0) return null
            return (
              <ul
                className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-y-auto rounded-xl border border-[var(--dropdown-border)] shadow-xl"
                style={{ background: 'var(--dropdown-bg)' }}
              >
                {query.length === 0 && (
                  <li className="px-4 pt-3 pb-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
                      Recent
                    </span>
                  </li>
                )}
                {items.map((airport) => (
                  <li key={airport.iata}>
                    <button
                      type="button"
                      onMouseDown={() => select(airport)}
                      className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors"
                      style={{ background: 'transparent' }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          'var(--dropdown-hover)')
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = 'transparent')
                      }
                    >
                      <div className="flex flex-col gap-1 w-full">
                        <span className="block text-sm font-semibold text-[var(--input-text)]">
                          {airport.city}
                          <span className="ml-1 font-normal text-[var(--input-placeholder)]">
                            — {resolveCountry(airport.country)}
                          </span>
                        </span>
                        <span className="block text-xs text-[var(--input-placeholder)]">
                          {airport.name}
                        </span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )
          })()}
      </div>
    </div>
  )
}
