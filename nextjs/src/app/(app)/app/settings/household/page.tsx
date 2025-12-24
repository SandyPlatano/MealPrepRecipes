"use client";

import { useState, useEffect } from "react";
import { useSettings } from "@/contexts/settings-context";
import { usePermissions } from "@/hooks/use-permissions";
import { SettingsHeader } from "@/components/settings/layout/settings-header";
import { SettingRow, SettingSection } from "@/components/settings/shared/setting-row";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, X, Check, Loader2, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { PermissionModeSelector } from "@/components/settings/household/permission-mode-selector";
import { MemberRoleEditor } from "@/components/settings/household/member-role-editor";
import { ChildPermissionsEditor } from "@/components/settings/household/child-permissions-editor";
import { ContributionDashboard } from "@/components/settings/household/contribution-dashboard";
import { InvitationManager } from "@/components/settings/household/invitation-manager";
import { DefaultCooksByDayEditor } from "@/components/household/default-cooks-by-day-editor";
import {
  updatePermissionMode,
  updateMemberRole,
  updateHouseholdSettings,
  getHouseholdPermissions,
  getHouseholdContributionStats,
} from "@/app/actions/household-permissions";
import { updateHouseholdName } from "@/app/actions/settings";
import type { PermissionMode, HouseholdRole, ChildPermissions } from "@/types/household-permissions";
import { DEFAULT_CHILD_PERMISSIONS } from "@/types/household-permissions";
import { toast } from "sonner";
import type { MemberContribution } from "@/components/settings/household/contribution-dashboard";

const COOK_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
];

