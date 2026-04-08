import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { useState } from 'react'

import Footer from '../components/Footer'
import Header from '../components/Header'
import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'
import appCss from '../styles.css?url'
import { authClient } from '#/lib/auth-client'

import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Flux — Flight Deals' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession()

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="font-sans antialiased [overflow-wrap:anywhere]">
        {isPending ? (
          <Loading />
        ) : !session ? (
          <SignInView />
        ) : (
          <>
            <Header />
            {children}
          </>
        )}
        <Footer />
        <TanStackDevtools
          config={{ position: 'bottom-right' }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}

function Loading() {
  return (
    <div className="flex min-h-screen justify-center px-4 pt-[20vh]">
      <div
        className="h-8 w-8 rounded-full border-4 border-[var(--border)] border-t-[var(--brand)]"
        style={{ animation: 'spin 0.8s linear infinite' }}
      />
    </div>
  )
}

function SignInView() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)

  async function handleGoogleSignIn() {
    await authClient.signIn.social({ provider: 'google', callbackURL: '/' })
  }

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await authClient.signIn.email({
      email,
      password,
      callbackURL: '/',
    })
    if (result.error) setError(result.error.message ?? 'Invalid credentials')
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div
        className="card rise-in w-full max-w-sm p-8"
        style={{ minHeight: '500px' }}
      >
        {/* Logo */}
        <div className="mb-6 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[var(--brand)]" />
          <span className="text-sm font-semibold text-[var(--text-primary)]">
            Flux
          </span>
        </div>

        <h1 className="display-title mb-1 text-2xl font-bold text-[var(--text-primary)]">
          Sign in
        </h1>
        <p className="mb-6 text-sm text-[var(--text-secondary)]">
          Flights search tool powered by Google Flights.
        </p>

        {/* Google button */}
        <button
          onClick={handleGoogleSignIn}
          className="group flex w-full items-center justify-center gap-3 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-sm font-semibold text-[var(--text-primary)] transition-all duration-200 hover:border-[var(--brand)] hover:bg-[var(--input-bg-focus)] hover:shadow-md active:scale-[0.98]"
        >
          <span className="transition-transform duration-200 group-hover:scale-110">
            <GoogleIcon />
          </span>
          Continue with Google
        </button>

        {/* Divider */}
        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-[var(--border)]" />
          <span className="text-xs text-[var(--text-muted)]">or</span>
          <div className="h-px flex-1 bg-[var(--border)]" />
        </div>

        {/* Admin toggle */}
        <button
          type="button"
          onClick={() => setShowAdmin((v) => !v)}
          className="w-full text-center text-xs text-[var(--text-muted)] transition-colors hover:text-[var(--text-secondary)]"
        >
          {showAdmin ? '↑ Hide admin sign in' : 'Admin sign in'}
        </button>

        {/* Admin form — no layout shift because card has minHeight */}
        <div
          style={{
            display: 'grid',
            gridTemplateRows: showAdmin ? '1fr' : '0fr',
            transition: 'grid-template-rows 250ms ease',
          }}
        >
          <div style={{ overflow: 'hidden' }}>
            <form onSubmit={handleEmailSignIn} className="mt-4 space-y-3">
              {error && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                  {error}
                </p>
              )}
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-sm text-[var(--input-text)] outline-none placeholder:text-[var(--input-placeholder)] focus:border-[var(--input-border-focus)] focus:bg-[var(--input-bg-focus)]"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-sm text-[var(--input-text)] outline-none placeholder:text-[var(--input-placeholder)] focus:border-[var(--input-border-focus)] focus:bg-[var(--input-bg-focus)]"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[var(--brand-deep)] px-4 py-3 text-sm font-semibold text-[var(--btn-text)] transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.96L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  )
}
