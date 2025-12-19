export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center flex flex-col gap-6 max-w-md">
        <div className="text-6xl">📶</div>
        <h1 className="text-2xl font-bold">You&apos;re offline</h1>
        <p className="text-muted-foreground">
          No worries! Your shopping list is cached and will work offline. Just
          head to the shop page.
        </p>
        <div className="flex flex-col gap-3">
          <a
            href="/app/shop"
            className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Go to Shopping List
          </a>
          <p className="text-sm text-muted-foreground">
            Changes will sync when you&apos;re back online.
          </p>
        </div>
      </div>
    </div>
  );
}

