"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import type {
  HouseholdRealtimeEvent,
  HouseholdRealtimeState,
  CookingSchedule,
  MemberDietaryProfile,
  HouseholdActivity,
} from "@/types/household";

// ============================================================================
// Types
// ============================================================================

type TableName = "cooking_schedules" | "member_dietary_profiles" | "household_activities" | "meal_assignments";

interface UseHouseholdRealtimeOptions {
  householdId: string | null;
  onScheduleChange?: (payload: RealtimePostgresChangesPayload<CookingSchedule>) => void;
  onDietaryChange?: (payload: RealtimePostgresChangesPayload<MemberDietaryProfile>) => void;
  onActivityAdded?: (payload: RealtimePostgresChangesPayload<HouseholdActivity>) => void;
  onMealAssignmentChange?: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void;
  onAnyChange?: (event: HouseholdRealtimeEvent) => void;
  enabled?: boolean;
}

interface UseHouseholdRealtimeReturn {
  isConnected: boolean;
  lastUpdate: Date | null;
  pendingChanges: number;
  reconnect: () => void;
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Real-time subscription hook for household coordination features.
 * Subscribes to changes in cooking schedules, dietary profiles, and activities.
 *
 * @example
 * ```tsx
 * const { isConnected, lastUpdate } = useHouseholdRealtime({
 *   householdId: "abc-123",
 *   onScheduleChange: (payload) => {
 *     if (payload.eventType === "UPDATE") {
 *       // Refresh cooking schedules
 *       refetchSchedules();
 *     }
 *   },
 *   onActivityAdded: (payload) => {
 *     // Show toast notification
 *     toast(`${payload.new.activity_type} by another member`);
 *   }
 * });
 * ```
 */
export function useHouseholdRealtime({
  householdId,
  onScheduleChange,
  onDietaryChange,
  onActivityAdded,
  onMealAssignmentChange,
  onAnyChange,
  enabled = true,
}: UseHouseholdRealtimeOptions): UseHouseholdRealtimeReturn {
  const [state, setState] = useState<HouseholdRealtimeState>({
    isConnected: false,
    lastUpdate: new Date(),
    pendingChanges: 0,
  });

  const channelRef = useRef<RealtimeChannel | null>(null);
  const supabaseRef = useRef(createClient());

  // Memoize callback to prevent infinite re-subscriptions
  const handleChange = useCallback(
    (table: TableName, payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
      setState((prev) => ({
        ...prev,
        lastUpdate: new Date(),
        pendingChanges: prev.pendingChanges + 1,
      }));

      // Route to specific handlers
      switch (table) {
        case "cooking_schedules":
          onScheduleChange?.(payload as RealtimePostgresChangesPayload<CookingSchedule>);
          onAnyChange?.({ type: "schedule_change", payload });
          break;
        case "member_dietary_profiles":
          onDietaryChange?.(payload as RealtimePostgresChangesPayload<MemberDietaryProfile>);
          onAnyChange?.({ type: "dietary_change", payload });
          break;
        case "household_activities":
          if (payload.eventType === "INSERT") {
            onActivityAdded?.(payload as unknown as RealtimePostgresChangesPayload<HouseholdActivity>);
            onAnyChange?.({ type: "activity_added", payload: payload.new as unknown as HouseholdActivity });
          }
          break;
        case "meal_assignments":
          onMealAssignmentChange?.(payload);
          onAnyChange?.({ type: "meal_assignment_change", payload });
          break;
      }

      // Decrement pending changes after a short delay (for optimistic UI)
      setTimeout(() => {
        setState((prev) => ({
          ...prev,
          pendingChanges: Math.max(0, prev.pendingChanges - 1),
        }));
      }, 500);
    },
    [onScheduleChange, onDietaryChange, onActivityAdded, onMealAssignmentChange, onAnyChange]
  );

  // Subscribe to realtime changes
  useEffect(() => {
    if (!householdId || !enabled) {
      return;
    }

    const supabase = supabaseRef.current;
    const channelName = `household:${householdId}`;

    // Clean up existing channel if any
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    // Create new channel with all table subscriptions
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cooking_schedules",
          filter: `household_id=eq.${householdId}`,
        },
        (payload) => handleChange("cooking_schedules", payload)
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "member_dietary_profiles",
          filter: `household_id=eq.${householdId}`,
        },
        (payload) => handleChange("member_dietary_profiles", payload)
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "household_activities",
          filter: `household_id=eq.${householdId}`,
        },
        (payload) => handleChange("household_activities", payload)
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "meal_assignments",
          filter: `household_id=eq.${householdId}`,
        },
        (payload) => handleChange("meal_assignments", payload)
      )
      .subscribe((status) => {
        setState((prev) => ({
          ...prev,
          isConnected: status === "SUBSCRIBED",
        }));
      });

    channelRef.current = channel;

    // Cleanup on unmount or dependency change
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [householdId, enabled, handleChange]);

  // Manual reconnect function
  const reconnect = useCallback(() => {
    if (channelRef.current) {
      const supabase = supabaseRef.current;
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
      // Force re-run of the effect by toggling state
      setState((prev) => ({ ...prev, isConnected: false }));
    }
  }, []);

  return {
    isConnected: state.isConnected,
    lastUpdate: state.lastUpdate,
    pendingChanges: state.pendingChanges,
    reconnect,
  };
}

// ============================================================================
// Specialized Hooks (Convenience wrappers)
// ============================================================================

/**
 * Subscribe only to cooking schedule changes
 */
export function useCookingScheduleRealtime(
  householdId: string | null,
  onScheduleChange: (payload: RealtimePostgresChangesPayload<CookingSchedule>) => void
) {
  return useHouseholdRealtime({
    householdId,
    onScheduleChange,
  });
}

/**
 * Subscribe only to activity feed updates
 */
export function useActivityFeedRealtime(
  householdId: string | null,
  onActivityAdded: (payload: RealtimePostgresChangesPayload<HouseholdActivity>) => void
) {
  return useHouseholdRealtime({
    householdId,
    onActivityAdded,
  });
}

/**
 * Subscribe to meal assignment changes (for the weekly planner)
 */
export function useMealPlannerRealtime(
  householdId: string | null,
  onMealAssignmentChange: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void
) {
  return useHouseholdRealtime({
    householdId,
    onMealAssignmentChange,
  });
}
