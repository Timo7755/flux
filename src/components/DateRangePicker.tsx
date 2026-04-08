import { useEffect, useRef, useState } from 'react'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/style.css'
import type { DateRange } from 'react-day-picker'

type Props = {
  date: string
  returnDate: string
  tripType: '1' | '2'
  onDateChange: (date: string) => void
  onReturnDateChange: (date: string) => void
  onTripTypeChange: (type: '1' | '2') => void
}

function formatDisplay(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('sl-SI', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function toDateStr(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function DateRangePicker({
  date,
  returnDate,
  tripType,
  onDateChange,
  onReturnDateChange,
  onTripTypeChange,
}: Props) {
  const [open, setOpen] = useState(false)
  const [activeField, setActiveField] = useState<'from' | 'to'>('from')
  const [hoverDate, setHoverDate] = useState<Date | undefined>()
  const [month, setMonth] = useState<Date>(new Date())
  const containerRef = useRef<HTMLDivElement>(null)

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

  const fromDate = date ? new Date(date + 'T00:00:00') : undefined
  const toDate = returnDate ? new Date(returnDate + 'T00:00:00') : undefined

  function openFrom() {
    setActiveField('from')
    setMonth(fromDate ?? new Date())
    setOpen(true)
  }

  function openTo() {
    if (tripType === '2') {
      onReturnDateChange('') // clear stale return date
      onTripTypeChange('1') // switch to round trip
    }
    setActiveField('to')
    setMonth(toDate ?? fromDate ?? new Date())
    setOpen(true)
  }

  function handleDayClick(day: Date) {
    if (tripType === '2') {
      onDateChange(toDateStr(day))
      setOpen(false)
      return
    }

    if (activeField === 'from') {
      onDateChange(toDateStr(day))
      setHoverDate(undefined)

      if (!toDate || day >= toDate) {
        // new departure is after (or same as) return — clear return, go pick it
        onReturnDateChange('')
        setActiveField('to')
      } else {
        // return is still valid after new departure — just close
        setOpen(false)
      }
      return
    }

    // activeField === 'to'
    if (fromDate && day > fromDate) {
      onReturnDateChange(toDateStr(day))
      setOpen(false)
    }
  }

  function handleClear() {
    onDateChange('')
    onReturnDateChange('')
    setHoverDate(undefined)
    setOpen(false)
  }

  const pickerRange: DateRange = {
    from: fromDate,
    to:
      activeField === 'to' && hoverDate && fromDate && hoverDate > fromDate
        ? hoverDate
        : toDate,
  }

  const triggerClass = (field: 'from' | 'to') =>
    [
      'w-full rounded-xl border px-4 py-3 text-sm text-left outline-none transition cursor-pointer',
      open && activeField === field
        ? 'border-blue-500 ring-2 ring-blue-500/30 bg-[var(--input-bg)]'
        : 'border-[var(--input-border)] bg-[var(--input-bg)] hover:border-[var(--input-border-focus)]',
    ].join(' ')

  return (
    <div
      ref={containerRef}
      className="relative col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3"
    >
      {/* Departure */}
      <div className="flex flex-col gap-1 text-left">
        <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
          Departure
        </label>
        <button
          type="button"
          onClick={openFrom}
          className={triggerClass('from')}
        >
          {date ? (
            <span className="text-[var(--input-text)]">
              {formatDisplay(date)}
            </span>
          ) : (
            <span className="text-[var(--input-placeholder)]">Select date</span>
          )}
        </button>
      </div>

      {/* Return */}
      <div className="flex flex-col gap-1 text-left">
        <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
          Return
        </label>
        <button
          type="button"
          onClick={openTo}
          className={`${triggerClass('to')} ${tripType === '2' ? 'opacity-60' : ''}`}
        >
          {returnDate && tripType === '1' ? (
            <span className="text-[var(--input-text)]">
              {formatDisplay(returnDate)}
            </span>
          ) : (
            <span className="text-[var(--input-placeholder)]">
              {tripType === '2' ? 'One way' : 'Select date'}
            </span>
          )}
        </button>
      </div>

      {/* Calendar popover */}
      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 rounded-2xl border border-[var(--dropdown-border)] bg-[var(--dropdown-bg)] p-4 shadow-xl">
          {tripType === '2' ? (
            <DayPicker
              mode="single"
              selected={fromDate}
              month={month}
              onMonthChange={setMonth}
              onDayClick={handleDayClick}
              disabled={{ before: new Date() }}
            />
          ) : (
            <DayPicker
              mode="range"
              selected={pickerRange}
              month={month}
              onMonthChange={setMonth}
              onDayClick={handleDayClick}
              onDayMouseEnter={(day: Date) => {
                if (activeField === 'to') setHoverDate(day)
              }}
              onDayMouseLeave={() => setHoverDate(undefined)}
              disabled={{ before: new Date() }}
            />
          )}
          <div className="mt-3 flex items-center justify-between border-t border-[var(--border)] pt-3">
            <span className="text-xs text-[var(--text-muted)]">
              {activeField === 'from'
                ? 'Select departure date'
                : 'Now select return date'}
            </span>
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-[var(--text-muted)] transition-colors hover:text-[var(--text-secondary)]"
            >
              Clear dates
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
