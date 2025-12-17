// ============================================================================
// Household Permission System Types
// ============================================================================

// Permission modes
export type PermissionMode = 'equal' | 'managed' | 'family';

// Household roles
export type HouseholdRole = 'owner' | 'adult' | 'member' | 'child' | 'guest';

// Role hierarchy (higher = more permissions)
export const ROLE_HIERARCHY: Record<HouseholdRole, number> = {
  owner: 100,
  adult: 80,
  member: 60,
  child: 40,
  guest: 20,
};

// Role display configuration
export const ROLE_CONFIG: Record<HouseholdRole, {
  label: string;
  description: string;
  color: string;
}> = {
  owner: {
    label: 'Owner',
    description: 'Full control over household settings and permissions',
    color: '#6366f1',
  },
  adult: {
    label: 'Adult',
    description: 'Can manage meals and recipes, limited settings access',
    color: '#8b5cf6',
  },
  member: {
    label: 'Member',
    description: 'Can view and contribute to household planning',
    color: '#10b981',
  },
  child: {
    label: 'Child',
    description: 'Limited permissions based on household settings',
    color: '#f59e0b',
  },
  guest: {
    label: 'Guest',
    description: 'View-only access to shared content',
    color: '#6b7280',
  },
};

// Permission mode configuration
export const PERMISSION_MODE_CONFIG: Record<PermissionMode, {
  label: string;
  description: string;
  availableRoles: HouseholdRole[];
}> = {
  equal: {
    label: 'Equal Partners',
    description: 'Everyone has equal access to manage meals and recipes',
    availableRoles: ['owner', 'member'],
  },
  managed: {
    label: 'Managed Household',
    description: 'Owner and adults manage planning, members can contribute',
    availableRoles: ['owner', 'adult', 'member', 'guest'],
  },
  family: {
    label: 'Family Mode',
    description: 'Full family structure with child-specific permissions',
    availableRoles: ['owner', 'adult', 'member', 'child', 'guest'],
  },
};

// Child permission settings
export interface ChildPermissions {
  canViewRecipes: boolean;
  canViewMealPlan: boolean;
  canViewShoppingList: boolean;
  canCheckShoppingItems: boolean;
  canLogCooking: boolean;
  canRateRecipes: boolean;
  canSuggestRecipes: boolean;
}

// Full household settings
export interface HouseholdSettings {
  childPermissions: ChildPermissions;
  guestCanViewShoppingList: boolean;
  showContributionBadges: boolean;
}

export const DEFAULT_CHILD_PERMISSIONS: ChildPermissions = {
  canViewRecipes: true,
  canViewMealPlan: true,
  canViewShoppingList: false,
  canCheckShoppingItems: false,
  canLogCooking: false,
  canRateRecipes: true,
  canSuggestRecipes: true,
};

export const DEFAULT_HOUSEHOLD_SETTINGS: HouseholdSettings = {
  childPermissions: DEFAULT_CHILD_PERMISSIONS,
  guestCanViewShoppingList: false,
  showContributionBadges: true,
};

// Permission types
export type Permission =
  | 'view_recipes'
  | 'edit_recipes'
  | 'delete_recipes'
  | 'view_meal_plan'
  | 'edit_meal_plan'
  | 'view_shopping_list'
  | 'edit_shopping_list'
  | 'check_shopping_items'
  | 'manage_household'
  | 'invite_members'
  | 'remove_members'
  | 'change_roles'
  | 'change_settings';

// Permission checking function
export function hasPermission(
  permission: Permission,
  role: HouseholdRole,
  mode: PermissionMode,
  settings?: HouseholdSettings
): boolean {
  const actualSettings = settings || DEFAULT_HOUSEHOLD_SETTINGS;

  // Owner always has all permissions
  if (role === 'owner') {
    return true;
  }

  // Guest permissions
  if (role === 'guest') {
    switch (permission) {
      case 'view_recipes':
        return true;
      case 'view_meal_plan':
        return true;
      case 'view_shopping_list':
        return actualSettings.guestCanViewShoppingList;
      default:
        return false;
    }
  }

  // Child permissions (family mode only)
  if (role === 'child') {
    switch (permission) {
      case 'view_recipes':
        return actualSettings.childPermissions.canViewRecipes;
      case 'view_meal_plan':
        return actualSettings.childPermissions.canViewMealPlan;
      case 'view_shopping_list':
        return actualSettings.childPermissions.canViewShoppingList;
      case 'check_shopping_items':
        return actualSettings.childPermissions.canCheckShoppingItems;
      default:
        return false;
    }
  }

  // Equal mode - everyone is equal (owner/member only)
  // Note: owner is already handled at the top, so at this point role is 'adult' or 'member'
  if (mode === 'equal') {
    switch (permission) {
      case 'view_recipes':
      case 'edit_recipes':
      case 'delete_recipes':
      case 'view_meal_plan':
      case 'edit_meal_plan':
      case 'view_shopping_list':
      case 'edit_shopping_list':
      case 'check_shopping_items':
        return true;
      case 'manage_household':
      case 'invite_members':
      case 'remove_members':
      case 'change_roles':
      case 'change_settings':
        return false; // Only owner has these permissions (handled at top)
      default:
        return false;
    }
  }

  // Managed mode - differentiated roles
  if (mode === 'managed') {
    if (role === 'adult') {
      switch (permission) {
        case 'view_recipes':
        case 'edit_recipes':
        case 'delete_recipes':
        case 'view_meal_plan':
        case 'edit_meal_plan':
        case 'view_shopping_list':
        case 'edit_shopping_list':
        case 'check_shopping_items':
          return true;
        case 'manage_household':
        case 'invite_members':
        case 'remove_members':
        case 'change_roles':
        case 'change_settings':
          return false;
        default:
          return false;
      }
    }

    if (role === 'member') {
      switch (permission) {
        case 'view_recipes':
        case 'view_meal_plan':
        case 'view_shopping_list':
        case 'check_shopping_items':
          return true;
        case 'edit_recipes':
        case 'delete_recipes':
        case 'edit_meal_plan':
        case 'edit_shopping_list':
        case 'manage_household':
        case 'invite_members':
        case 'remove_members':
        case 'change_roles':
        case 'change_settings':
          return false;
        default:
          return false;
      }
    }
  }

  // Family mode - full hierarchy
  if (mode === 'family') {
    if (role === 'adult') {
      switch (permission) {
        case 'view_recipes':
        case 'edit_recipes':
        case 'delete_recipes':
        case 'view_meal_plan':
        case 'edit_meal_plan':
        case 'view_shopping_list':
        case 'edit_shopping_list':
        case 'check_shopping_items':
        case 'invite_members':
          return true;
        case 'manage_household':
        case 'remove_members':
        case 'change_roles':
        case 'change_settings':
          return false;
        default:
          return false;
      }
    }

    if (role === 'member') {
      switch (permission) {
        case 'view_recipes':
        case 'view_meal_plan':
        case 'view_shopping_list':
        case 'check_shopping_items':
          return true;
        case 'edit_recipes':
        case 'delete_recipes':
        case 'edit_meal_plan':
        case 'edit_shopping_list':
        case 'manage_household':
        case 'invite_members':
        case 'remove_members':
        case 'change_roles':
        case 'change_settings':
          return false;
        default:
          return false;
      }
    }
  }

  // Default deny
  return false;
}
