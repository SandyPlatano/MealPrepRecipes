import { getProfile, getSettings, getHouseholdInfo, getMealTypeCustomization, getPlannerViewSettings } from "@/app/actions/settings";
import { getUserSubstitutions, getDefaultSubstitutions } from "@/lib/substitutions";
import { SettingsForm } from "@/components/settings/settings-form";
import { isCurrentUserAdmin } from "@/lib/auth/admin";

export default async function SettingsPage() {
  const [profileResult, settingsResult, householdResult, userSubstitutions, defaultSubstitutions, isAdmin, mealTypeSettingsResult, plannerViewSettingsResult] = await Promise.all([
    getProfile(),
    getSettings(),
    getHouseholdInfo(),
    getUserSubstitutions(),
    getDefaultSubstitutions(),
    isCurrentUserAdmin(),
    getMealTypeCustomization(),
    getPlannerViewSettings(),
  ]);

  const profile = profileResult.data || {
    id: "",
    first_name: null,
    last_name: null,
    email: null,
    username: null,
  };

  const settings = settingsResult.data || {
    dark_mode: false,
    cook_names: ["Me"],
    email_notifications: true,
  };

  const household = householdResult.data?.household as unknown as { id: string; name: string } | null;
  const householdRole = householdResult.data?.role || "member";
  const members = (householdResult.data?.members || []) as unknown as Array<{
    user_id: string;
    role: string;
    profiles: { first_name: string | null; last_name: string | null; email: string | null } | null;
  }>;

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-mono font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Set it up once, stop hearing &quot;you never plan anything.&quot;
        </p>
      </div>

      <SettingsForm
        profile={profile}
        settings={settings}
        household={household}
        householdRole={householdRole}
        members={members}
        userSubstitutions={userSubstitutions}
        defaultSubstitutions={defaultSubstitutions}
        username={profile.username || null}
        isAdmin={isAdmin}
        mealTypeSettings={mealTypeSettingsResult.data}
        plannerViewSettings={plannerViewSettingsResult.data}
      />
    </div>
  );
}
