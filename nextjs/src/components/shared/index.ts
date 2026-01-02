/**
 * Shared Components - Reusable molecules used across features
 *
 * These are composed from shadcn/ui atoms but not tied to any specific feature.
 * Import from: @/components/shared
 */

// Molecules
export { TagList } from './tag-list';
export { ServingAdjuster } from './serving-adjuster';
export { SearchInput } from './search-input';

// Loading states
export {
  LoadingState,
  LoadingSpinner,
  CardSkeleton,
  ListSkeleton,
} from './loading-state';

// ═══════════════════════════════════════════════════════════════════════════
// Migration Notes:
// These components currently live in ui/ but should migrate here eventually:
// - EmptyState (@/components/ui/empty-state)
// - StarRating (@/components/ui/star-rating)
// - StarRatingFilter (@/components/ui/star-rating-filter)
// - RatingBadge (@/components/ui/rating-badge)
// - IconBadge (@/components/ui/icon-badge)
// - PersonalizedGreeting (@/components/ui/personalized-greeting)
// - HighlightText (@/components/ui/highlight-text)
// - MarkdownEditor (@/components/ui/markdown-editor)
// - EmojiPicker (@/components/ui/emoji-picker)
// - Confetti (@/components/ui/confetti)
// - PullToRefresh (@/components/ui/pull-to-refresh)
// ═══════════════════════════════════════════════════════════════════════════
