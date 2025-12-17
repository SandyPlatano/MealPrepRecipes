"use client";

import { useState } from "react";
import { useSettings } from "@/contexts/settings-context";
import { SettingsHeader } from "@/components/settings/layout/settings-header";
import { SettingRow, SettingSection } from "@/components/settings/shared/setting-row";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const { household, settings, updateSettingsField } = useSettings();
  const [newCookName, setNewCookName] = useState("");

  const cookNames = settings.cook_names || ["Me"];
  const cookColors = settings.cook_colors || {};

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

  return (
    <div className="space-y-8">
      <SettingsHeader
        title="Household"
        description="Manage household members and shared settings"
      />

      {/* Household Info */}
      {household ? (
        <SettingSection title="Household">
          <SettingRow
            id="setting-household-name"
            label="Household Name"
            description="Your household's display name"
          >
            <div className="text-sm font-medium">
              {household.household?.name || "Unnamed Household"}
            </div>
          </SettingRow>

          <SettingRow
            id="setting-household-members"
            label="Members"
            description="People in your household"
          >
            <div className="flex flex-col gap-2">
              {household.members.map((member) => (
                <div
                  key={member.user_id}
                  className="flex items-center gap-2 text-sm"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {member.profiles?.first_name?.[0] ||
                        member.profiles?.email?.[0] ||
                        "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span>
                    {member.profiles?.first_name || member.profiles?.email}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {member.role}
                  </Badge>
                </div>
              ))}
            </div>
          </SettingRow>
        </SettingSection>
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

          <div id="setting-cook-colors" className="space-y-3">
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
    </div>
  );
}
