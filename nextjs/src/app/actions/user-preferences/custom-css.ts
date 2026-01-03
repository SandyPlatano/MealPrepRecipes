"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getCurrentUserId } from "./core";

export async function getCustomCss(
  userId: string
): Promise<{ error: string | null; data: string | null }> {
  const supabase = await createClient();

  const { data: settings, error } = await supabase
    .from("user_settings")
    .select("custom_css")
    .eq("user_id", userId)
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  return { error: null, data: settings?.custom_css || null };
}

export async function setCustomCss(
  userId: string,
  css: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("user_settings")
    .update({ custom_css: css })
    .eq("user_id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app");
  revalidatePath("/app/settings");
  return { error: null };
}

export async function getCustomCssAuto(): Promise<{
  error: string | null;
  data: string | null;
}> {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "Not authenticated", data: null };
  return getCustomCss(userId);
}

export async function setCustomCssAuto(
  css: string
): Promise<{ error: string | null }> {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "Not authenticated" };
  return setCustomCss(userId, css);
}
