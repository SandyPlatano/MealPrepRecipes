// Automation Rules Types
// IFTTT-style automation system for the meal prep app

export type AutomationTrigger =
  | 'recipe_rated'
  | 'recipe_cooked'
  | 'recipe_created'
  | 'recipe_added_to_folder'
  | 'recipe_removed_from_folder'
  | 'meal_assigned'
  | 'meal_unassigned'
  | 'shopping_list_generated'
  | 'shopping_item_checked'
  | 'macro_logged'
  | 'pantry_item_added'
  | 'pantry_item_expiring'
  | 'pantry_item_expired'
  | 'scheduled';

export type AutomationAction =
  | 'add_to_folder'
  | 'remove_from_folder'
  | 'add_tag'
  | 'remove_tag'
  | 'set_favorite'
  | 'unset_favorite'
  | 'set_lifecycle_stage'
  | 'send_email'
  | 'send_notification'
  | 'add_to_shopping_list'
  | 'add_to_pantry'
  | 'webhook'
  | 'run_script';

export type ConditionOperator =
  | 'eq'      // equals
  | 'neq'     // not equals
  | 'gt'      // greater than
  | 'gte'     // greater than or equal
  | 'lt'      // less than
  | 'lte'     // less than or equal
  | 'contains'
  | 'not_contains'
  | 'matches'     // regex
  | 'is_null'
  | 'is_not_null';

export interface TriggerCondition {
  field: string;
  operator: ConditionOperator;
  value: unknown;
}

export type AutomationRunStatus = 'success' | 'failed' | 'skipped';

export interface AutomationRule {
  id: string;
  householdId: string;
  name: string;
  description: string | null;
  isEnabled: boolean;
  triggerType: AutomationTrigger;
  triggerConditions: TriggerCondition[];
  actionType: AutomationAction;
  actionConfig: Record<string, unknown>;
  schedule: string | null; // cron expression for scheduled triggers
  lastRunAt: string | null;
  runCount: number;
  errorCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AutomationRun {
  id: string;
  ruleId: string;
  triggeredBy: Record<string, unknown> | null;
  status: AutomationRunStatus;
  result: Record<string, unknown> | null;
  errorMessage: string | null;
  executionTimeMs: number | null;
  executedAt: string;
}

export interface AutomationRuleFormData {
  name: string;
  description?: string;
  isEnabled?: boolean;
  triggerType: AutomationTrigger;
  triggerConditions: TriggerCondition[];
  actionType: AutomationAction;
  actionConfig: Record<string, unknown>;
  schedule?: string;
}

// Action config schemas for each action type
export interface AddToFolderConfig {
  folderId: string;
}

export interface RemoveFromFolderConfig {
  folderId: string;
}

export interface AddTagConfig {
  tag: string;
}

export interface RemoveTagConfig {
  tag: string;
}

export interface SetLifecycleStageConfig {
  stageId: string;
}

export interface SendEmailConfig {
  template: string;
  subject: string;
}

export interface SendNotificationConfig {
  title: string;
  body: string;
}

export interface AddToShoppingListConfig {
  items: Array<{
    ingredient: string;
    quantity: string;
  }>;
}

export interface AddToPantryConfig {
  ingredient: string;
  quantity: number;
}

export interface WebhookConfig {
  url: string;
  method: 'POST' | 'GET';
  headers?: Record<string, string>;
  bodyTemplate?: string;
}

export interface RunScriptConfig {
  script: string; // JavaScript code
}

// Trigger field schemas - what fields are available for each trigger
export const TRIGGER_FIELDS: Record<AutomationTrigger, string[]> = {
  recipe_rated: ['rating', 'recipe_id', 'recipe_title', 'recipe_type'],
  recipe_cooked: ['recipe_id', 'recipe_title', 'servings_cooked', 'cook_name'],
  recipe_created: ['recipe_id', 'recipe_title', 'recipe_type', 'source_url'],
  recipe_added_to_folder: ['recipe_id', 'recipe_title', 'folder_id', 'folder_name'],
  recipe_removed_from_folder: ['recipe_id', 'recipe_title', 'folder_id', 'folder_name'],
  meal_assigned: ['recipe_id', 'recipe_title', 'meal_type', 'date', 'servings'],
  meal_unassigned: ['recipe_id', 'recipe_title', 'meal_type', 'date'],
  shopping_list_generated: ['item_count', 'week_start'],
  shopping_item_checked: ['ingredient', 'quantity', 'category'],
  macro_logged: ['calories', 'protein', 'carbs', 'fat', 'date'],
  pantry_item_added: ['ingredient', 'quantity', 'expiry_date'],
  pantry_item_expiring: ['ingredient', 'quantity', 'days_until_expiry'],
  pantry_item_expired: ['ingredient', 'quantity', 'expired_days_ago'],
  scheduled: [], // No fields - just runs on schedule
};

// Display labels for triggers and actions
export const TRIGGER_LABELS: Record<AutomationTrigger, string> = {
  recipe_rated: 'When a recipe is rated',
  recipe_cooked: 'When a recipe is cooked',
  recipe_created: 'When a recipe is created',
  recipe_added_to_folder: 'When a recipe is added to a folder',
  recipe_removed_from_folder: 'When a recipe is removed from a folder',
  meal_assigned: 'When a meal is assigned to the planner',
  meal_unassigned: 'When a meal is removed from the planner',
  shopping_list_generated: 'When a shopping list is generated',
  shopping_item_checked: 'When a shopping item is checked off',
  macro_logged: 'When macros are logged',
  pantry_item_added: 'When a pantry item is added',
  pantry_item_expiring: 'When a pantry item is expiring soon',
  pantry_item_expired: 'When a pantry item has expired',
  scheduled: 'On a schedule',
};

export const ACTION_LABELS: Record<AutomationAction, string> = {
  add_to_folder: 'Add recipe to folder',
  remove_from_folder: 'Remove recipe from folder',
  add_tag: 'Add tag to recipe',
  remove_tag: 'Remove tag from recipe',
  set_favorite: 'Mark recipe as favorite',
  unset_favorite: 'Remove recipe from favorites',
  set_lifecycle_stage: 'Set recipe lifecycle stage',
  send_email: 'Send email notification',
  send_notification: 'Send push notification',
  add_to_shopping_list: 'Add items to shopping list',
  add_to_pantry: 'Add item to pantry',
  webhook: 'Call webhook',
  run_script: 'Run custom script',
};

export const OPERATOR_LABELS: Record<ConditionOperator, string> = {
  eq: 'equals',
  neq: 'does not equal',
  gt: 'is greater than',
  gte: 'is greater than or equal to',
  lt: 'is less than',
  lte: 'is less than or equal to',
  contains: 'contains',
  not_contains: 'does not contain',
  matches: 'matches pattern',
  is_null: 'is empty',
  is_not_null: 'is not empty',
};
