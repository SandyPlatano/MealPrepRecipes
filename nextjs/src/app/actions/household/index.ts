/**
 * Household Actions Index
 *
 * Re-exports all household actions from modular files.
 * Import from '@/app/actions/household' for all household functionality.
 */

// Cooking Schedules
export {
  getCookingSchedules,
  upsertCookingSchedule,
  deleteCookingSchedule,
  getTodaysCook,
} from "./cooking-schedules";

// Dietary Profiles
export {
  getMyDietaryProfile,
  upsertMyDietaryProfile,
  getHouseholdDietaryAggregate,
} from "./dietary-profiles";

// Activities
export { logHouseholdActivity, getHouseholdActivities } from "./activities";

// Members
export { getHouseholdMembers, getHouseholdFull } from "./members";
