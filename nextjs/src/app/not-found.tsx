import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Retro-styled 404 icon */}
        <div className="inline-flex items-center justify-center w-24 h-24 bg-secondary border-2 border-black rounded-xl mb-6">
          <span className="text-5xl">🍽️</span>
        </div>

        <h1 className="font-display text-6xl font-bold text-foreground mb-2">404</h1>
        <h2 className="font-display text-xl font-semibold text-foreground mb-4">
          Page Not Found
        </h2>
        <p className="text-muted-foreground mb-8">
          Looks like this recipe got lost in the kitchen. Let&apos;s get you back
          to planning delicious meals.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <button type="button" className="btn-primary">
              Go Home
            </button>
          </Link>
          <Link href="/app">
            <button type="button" className="btn-secondary">
              Open App
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
