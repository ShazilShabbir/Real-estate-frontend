"use client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        <main className="flex min-h-screen items-center justify-center px-6 py-16">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">Unexpected error</p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-balance">Something went wrong</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              We hit a problem while loading this page. Please try again.
            </p>
            {error.digest ? (
              <p className="mt-4 text-xs text-muted-foreground">Reference: {error.digest}</p>
            ) : null}
            <button
              type="button"
              onClick={reset}
              className="mt-8 inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  )
}
