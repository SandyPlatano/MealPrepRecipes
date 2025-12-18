"use server";

import { createClient } from "@/lib/supabase/server";
import { getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";
import { Resend } from "resend";
import {
  generateInvitationHTML,
  generateInvitationText,
} from "@/lib/email/invitation-template";

// Initialize Resend lazily to avoid errors during build
function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY environment variable is not set");
  }
  return new Resend(apiKey);
}

export interface HouseholdInvitation {
  id: string;
  household_id: string;
  email: string;
  invited_by: string;
  token: string;
  status: "pending" | "accepted" | "expired" | "declined";
  expires_at: string;
  created_at: string;
}

export interface HouseholdInvitationWithInviter extends HouseholdInvitation {
  inviter: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
  } | null;
}

/**
 * Send a household invitation to an email address
 */
export async function sendHouseholdInvitation(email: string): Promise<{
  error: string | null;
  data: HouseholdInvitation | null;
}> {
  const { user, householdId, membership } = await getCachedUserWithHousehold();

  if (!user || !householdId) {
    return { error: "Not authenticated or no household", data: null };
  }

  // Only owners can invite new members
  if (membership?.role !== "owner") {
    return { error: "Only household owners can invite members", data: null };
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { error: "Invalid email format", data: null };
  }

  const supabase = await createClient();

  // Check if user is already a member of this household
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email.toLowerCase())
    .single();

  if (existingProfile) {
    const { data: existingMember } = await supabase
      .from("household_members")
      .select("id")
      .eq("household_id", householdId)
      .eq("user_id", existingProfile.id)
      .single();

    if (existingMember) {
      return { error: "This user is already a member of your household", data: null };
    }
  }

  // Check for existing pending invitation
  const { data: existingInvite } = await supabase
    .from("household_invitations")
    .select("id, status")
    .eq("household_id", householdId)
    .eq("email", email.toLowerCase())
    .eq("status", "pending")
    .single();

  if (existingInvite) {
    return { error: "An invitation has already been sent to this email", data: null };
  }

  // Generate secure token and set expiration (7 days)
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  // Create the invitation
  const { data: invitation, error } = await supabase
    .from("household_invitations")
    .insert({
      household_id: householdId,
      email: email.toLowerCase(),
      invited_by: user.id,
      token,
      status: "pending",
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating invitation:", error);
    return { error: error.message, data: null };
  }

  // Get inviter's profile for the email
  const { data: inviterProfile } = await supabase
    .from("profiles")
    .select("first_name, last_name, email")
    .eq("id", user.id)
    .single();

  const inviterName =
    inviterProfile?.first_name && inviterProfile?.last_name
      ? `${inviterProfile.first_name} ${inviterProfile.last_name}`
      : inviterProfile?.first_name || inviterProfile?.email || "Someone";

  // Generate invite link
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
  const inviteLink = `${baseUrl}/invite/${token}`;

  // Send email notification
  try {
    const resend = getResendClient();
    const html = generateInvitationHTML({
      inviterName,
      inviteLink,
      expiresInDays: 7,
    });
    const text = generateInvitationText({
      inviterName,
      inviteLink,
      expiresInDays: 7,
    });

    const { error: emailError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to: email.toLowerCase(),
      subject: `${inviterName} invited you to join their household`,
      html,
      text,
    });

    if (emailError) {
      console.error("Error sending invitation email:", emailError);
      // Don't fail the invitation creation, just log the error
      // The user can still use the copy link feature
    }
  } catch (emailErr) {
    console.error("Failed to send invitation email:", emailErr);
    // Don't fail the invitation creation
  }

  revalidatePath("/app/settings/household");

  return { error: null, data: invitation };
}

/**
 * Get all pending invitations for the household
 */
