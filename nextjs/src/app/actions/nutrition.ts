/**
 * Nutrition Actions (Backward Compatibility Re-export)
 *
 * This file re-exports all nutrition actions from the modular structure.
 * All existing imports will continue to work without changes.
 *
 * Original file (1,113 lines) has been split into:
 * - recipe-nutrition.ts: Recipe nutrition CRUD and bulk operations
 * - ai-extraction.ts: Claude API nutrition extraction
 * - macro-goals.ts: Macro goal settings and tracking toggles
 * - daily-logs.ts: Daily summaries and quick add entries
 * - weekly-summary.ts: Weekly aggregations and history
 */

export * from "./nutrition/index";
