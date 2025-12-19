"use client";

import { Switch } from "@/components/ui/switch";
import { SettingRow } from "./shared/setting-row";
import type { ProfilePrivacySettings } from "@/types/settings";

interface PrivacyTogglesProps {
  settings: ProfilePrivacySettings;
  onChange: (settings: Partial<ProfilePrivacySettings>) => void;
}

export function PrivacyToggles({ settings, onChange }: PrivacyTogglesProps) {
  return (
    <div className="flex flex-col gap-0 divide-y divide-border">
      <SettingRow
        id="setting-public-profile"
        label="Public Profile"
        description="Make your profile visible to anyone with the link"
      >
        <Switch
          id="setting-public-profile-control"
          checked={settings.public_profile}
          onCheckedChange={(checked) => onChange({ public_profile: checked })}
        />
      </SettingRow>

      <SettingRow
        id="setting-show-cooking-stats"
        label="Show Cooking Stats"
        description="Display your cooking history and recipe counts"
      >
        <Switch
          id="setting-show-cooking-stats-control"
          checked={settings.show_cooking_stats}
          onCheckedChange={(checked) => onChange({ show_cooking_stats: checked })}
        />
      </SettingRow>

      <SettingRow
        id="setting-show-badges"
        label="Show Badges"
        description="Display your earned achievement badges"
      >
        <Switch
          id="setting-show-badges-control"
          checked={settings.show_badges}
          onCheckedChange={(checked) => onChange({ show_badges: checked })}
        />
      </SettingRow>

      <SettingRow
        id="setting-show-cook-photos"
        label="Show Cook Photos"
        description="Display photos from your cooking sessions"
      >
        <Switch
          id="setting-show-cook-photos-control"
          checked={settings.show_cook_photos}
          onCheckedChange={(checked) => onChange({ show_cook_photos: checked })}
        />
      </SettingRow>

      <SettingRow
        id="setting-show-reviews"
        label="Show Reviews"
        description="Display your recipe reviews and ratings"
      >
        <Switch
          id="setting-show-reviews-control"
          checked={settings.show_reviews}
          onCheckedChange={(checked) => onChange({ show_reviews: checked })}
        />
      </SettingRow>

      <SettingRow
        id="setting-show-saved-recipes"
        label="Show Saved Recipes"
        description="Display your saved recipe collection"
      >
        <Switch
          id="setting-show-saved-recipes-control"
          checked={settings.show_saved_recipes}
          onCheckedChange={(checked) => onChange({ show_saved_recipes: checked })}
        />
      </SettingRow>
    </div>
  );
}
