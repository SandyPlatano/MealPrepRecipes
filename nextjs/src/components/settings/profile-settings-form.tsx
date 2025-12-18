"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AvatarUpload } from "./avatar-upload";
import { EmojiPicker } from "./emoji-picker";
import { PrivacyToggles } from "./privacy-toggles";
import {
  User,
  Sparkles,
  MapPin,
  Globe,
  Shield,
  Palette,
  Upload,
  Image as ImageIcon,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type {
  ProfileCustomizationSettings,
  ProfilePrivacySettings,
  CookWithMeStatus,
  CookingSkillLevel,
  UserProfile,
} from "@/types/settings";
import { COOK_WITH_ME_STATUS_LABELS, COOKING_SKILL_LABELS } from "@/types/settings";
import {
  updateProfileCustomization,
  updateProfilePrivacy,
  uploadAvatar,
  uploadCoverImage,
} from "@/app/actions/profile-settings";

interface ProfileSettingsFormProps {
  profile: UserProfile;
}

export function ProfileSettingsForm({ profile }: ProfileSettingsFormProps) {
  const [isPending, startTransition] = useTransition();

  // Basic Info State
  const [bio, setBio] = useState(profile.bio || "");
  const [cookingPhilosophy, setCookingPhilosophy] = useState(profile.cooking_philosophy || "");

  // Fun Stuff State
  const [profileEmoji, setProfileEmoji] = useState(profile.profile_emoji || "👨‍🍳");
  const [currentlyCraving, setCurrentlyCraving] = useState(profile.currently_craving || "");
  const [cookWithMeStatus, setCookWithMeStatus] = useState<CookWithMeStatus>(
    profile.cook_with_me_status || "not_set"
  );
  const [favoriteCuisine, setFavoriteCuisine] = useState(profile.favorite_cuisine || "");
  const [cookingSkillLevel, setCookingSkillLevel] = useState<CookingSkillLevel>(
    profile.cooking_skill_level || "home_cook"
  );

  // Links State
  const [location, setLocation] = useState(profile.location || "");
  const [websiteUrl, setWebsiteUrl] = useState(profile.website_url || "");

  // Theme State
  const [profileAccentColor, setProfileAccentColor] = useState(
    profile.profile_accent_color || "#f97316"
  );

  // Privacy State
  const [privacySettings, setPrivacySettings] = useState<ProfilePrivacySettings>({
    public_profile: profile.public_profile,
    show_cooking_stats: profile.show_cooking_stats,
    show_badges: profile.show_badges,
    show_cook_photos: profile.show_cook_photos,
    show_reviews: profile.show_reviews,
    show_saved_recipes: profile.show_saved_recipes,
  });

  // Cover image state
  const [coverImageUrl, setCoverImageUrl] = useState(profile.cover_image_url);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  const handleSaveCustomization = () => {
    startTransition(async () => {
      const result = await updateProfileCustomization({
        bio,
        cooking_philosophy: cookingPhilosophy,
        profile_emoji: profileEmoji,
        currently_craving: currentlyCraving,
        cook_with_me_status: cookWithMeStatus,
        favorite_cuisine: favoriteCuisine,
        cooking_skill_level: cookingSkillLevel,
        location,
        website_url: websiteUrl,
        profile_accent_color: profileAccentColor,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Profile updated successfully");
      }
    });
  };

  const handlePrivacyChange = (updates: Partial<ProfilePrivacySettings>) => {
    const newSettings = { ...privacySettings, ...updates };
    setPrivacySettings(newSettings);

    startTransition(async () => {
      const result = await updateProfilePrivacy(updates);
      if (result.error) {
        toast.error(result.error);
        // Revert on error
        setPrivacySettings(privacySettings);
      }
    });
  };

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setIsUploadingCover(true);
    const formData = new FormData();
    formData.append("cover", file);

    const result = await uploadCoverImage(formData);
    setIsUploadingCover(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Cover image updated successfully");
      setCoverImageUrl(result.url);
    }
  };

  const bioLength = bio.length;
  const philosophyLength = cookingPhilosophy.length;

  return (
    <div className="space-y-6">
      {/* Cover Image Section */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <ImageIcon className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-base">Cover Image</CardTitle>
          </div>
          <CardDescription className="mt-2 ml-11">
            Add a cover image to personalize your profile
          </CardDescription>
        </CardHeader>
        <Separator className="mb-0" />
        <CardContent className="pt-6">
          <div className="space-y-4">
            {coverImageUrl && (
              <div className="relative w-full h-48 rounded-lg overflow-hidden bg-muted">
                <img
                  src={coverImageUrl}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("cover-upload")?.click()}
                disabled={isUploadingCover}
              >
                {isUploadingCover ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Cover
                  </>
                )}
              </Button>
              <input
                id="cover-upload"
                type="file"
                accept="image/*"
                onChange={handleCoverImageUpload}
                className="hidden"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              JPG, PNG or GIF. Max 10MB. Recommended size: 1200x400px
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Basic Info Section */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <User className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-base">Basic Information</CardTitle>
          </div>
          <CardDescription className="mt-2 ml-11">
            Tell others about yourself and your cooking journey
          </CardDescription>
        </CardHeader>
        <Separator className="mb-0" />
        <CardContent className="pt-6 space-y-6">
          <AvatarUpload
            currentUrl={profile.avatar_url}
            onUpload={uploadAvatar}
            userName={`${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "User"}
          />

          <div className="space-y-2">
            <label htmlFor="bio" className="text-sm font-medium">
              Bio
            </label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              maxLength={500}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {bioLength}/500 characters
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="cooking-philosophy" className="text-sm font-medium">
              Cooking Philosophy
              <span className="text-muted-foreground font-normal ml-2">(max 100 chars)</span>
            </label>
            <Input
              id="cooking-philosophy"
              value={cookingPhilosophy}
              onChange={(e) => setCookingPhilosophy(e.target.value)}
              placeholder="Your cooking tagline..."
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground text-right">
              {philosophyLength}/100 characters
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Fun Stuff Section */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-base">Fun Stuff</CardTitle>
          </div>
          <CardDescription className="mt-2 ml-11">
            Add some personality to your profile - because food is fun
          </CardDescription>
        </CardHeader>
        <Separator className="mb-0" />
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Profile Emoji</label>
            <EmojiPicker value={profileEmoji} onChange={setProfileEmoji} />
          </div>

          <div className="space-y-2">
            <label htmlFor="currently-craving" className="text-sm font-medium">
              Currently Craving
            </label>
            <Input
              id="currently-craving"
              value={currentlyCraving}
              onChange={(e) => setCurrentlyCraving(e.target.value)}
              placeholder="What are you hungry for?"
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="cook-with-me-status" className="text-sm font-medium">
              Cook With Me Status
            </label>
            <Select value={cookWithMeStatus} onValueChange={(v) => setCookWithMeStatus(v as CookWithMeStatus)}>
              <SelectTrigger id="cook-with-me-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(COOK_WITH_ME_STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="favorite-cuisine" className="text-sm font-medium">
              Favorite Cuisine
            </label>
            <Input
              id="favorite-cuisine"
              value={favoriteCuisine}
              onChange={(e) => setFavoriteCuisine(e.target.value)}
              placeholder="Italian, Thai, Mexican..."
              maxLength={50}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="cooking-skill-level" className="text-sm font-medium">
              Cooking Skill Level
            </label>
            <Select value={cookingSkillLevel} onValueChange={(v) => setCookingSkillLevel(v as CookingSkillLevel)}>
              <SelectTrigger id="cooking-skill-level">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(COOKING_SKILL_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Links Section */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Globe className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-base">Links & Location</CardTitle>
          </div>
          <CardDescription className="mt-2 ml-11">
            Help others find and connect with you
          </CardDescription>
        </CardHeader>
        <Separator className="mb-0" />
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-2">
            <label htmlFor="location" className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location
            </label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, State"
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="website-url" className="text-sm font-medium flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Website
            </label>
            <Input
              id="website-url"
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://yourwebsite.com"
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy Section */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-base">Privacy Controls</CardTitle>
          </div>
          <CardDescription className="mt-2 ml-11">
            Control what others can see on your profile
          </CardDescription>
        </CardHeader>
        <Separator className="mb-0" />
        <CardContent className="pt-6">
          <PrivacyToggles settings={privacySettings} onChange={handlePrivacyChange} />
        </CardContent>
      </Card>

      {/* Profile Theme Section */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Palette className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-base">Profile Theme</CardTitle>
          </div>
          <CardDescription className="mt-2 ml-11">
            Customize the accent color for your profile
          </CardDescription>
        </CardHeader>
        <Separator className="mb-0" />
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="space-y-2 flex-1">
              <label htmlFor="accent-color" className="text-sm font-medium">
                Accent Color
              </label>
              <div className="flex gap-2 items-center">
                <Input
                  id="accent-color"
                  type="color"
                  value={profileAccentColor}
                  onChange={(e) => setProfileAccentColor(e.target.value)}
                  className="w-20 h-10 cursor-pointer"
                />
                <Input
                  type="text"
                  value={profileAccentColor}
                  onChange={(e) => setProfileAccentColor(e.target.value)}
                  className="font-mono"
                  placeholder="#f97316"
                />
              </div>
            </div>
            <div
              className="w-16 h-16 rounded-lg border-2"
              style={{ backgroundColor: profileAccentColor }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveCustomization} disabled={isPending} size="lg">
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Profile"
          )}
        </Button>
      </div>
    </div>
  );
}
