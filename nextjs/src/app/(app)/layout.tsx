import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { logout } from "@/app/actions/auth";
import { QuickCookProvider } from "@/components/quick-cook/quick-cook-provider";
import { AppShell } from "@/components/layout/app-shell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  let user = null;

  try {
    const { data } = await supabase.auth.getUser();
    user = data?.user ?? null;
  } catch (error) {
    console.error("Failed to get user in app layout:", error);
    // If auth check fails, redirect to login
    redirect("/login");
  }

  if (!user) {
    redirect("/login");
  }

  return (
    <QuickCookProvider>
      <AppShell user={user} logoutAction={logout}>
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {children}
        </div>
      </AppShell>
    </QuickCookProvider>
  );
}
