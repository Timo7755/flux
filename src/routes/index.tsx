import { createFileRoute } from '@tanstack/react-router'

import SearchForm from '#/components/SearchForm'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <main className="page-wrap px-4 pb-8 pt-16 sm:pt-24">
      <section className="mx-auto max-w-2xl text-center">
        <p className="island-kicker mb-4">Flight Deals</p>

        <p className="mb-10 text-lg text-[var(--sea-ink-soft)]">
          Search real-time Google Flights data. Set an origin, pick a
          destination, and discover the best prices for any date.
        </p>
        <SearchForm />
      </section>
    </main>
  )
}
