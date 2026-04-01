import { Link } from '@tanstack/react-router'

import { authClient } from '#/lib/auth-client'
import ThemeToggle from './ThemeToggle'

export default function Header() {
  const { data: session, isPending } = authClient.useSession()

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--header-bg)] px-4 backdrop-blur-lg">
      <nav className="page-wrap flex items-center gap-4 py-3 sm:py-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1.5 text-sm font-semibold text-[var(--sea-ink)] no-underline shadow-sm"
        >
          <span className="h-2 w-2 rounded-full bg-[linear-gradient(90deg,#56c6be,#7ed3bf)]" />
          Flux
        </Link>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />

          {isPending ? (
            <div className="h-9 w-20 animate-pulse rounded-xl bg-[var(--line)]" />
          ) : session?.user ? (
            <div className="flex items-center gap-2">
              <span className="hidden text-sm text-[var(--sea-ink-soft)] sm:block">
                {session.user.name}
              </span>
              <button
                onClick={() =>
                  void authClient.signOut({
                    fetchOptions: {
                      onSuccess: () => {
                        window.location.href = '/'
                      },
                    },
                  })
                }
                className="rounded-xl border border-[var(--line)] bg-white/60 px-4 py-2 text-sm font-medium text-[var(--sea-ink)] transition hover:bg-white/80"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              to="/sign-in"
              className="rounded-xl border border-[var(--line)] bg-white/60 px-4 py-2 text-sm font-medium text-[var(--sea-ink)] no-underline transition hover:bg-white/80"
            >
              Sign in
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}