export async function getHouseholdInvitations(): Promise<{
  error: string | null;
  data: HouseholdInvitationWithInviter[] | null;
}> {
  const { user, householdId } = await getCachedUserWithHousehold();

  if (!user || !householdId) {
    return { error: "Not authenticated or no household", data: null };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("household_invitations")
    .select(`
      *,
      inviter:invited_by(
        id,
        first_name,
        last_name,
        email
      )
    `)
    .eq("household_id", householdId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching invitations:", error);
    return { error: error.message, data: null };
  }

  return { error: null, data: data as HouseholdInvitationWithInviter[] };
}

/**
 * Cancel a pending invitation
 */
export async function cancelHouseholdInvitation(invitationId: string): Promise<{
  error: string | null;
}> {
  const { user, householdId, membership } = await getCachedUserWithHousehold();

  if (!user || !householdId) {
    return { error: "Not authenticated or no household" };
  }

  // Only owners can cancel invitations
  if (membership?.role !== "owner") {
    return { error: "Only household owners can cancel invitations" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("household_invitations")
    .update({ status: "declined" })
    .eq("id", invitationId)
    .eq("household_id", householdId)
    .eq("status", "pending");

  if (error) {
    console.error("Error cancelling invitation:", error);
    return { error: error.message };
  }

  revalidatePath("/app/settings/household");

  return { error: null };
}

/**
 * Resend an invitation (creates a new token and extends expiration)
 */
export async function resendHouseholdInvitation(invitationId: string): Promise<{
  error: string | null;
  data: HouseholdInvitation | null;
}> {
  const { user, householdId, membership } = await getCachedUserWithHousehold();

  if (!user || !householdId) {
    return { error: "Not authenticated or no household", data: null };
  }

  // Only owners can resend invitations
  if (membership?.role !== "owner") {
    return { error: "Only household owners can resend invitations", data: null };
  }

  const supabase = await createClient();

  // Generate new token and extend expiration
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const { data, error } = await supabase
    .from("household_invitations")
    .update({
      token,
      expires_at: expiresAt.toISOString(),
      status: "pending",
    })
    .eq("id", invitationId)
    .eq("household_id", householdId)
    .select()
    .single();

  if (error) {
    console.error("Error resending invitation:", error);
    return { error: error.message, data: null };
  }

  // Get inviter's profile for the email
  const { data: inviterProfile } = await supabase
    .from("profiles")
    .select("first_name, last_name, email")
    .eq("id", user.id)
    .single();

  const inviterName =
    inviterProfile?.first_name && inviterProfile?.last_name
      ? `${inviterProfile.first_name} ${inviterProfile.last_name}`
      : inviterProfile?.first_name || inviterProfile?.email || "Someone";

  // Generate invite link
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
  const inviteLink = `${baseUrl}/invite/${token}`;

  // Send email notification
  try {
    const resend = getResendClient();
    const html = generateInvitationHTML({
      inviterName,
      inviteLink,
      expiresInDays: 7,
    });
    const text = generateInvitationText({
      inviterName,
      inviteLink,
      expiresInDays: 7,
    });

    const { error: emailError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to: data.email,
      subject: `${inviterName} invited you to join their household`,
      html,
      text,
    });

    if (emailError) {
      console.error("Error resending invitation email:", emailError);
    }
  } catch (emailErr) {
    console.error("Failed to resend invitation email:", emailErr);
  }

  revalidatePath("/app/settings/household");

  return { error: null, data };
}

/**
 * Accept a household invitation (called when a user clicks the invite link)
 */
export async function acceptHouseholdInvitation(token: string): Promise<{
  error: string | null;
  householdId: string | null;
}> {
  const supabase = await createClient();

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "You must be logged in to accept an invitation", householdId: null };
  }

  // Find the invitation
  const { data: invitation, error: inviteError } = await supabase
    .from("household_invitations")
    .select("*")
    .eq("token", token)
    .eq("status", "pending")
    .single();

  if (inviteError || !invitation) {
    return { error: "Invalid or expired invitation", householdId: null };
  }

  // Check if invitation is expired
  if (new Date(invitation.expires_at) < new Date()) {
    await supabase
      .from("household_invitations")
      .update({ status: "expired" })
      .eq("id", invitation.id);
    return { error: "This invitation has expired", householdId: null };
  }

  // Check if user is already in a household
  const { data: existingMembership } = await supabase
    .from("household_members")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (existingMembership) {
    return { error: "You are already a member of a household", householdId: null };
  }

  // Add user to household
  const { error: memberError } = await supabase
    .from("household_members")
    .insert({
      household_id: invitation.household_id,
      user_id: user.id,
      role: "member",
    });

  if (memberError) {
    console.error("Error adding member:", memberError);
    return { error: memberError.message, householdId: null };
  }

  // Mark invitation as accepted
  await supabase
    .from("household_invitations")
    .update({ status: "accepted" })
    .eq("id", invitation.id);

  revalidatePath("/app");
  revalidatePath("/app/settings/household");

  return { error: null, householdId: invitation.household_id };
}

/**
 * Get the invitation link URL for sharing
 */
export async function getInvitationLink(token: string): Promise<string> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
  return `${baseUrl}/invite/${token}`;
}
