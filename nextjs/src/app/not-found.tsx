import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-4">🍽️</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-8">
          Looks like this recipe got lost in the kitchen. Let&apos;s get you back
          to planning delicious meals.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors"
          >
            Go Home
          </Link>
          <Link
            href="/app"
            className="inline-flex items-center justify-center px-6 py-3 bg-white text-orange-500 font-medium rounded-lg border border-orange-500 hover:bg-orange-50 transition-colors"
          >
            Open App
          </Link>
        </div>
      </div>
    </div>
  );
}
