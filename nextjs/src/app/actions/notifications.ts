"use server";

import { createClient } from "@/lib/supabase/server";
import type { SocialNotification } from "@/types/social";

export async function getNotifications(
  limit: number = 20
): Promise<{ data: SocialNotification[] | null; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "You must be signed in" };
  }

  const { data, error } = await supabase
    .from("social_notifications")
    .select(
      `
      id,
      notification_type,
      title,
      body,
      action_url,
      is_read,
      read_at,
      created_at,
      actor:profiles!social_notifications_actor_id_fkey (
        id,
        username,
        avatar_url
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching notifications:", error);
    return { data: null, error: error.message };
  }

  // Transform to SocialNotification type
  const notifications: SocialNotification[] = (data || []).map((n) => {
    const actor = n.actor as unknown as {
      id: string;
      username: string;
      avatar_url: string | null;
    } | null;

    return {
      id: n.id,
      notification_type: n.notification_type,
      title: n.title,
      body: n.body,
      action_url: n.action_url,
      is_read: n.is_read,
      read_at: n.read_at,
      created_at: n.created_at,
      actor: actor
        ? {
            id: actor.id,
            username: actor.username,
            avatar_url: actor.avatar_url,
          }
        : null,
    };
  });

  return { data: notifications, error: null };
}

export async function getUnreadCount(): Promise<{
  count: number;
  error: string | null;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { count: 0, error: null };
  }

  const { data, error } = await supabase.rpc("get_unread_notification_count");

  if (error) {
    console.error("Error fetching unread count:", error);
    return { count: 0, error: error.message };
  }

  return { count: data || 0, error: null };
}

export async function markAsRead(
  notificationIds: string[]
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be signed in" };
  }

  const { error } = await supabase.rpc("mark_notifications_read", {
    notification_ids: notificationIds,
    mark_all: false,
  });

  if (error) {
    console.error("Error marking notifications as read:", error);
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

export async function markAllAsRead(): Promise<{
  success: boolean;
  error: string | null;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be signed in" };
  }

  const { error } = await supabase.rpc("mark_notifications_read", {
    notification_ids: [],
    mark_all: true,
  });

  if (error) {
    console.error("Error marking all notifications as read:", error);
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}
