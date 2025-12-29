/**
 * AI Prompt Sanitization Utilities
 *
 * Prevents prompt injection attacks by sanitizing user input before
 * inclusion in AI prompts. This is critical security for any AI-powered
 * feature that incorporates user-generated content.
 *
 * @security This module defends against prompt injection attacks where
 * malicious users try to override AI instructions through crafted input.
 */

/**
 * Patterns that could be used for prompt injection attacks
 * These attempt to override or manipulate AI behavior
 */
const INJECTION_PATTERNS: RegExp[] = [
  // Instruction override attempts
  /ignore\s+(all\s+)?(previous|prior|above|preceding)\s*(instructions?)?/gi,
  /disregard\s+(all\s+)?(previous|prior|above|preceding)\s*(instructions?)?/gi,
  /forget\s+(all\s+)?(previous|prior|above|preceding)\s*(instructions?)?/gi,
  /override\s+(all\s+)?(previous|prior|above|preceding)\s*(instructions?)?/gi,

  // New instruction injection
  /new\s+(system\s+)?instructions?:/gi,
  /updated?\s+instructions?:/gi,
  /instead,?\s+(you\s+)?(should|must|will)/gi,

  // Role/persona manipulation
  /you\s+are\s+(now|actually)/gi,
  /pretend\s+(to\s+be|you\s+are)/gi,
  /act\s+as\s+(if\s+you\s+are|a)/gi,
  /your\s+(new\s+)?role\s+is/gi,

  // System prompt extraction attempts
  /what\s+(are|is)\s+your\s+(system\s+)?prompt/gi,
  /show\s+(me\s+)?your\s+(system\s+)?instructions/gi,
  /reveal\s+your\s+(system\s+)?prompt/gi,
  /repeat\s+(the\s+)?(system\s+)?prompt/gi,

  // Output format manipulation
  /output\s+everything\s+(as|in)/gi,
  /respond\s+only\s+with/gi,
  /your\s+output\s+must\s+be/gi,

  // Delimiter/structure breaking
  /```system/gi,
  /```assistant/gi,
  /```human/gi,
  /<\/?system>/gi,
  /<\/?assistant>/gi,
  /<\/?human>/gi,
  /<\/?user>/gi,
];

/**
 * Maximum lengths for different input types
 */
const MAX_LENGTHS = {
  short: 100,      // Single words/names
  medium: 300,     // Short phrases/descriptions
  long: 1000,      // Full paragraphs
  list_item: 150,  // Individual list items
} as const;

/**
 * Sanitizes a single string input for safe inclusion in AI prompts
 *
 * @param input - The user input to sanitize
 * @param maxLength - Maximum allowed length (default: medium)
 * @returns Sanitized string safe for prompt inclusion
 *
 * @example
 * ```ts
 * const safeTitle = sanitizePromptInput(userRecipeTitle, MAX_LENGTHS.medium);
 * const prompt = `Recipe: ${safeTitle}`;
 * ```
 */
export function sanitizePromptInput(
  input: string | null | undefined,
  maxLength: number = MAX_LENGTHS.medium
): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  let sanitized = input
    // Truncate to max length
    .slice(0, maxLength)
    // Normalize whitespace (collapse multiple spaces, remove unusual whitespace)
    .replace(/\s+/g, ' ')
    // Remove control characters
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Remove null bytes
    .replace(/\0/g, '')
    .trim();

  // Remove/replace injection patterns
  for (const pattern of INJECTION_PATTERNS) {
    sanitized = sanitized.replace(pattern, '[filtered]');
  }

  // Remove markdown that could break prompt structure
  // (backticks for code blocks, excessive #'s for headers)
  sanitized = sanitized
    .replace(/`{3,}/g, '')           // Triple+ backticks
    .replace(/^#{1,6}\s+/gm, '')     // Markdown headers
    .replace(/\[.*?\]\(.*?\)/g, (match) => {
      // Allow simple markdown links but sanitize URLs
      const text = match.match(/\[(.*?)\]/)?.[1] || '';
      return text;
    });

  return sanitized;
}

/**
 * Sanitizes an array of strings (e.g., ingredients, tags, allergens)
 *
 * @param inputs - Array of user inputs
 * @param maxLength - Max length per item
 * @param maxItems - Max number of items (prevents DoS)
 * @returns Sanitized array
 */
export function sanitizeArrayInput(
  inputs: string[] | null | undefined,
  maxLength: number = MAX_LENGTHS.list_item,
  maxItems: number = 50
): string[] {
  if (!Array.isArray(inputs)) {
    return [];
  }

  return inputs
    .slice(0, maxItems)
    .map(input => sanitizePromptInput(input, maxLength))
    .filter(Boolean); // Remove empty strings
}

/**
 * Escapes a string for safe inclusion in quoted context within prompts
 *
 * @param input - The input to escape
 * @returns Escaped string safe for quoted inclusion
 *
 * @example
 * ```ts
 * const safeIngredient = escapeForPrompt(userIngredient);
 * const prompt = `Find substitutes for "${safeIngredient}"`;
 * ```
 */
export function escapeForPrompt(input: string | null | undefined): string {
  const sanitized = sanitizePromptInput(input);

  // Escape quotes and backslashes for safe embedding in quoted strings
  return sanitized
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/'/g, "\\'");
}

/**
 * Sanitizes a number input, ensuring it's within valid bounds
 */
export function sanitizeNumberInput(
  input: number | string | null | undefined,
  min: number = 0,
  max: number = 10000
): number | null {
  if (input === null || input === undefined) {
    return null;
  }

  const num = typeof input === 'string' ? parseFloat(input) : input;

  if (isNaN(num) || !isFinite(num)) {
    return null;
  }

  return Math.max(min, Math.min(max, num));
}

/**
 * Creates a sanitized context object for use in prompts
 * Convenience function for common patterns
 */
export function sanitizePromptContext<T extends Record<string, unknown>>(
  context: T,
  fieldConfigs: Partial<Record<keyof T, {
    type: 'string' | 'array' | 'number';
    maxLength?: number;
    maxItems?: number;
    min?: number;
    max?: number;
  }>>
): Partial<T> {
  const sanitized: Partial<T> = {};

  for (const [key, config] of Object.entries(fieldConfigs)) {
    const value = context[key as keyof T];

    if (config?.type === 'string') {
      sanitized[key as keyof T] = sanitizePromptInput(
        value as string,
        config.maxLength
      ) as T[keyof T];
    } else if (config?.type === 'array') {
      sanitized[key as keyof T] = sanitizeArrayInput(
        value as string[],
        config.maxLength,
        config.maxItems
      ) as T[keyof T];
    } else if (config?.type === 'number') {
      sanitized[key as keyof T] = sanitizeNumberInput(
        value as number,
        config.min,
        config.max
      ) as T[keyof T];
    }
  }

  return sanitized;
}

// Export max lengths for use in calling code
export const SANITIZE_LIMITS = MAX_LENGTHS;
