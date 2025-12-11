// Timer detection utility for cooking mode
// Detects time patterns in recipe instructions and converts to minutes

export interface DetectedTimer {
  minutes: number;
  originalText: string;
  displayText: string;
}

/**
 * Detects time patterns in instruction text and returns timer information
 * Patterns supported:
 * - "10 minutes" / "10 mins" / "10 min"
 * - "1 hour" / "1 hr"
 * - "30-45 minutes" (returns middle value)
 * - "1 hour 30 minutes"
 */
export function detectTimers(instruction: string): DetectedTimer[] {
  const timers: DetectedTimer[] = [];

  // Pattern for minutes only: "10 minutes", "15 mins", "5-10 min"
  const minutePattern = /(\d+)(?:\s*-\s*(\d+))?\s*(?:minutes?|mins?)\b/gi;

  // Pattern for hours only: "2 hours", "1 hr"
  const hourPattern = /(\d+)(?:\s*-\s*(\d+))?\s*(?:hours?|hrs?)\b/gi;

  // Pattern for hours and minutes: "1 hour 30 minutes", "2 hrs 15 min"
  const hourMinutePattern = /(\d+)\s*(?:hours?|hrs?)\s*(?:and\s+)?(\d+)\s*(?:minutes?|mins?)\b/gi;

  // Check for hour+minute combinations first
  let match: RegExpExecArray | null;
  while ((match = hourMinutePattern.exec(instruction)) !== null) {
    const hours = parseInt(match[1]);
    const mins = parseInt(match[2]);
    const totalMinutes = hours * 60 + mins;

    timers.push({
      minutes: totalMinutes,
      originalText: match[0],
      displayText: formatDuration(totalMinutes)
    });
  }

  // Check for hours only
  while ((match = hourPattern.exec(instruction)) !== null) {
    // Skip if this was already captured as part of hour+minute
    if (timers.some(t => t.originalText.includes(match[0]))) {
      continue;
    }

    const hours1 = parseInt(match[1]);
    const hours2 = match[2] ? parseInt(match[2]) : null;

    // If range (e.g., "2-3 hours"), use middle value
    const hours = hours2 ? Math.ceil((hours1 + hours2) / 2) : hours1;
    const minutes = hours * 60;

    timers.push({
      minutes,
      originalText: match[0],
      displayText: formatDuration(minutes)
    });
  }

  // Check for minutes only
  while ((match = minutePattern.exec(instruction)) !== null) {
    // Skip if this was already captured as part of hour+minute
    if (timers.some(t => t.originalText.includes(match[0]))) {
      continue;
    }

    const mins1 = parseInt(match[1]);
    const mins2 = match[2] ? parseInt(match[2]) : null;

    // If range (e.g., "30-45 minutes"), use middle value
    const minutes = mins2 ? Math.ceil((mins1 + mins2) / 2) : mins1;

    timers.push({
      minutes,
      originalText: match[0],
      displayText: formatDuration(minutes)
    });
  }

  // Remove duplicates and sort by minutes
  const uniqueTimers = timers.filter((timer, index, self) =>
    index === self.findIndex(t => t.minutes === timer.minutes)
  );

  return uniqueTimers.sort((a, b) => a.minutes - b.minutes);
}

/**
 * Formats duration in minutes to human-readable string
 * Examples: "5 min", "1 hr 30 min", "2 hrs"
 */
export function formatDuration(totalMinutes: number): string {
  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (minutes === 0) {
    return hours === 1 ? "1 hr" : `${hours} hrs`;
  }

  const hourText = hours === 1 ? "1 hr" : `${hours} hrs`;
  return `${hourText} ${minutes} min`;
}
