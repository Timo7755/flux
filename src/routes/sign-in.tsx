import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import { authClient } from '#/lib/auth-client'

export const Route = createFileRoute('/sign-in')({
  component: SignInPage,
})

function SignInPage() {
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
    if (result.error) {
      setError(result.error.message ?? 'Invalid credentials')
    }
    setLoading(false)
  }

  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <div className="mx-auto max-w-md">
        <div className="island-shell rise-in rounded-2xl p-8">
          <p className="island-kicker mb-3">Flux</p>
          <h1 className="display-title mb-2 text-3xl font-bold text-[var(--sea-ink)]">
            Sign in
          </h1>
          <p className="mb-8 text-sm text-[var(--sea-ink-soft)]">
            Sign in to search for flight deals and save your searches.
          </p>

          <button
            onClick={handleGoogleSignIn}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-[var(--line)] bg-white/60 px-4 py-3 text-sm font-semibold text-[var(--sea-ink)] transition hover:bg-white/80"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-[var(--line)]" />
            <span className="text-xs text-[var(--sea-ink-soft)]">or</span>
            <div className="h-px flex-1 bg-[var(--line)]" />
          </div>

          <button
            type="button"
            onClick={() => setShowAdmin((v) => !v)}
            className="w-full text-center text-xs text-[var(--sea-ink-soft)] transition hover:text-[var(--sea-ink)]"
          >
            {showAdmin ? 'Hide admin sign in' : 'Admin sign in'}
          </button>

          {showAdmin && (
            <form onSubmit={handleEmailSignIn} className="mt-4 space-y-3">
              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
                  {error}
                </p>
              )}
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-[var(--line)] bg-white/60 px-4 py-3 text-sm text-[var(--sea-ink)] outline-none placeholder:text-[var(--sea-ink-soft)] focus:border-[var(--lagoon)] focus:bg-white/80"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-[var(--line)] bg-white/60 px-4 py-3 text-sm text-[var(--sea-ink)] outline-none placeholder:text-[var(--sea-ink-soft)] focus:border-[var(--lagoon)] focus:bg-white/80"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[var(--lagoon-deep)] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
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
