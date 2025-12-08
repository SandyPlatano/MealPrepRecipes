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
    if (error.message.includes("Invalid login")) {
      return { error: "Hmm, that doesn't look right. Check your email and password?" };
    }
    if (error.message.includes("Email not confirmed")) {
      return { error: "Check your inbox! You need to verify your email first." };
    }
    return { error: error.message };
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
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
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

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    return { error: "Google auth failed. Try again?" };
  }

  if (data.url) {
    redirect(data.url);
  }
}
