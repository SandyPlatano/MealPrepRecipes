import { WifiOff } from "lucide-react";

export function OfflineIndicator() {
  return (
    <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 dark:bg-yellow-950/20 dark:border-yellow-800 dark:text-yellow-400">
      <WifiOff className="h-4 w-4" />
      <span className="text-sm font-medium">
        You&apos;re offline. Changes will sync when you reconnect.
      </span>
    </div>
  );
}