export default function HouseholdSettingsPage() {
  const { household, settings, updateSettingsField, profile } = useSettings();
  const { isOwner } = usePermissions();
  const [newCookName, setNewCookName] = useState("");
  const [permissionMode, setPermissionMode] = useState<PermissionMode>("managed");
  const [childPermissions, setChildPermissions] = useState<ChildPermissions>(DEFAULT_CHILD_PERMISSIONS);
  const [contributions, setContributions] = useState<MemberContribution[]>([]);

  // Household name editing state
  const [householdName, setHouseholdName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isSavingName, setIsSavingName] = useState(false);

  const cookNames = settings.cook_names || ["Me"];
  const cookColors = settings.cook_colors || {};

  // Initialize household name when loaded
  useEffect(() => {
    if (household?.household?.name) {
      setHouseholdName(household.household.name);
    }
  }, [household?.household?.name]);

  // Load household permissions and contribution stats on mount
  useEffect(() => {
    async function loadData() {
      const [permissionsResult, contributionsResult] = await Promise.all([
        getHouseholdPermissions(),
        getHouseholdContributionStats(),
      ]);

      if (!permissionsResult.error && permissionsResult.data) {
        setPermissionMode(permissionsResult.data.permissionMode);
        setChildPermissions(
          permissionsResult.data.settings?.childPermissions || DEFAULT_CHILD_PERMISSIONS
        );
      }

      if (!contributionsResult.error && contributionsResult.data) {
        setContributions(
          contributionsResult.data.map((stat) => ({
            user_id: stat.userId,
            first_name: stat.firstName || null,
            email: stat.email || null,
            meals_planned: stat.mealsPlanned,
            meals_cooked: stat.mealsCooked,
            items_added: stat.recipesCreated,
          }))
        );
      }
    }

    if (household) {
      loadData();
    }
  }, [household]);

  // Save household name handler
  const handleSaveHouseholdName = async () => {
    if (!householdName.trim()) {
      toast.error("Household name cannot be empty");
      return;
    }

    setIsSavingName(true);
    const result = await updateHouseholdName(householdName.trim());
    setIsSavingName(false);

    if (result.error) {
      toast.error(typeof result.error === "string" ? result.error : "Failed to update name");
    } else {
      toast.success("Household name updated");
      setIsEditingName(false);
    }
  };

  const handleCancelEditName = () => {
    setHouseholdName(household?.household?.name || "");
    setIsEditingName(false);
  };

  const addCook = () => {
    if (!newCookName.trim()) return;
    const updated = [...cookNames, newCookName.trim()];
    updateSettingsField("cook_names", updated);
    setNewCookName("");
  };

  const removeCook = (index: number) => {
    const updated = cookNames.filter((_, i) => i !== index);
    updateSettingsField("cook_names", updated.length ? updated : ["Me"]);
  };

  const setCookColor = (name: string, color: string) => {
    updateSettingsField("cook_colors", { ...cookColors, [name]: color });
  };

  const handlePermissionModeChange = async (mode: PermissionMode) => {
    const result = await updatePermissionMode(mode);
    if (result.error) {
      toast.error(`Failed to update permission mode: ${result.error}`);
    } else {
      setPermissionMode(mode);
      toast.success("Permission mode updated");
    }
  };

  const handleMemberRoleChange = async (memberId: string, role: HouseholdRole) => {
    const result = await updateMemberRole(memberId, role);
    if (result.error) {
      toast.error(`Failed to update member role: ${result.error}`);
    } else {
      toast.success("Member role updated");
    }
  };

  const handleChildPermissionsChange = async (permissions: ChildPermissions) => {
    setChildPermissions(permissions);
    const result = await updateHouseholdSettings({
      childPermissions: permissions,
      guestCanViewShoppingList: false,
      showContributionBadges: true,
    });
    if (result.error) {
      toast.error(`Failed to update child permissions: ${result.error}`);
    } else {
      toast.success("Child permissions updated");
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <SettingsHeader
        title="Household"
        description="Manage household members and shared settings"
      />

      {/* Household Info */}
      {household ? (
        <>
          <SettingSection title="Household">
            <SettingRow
              id="setting-household-name"
              label="Household Name"
              description="Your household's display name"
            >
              {isOwner ? (
                isEditingName ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={householdName}
                      onChange={(e) => setHouseholdName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveHouseholdName();
                        if (e.key === "Escape") handleCancelEditName();
                      }}
                      className="w-48"
                      autoFocus
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={handleSaveHouseholdName}
                      disabled={isSavingName}
                    >
                      {isSavingName ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4 text-green-500" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={handleCancelEditName}
                      disabled={isSavingName}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {householdName || "Unnamed Household"}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => setIsEditingName(true)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )
              ) : (
                <div className="text-sm font-medium">
                  {household.household?.name || "Unnamed Household"}
                </div>
              )}
            </SettingRow>
          </SettingSection>

          {/* Invite Members */}
          <SettingSection
            title="Invite Members"
            description="Add new members to your household"
          >
            <div className="py-4">
              <InvitationManager isOwner={isOwner} />
            </div>
          </SettingSection>

          {/* Permission Mode */}
          <SettingSection
            title="Permission Mode"
            description="Control how permissions are managed in your household"
          >
            <div className="py-4">
              <PermissionModeSelector
                value={permissionMode}
                onChange={handlePermissionModeChange}
                isOwner={isOwner}
              />
            </div>
          </SettingSection>

          {/* Members & Roles */}
          <SettingSection
            title="Members & Roles"
            description="Manage member roles and permissions"
          >
            <div className="py-4">
              <MemberRoleEditor
                members={household.members}
                currentUserId={profile.id}
                permissionMode={permissionMode}
                onRoleChange={handleMemberRoleChange}
                isOwner={isOwner}
              />
            </div>
          </SettingSection>

          {/* Child Permissions (only show in family mode) */}
          {permissionMode === "family" && (
            <SettingSection
              title="Child Permissions"
              description="Configure what child accounts can do"
            >
              <div className="py-4">
                <ChildPermissionsEditor
                  permissions={childPermissions}
                  onChange={handleChildPermissionsChange}
                />
              </div>
            </SettingSection>
          )}

          {/* Contribution Dashboard */}
          {contributions.length > 0 && (
            <ContributionDashboard contributions={contributions} />
          )}
        </>
      ) : (
        <SettingSection title="Household">
          <p className="text-sm text-muted-foreground py-4">
            You don&apos;t have a household set up yet.
          </p>
        </SettingSection>
      )}

      {/* Cooks */}
      <SettingSection title="Cooks">
        <div id="setting-cook-names" className="py-2">
          <p className="text-sm text-muted-foreground mb-4">
            Track who&apos;s cooking each meal with color-coded cook names.
          </p>

          <div id="setting-cook-colors" className="flex flex-col gap-3">
            {cookNames.map((name, index) => (
              <div
                key={index}
                className="flex items-center gap-3"
              >
                <div
                  className="w-6 h-6 rounded-full border-2"
                  style={{
                    backgroundColor: cookColors[name] || COOK_COLORS[index % COOK_COLORS.length],
                  }}
                />
                <span className="text-sm font-medium flex-1">{name}</span>
                <div className="flex gap-1">
                  {COOK_COLORS.map((color) => (
                    <button
                      type="button"
                      key={color}
                      onClick={() => setCookColor(name, color)}
                      className={cn(
                        "w-5 h-5 rounded-full transition-transform hover:scale-110",
                        cookColors[name] === color && "ring-2 ring-offset-1 ring-primary"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                {cookNames.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => removeCook(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}

            <div className="flex items-center gap-2 pt-2">
              <Input
                placeholder="Add a cook..."
                value={newCookName}
                onChange={(e) => setNewCookName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCook()}
                className="flex-1"
              />
              <Button onClick={addCook} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </SettingSection>

      {/* Default Cooks by Day - for quick-add feature */}
      <DefaultCooksByDayEditor
        cookNames={cookNames}
        cookColors={cookColors}
      />
    </div>
  );
}
