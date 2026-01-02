"use client";

interface ProgressBarProps {
  checkedCount: number;
  totalCount: number;
}

/**
 * Sticky progress bar showing shopping completion status.
 *
 * Fixed to bottom on mobile, relative on desktop.
 * Shows animated lime-green progress fill.
 */
export function ProgressBar({ checkedCount, totalCount }: ProgressBarProps) {
  if (totalCount === 0) return null;

  const progressPercent = (checkedCount / totalCount) * 100;
  const isComplete = checkedCount === totalCount && totalCount > 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 sm:relative sm:mt-6 bg-white/95 backdrop-blur-sm border-t border-gray-200 sm:border sm:rounded-lg p-4 sm:p-4 shadow-lg sm:shadow-sm z-40 safe-area-bottom dark:bg-gray-900/95 dark:border-gray-700">
      <div className="max-w-4xl mx-auto flex flex-col gap-2">
        <div className="h-3 sm:h-2 bg-gray-100 rounded-full overflow-hidden dark:bg-gray-800">
          <div
            className="h-full bg-[#D9F99D] transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-between">
          <span className="font-medium">
            {checkedCount} of {totalCount} items
          </span>
          {isComplete && (
            <span className="text-green-600 dark:text-green-400 font-medium">
              Shopping done!
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
