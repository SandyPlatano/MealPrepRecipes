/**
 * Format a display name from first_name and last_name.
 * Falls back to username with @ prefix if no name is available.
 */
export function formatDisplayName(
  profile: {
    first_name?: string | null;
    last_name?: string | null;
    username?: string | null;
  } | null | undefined,
  fallback = "Unknown"
): string {
  if (!profile) return fallback;

  const { first_name, last_name, username } = profile;

  // Build full name from parts
  const parts = [first_name, last_name].filter(Boolean);
  if (parts.length > 0) {
    return parts.join(" ");
  }

  // Fall back to username
  if (username) {
    return `@${username}`;
  }

  return fallback;
}

/**
 * Get initials from first_name and last_name for avatars.
 */
export function getInitials(
  profile: {
    first_name?: string | null;
    last_name?: string | null;
    username?: string | null;
  } | null | undefined
): string {
  if (!profile) return "?";

  const { first_name, last_name, username } = profile;

  // Use first letter of first and last name
  const firstInitial = first_name?.charAt(0)?.toUpperCase() || "";
  const lastInitial = last_name?.charAt(0)?.toUpperCase() || "";

  if (firstInitial || lastInitial) {
    return `${firstInitial}${lastInitial}`.trim() || "?";
  }

  // Fall back to username initial
  if (username) {
    return username.charAt(0).toUpperCase();
  }

  return "?";
}
