/**
 * Cooking Mode Hooks
 *
 * Extracted from cooking-mode.tsx for better organization.
 * Each hook handles a specific domain of cooking mode functionality.
 */

export {
  useCookingTimer,
  type UseCookingTimerOptions,
  type UseCookingTimerReturn,
} from "./use-cooking-timer";

export {
  useCookingNavigation,
  type UseCookingNavigationOptions,
  type UseCookingNavigationReturn,
} from "./use-cooking-navigation";

export {
  useFullscreen,
  type UseFullscreenReturn,
} from "./use-fullscreen";
