import { redirect } from "next/navigation";

// Redirect to the first settings category (Profile)
export default function SettingsPage() {
  redirect("/app/settings/profile");
}
