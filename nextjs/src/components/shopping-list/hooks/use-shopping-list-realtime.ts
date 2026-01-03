"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import type { ShoppingListItem } from "@/types/shopping-list";

type EventType = "INSERT" | "UPDATE" | "DELETE";

interface ShoppingListRealtimeEvent {
  type: EventType;
  item: ShoppingListItem;
  old?: Partial<ShoppingListItem>;
}

interface UseShoppingListRealtimeOptions {
  shoppingListId: string;
  onItemChange?: (event: ShoppingListRealtimeEvent) => void;
  enabled?: boolean;
}

interface UseShoppingListRealtimeReturn {
  isConnected: boolean;
  lastUpdate: Date | null;
}

/**
 * Real-time subscription hook for shopping list item changes.
 * Enables live sync between household members shopping together.
 *
 * @example
 * ```tsx
 * const { isConnected } = useShoppingListRealtime({
 *   shoppingListId: shoppingList.id,
 *   onItemChange: (event) => {
 *     if (event.type === "UPDATE") {
 *       // Another user checked off an item
 *       updateLocalItem(event.item);
 *     }
 *   },
 * });
 * ```
 */
export function useShoppingListRealtime({
  shoppingListId,
  onItemChange,
  enabled = true,
}: UseShoppingListRealtimeOptions): UseShoppingListRealtimeReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const supabaseRef = useRef(createClient());

  const handleChange = useCallback(
    (payload: RealtimePostgresChangesPayload<ShoppingListItem>) => {
      setLastUpdate(new Date());

      if (!onItemChange) return;

      const event: ShoppingListRealtimeEvent = {
        type: payload.eventType as EventType,
        item: (payload.new as ShoppingListItem) || (payload.old as ShoppingListItem),
        old: payload.old as Partial<ShoppingListItem> | undefined,
      };

      onItemChange(event);
    },
    [onItemChange]
  );

  useEffect(() => {
    if (!shoppingListId || !enabled) {
      return;
    }

    const supabase = supabaseRef.current;
    const channelName = `shopping-list:${shoppingListId}`;

    // Clean up existing channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    // Subscribe to shopping list item changes
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "shopping_list_items",
          filter: `shopping_list_id=eq.${shoppingListId}`,
        },
        handleChange
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [shoppingListId, enabled, handleChange]);

  return {
    isConnected,
    lastUpdate,
  };
}
