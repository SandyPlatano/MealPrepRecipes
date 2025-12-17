"use client";

import { useMemo } from 'react';
import { useSettings } from '@/contexts/settings-context';
import { hasPermission, type Permission, type HouseholdRole, type PermissionMode, type HouseholdSettings } from '@/types/household-permissions';

/**
 * Hook for checking household permissions
 *
 * Provides utilities for checking user permissions based on their role
 * and the household's permission mode.
 *
 * @example
 * ```tsx
 * function RecipeEditor() {
 *   const { can, isOwner, role } = usePermissions();
 *
 *   if (!can('edit_recipes')) {
 *     return <div>You don't have permission to edit recipes</div>;
 *   }
 *
 *   return <RecipeForm />;
 * }
 * ```
 */
export function usePermissions() {
  const { household } = useSettings();

  const role = (household?.role ?? 'member') as HouseholdRole;
  const mode = (household?.household?.permission_mode ?? 'managed') as PermissionMode;
  const settings = household?.household?.household_settings as HouseholdSettings | undefined;

  const can = useMemo(() => {
    return (permission: Permission) => hasPermission(permission, role, mode, settings);
  }, [role, mode, settings]);

  return {
    role,
    mode,
    can,
    isOwner: role === 'owner',
    isAdult: role === 'owner' || role === 'adult',
    canManage: can('manage_household'),
    canEditMeals: can('edit_meal_plan'),
  };
}
