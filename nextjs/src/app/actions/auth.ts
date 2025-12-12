"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    // Return error message with brand voice
    if (error.message.includes("Invalid login") || error.message.includes("Invalid login credentials")) {
      return { error: "Hmm, that doesn't look right. Check your email and password?" };
    }
    if (error.message.includes("Email not confirmed")) {
      return { error: "Check your inbox! You need to verify your email first." };
    }
    if (error.message.includes("User not found")) {
      return { error: "We couldn't find an account with that email. Want to sign up instead?" };
    }
    if (error.message.includes("Too many requests")) {
      return { error: "Too many login attempts. Please wait a moment and try again." };
    }
    return { error: error.message || "Something went wrong. Please try again." };
  }

  revalidatePath("/", "layout");
  redirect("/app");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const name = formData.get("name") as string;

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      data: {
        name: name || email.split("@")[0],
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/app`,
    },
  });

  if (error) {
    if (error.message.includes("already registered") || error.message.includes("already been registered")) {
      return { error: "Looks like you already have an account. Try logging in?" };
    }
    return { error: error.message };
  }

  return { success: "Check your email! We sent you a magic link to confirm your account." };
}

export async function forgotPassword(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/app/settings`,
  });

  if (error) {
    return { error: "Something went wrong. Try again?" };
  }

  return { success: "If that email exists, you'll get a reset link. Check your inbox!" };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function signInWithGoogle() {
  const supabase = await createClient();

  const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/app`;
  console.log("Google OAuth redirect URL:", redirectUrl);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirectUrl,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    console.error("Google OAuth error:", error);
    return { error: "Google auth failed. Try again?" };
  }

  console.log("Google OAuth data:", data);

  if (data.url) {
    return { url: data.url };
  }

  return { error: "Failed to get Google auth URL" };
}
