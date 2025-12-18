"use client";

import { useState } from "react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  MapPin,
  ExternalLink,
  Users,
  UserPlus,
  UserMinus,
  ChefHat,
  Heart,
  Sparkles,
  Clock,
} from "lucide-react";
import { followUser, unfollowUser } from "@/app/actions/follows";
import { toast } from "sonner";
import type { PublicProfile } from "@/types/profile";
import { cn } from "@/lib/utils";

interface ProfileHeaderProps {
  profile: PublicProfile;
}

// Theme colors for profile backgrounds
const themeColors: Record<string, string> = {
  default: "from-blue-500 to-purple-600",
  forest: "from-green-600 to-teal-700",
  ocean: "from-blue-600 to-cyan-600",
  sunset: "from-orange-500 to-pink-600",
  midnight: "from-purple-900 to-indigo-900",
};

// Cook with me status badges
const cookWithMeConfig = {
  not_set: { label: null, color: null, icon: null },
  open: {
    label: "Open to Cook Together",
    color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    icon: ChefHat,
  },
  busy: {
    label: "Cooking Solo Right Now",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    icon: Clock,
  },
  looking_for_partner: {
    label: "Looking for Cook Partner",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    icon: Heart,
  },
};

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const [isFollowing, setIsFollowing] = useState(profile.is_following ?? false);
  const [followerCount, setFollowerCount] = useState(profile.follower_count);
  const [isLoading, setIsLoading] = useState(false);

  const handleFollowToggle = async () => {
    setIsLoading(true);

    const result = isFollowing
      ? await unfollowUser(profile.id)
      : await followUser(profile.id);

    if (result.error) {
      toast.error(result.error);
    } else {
      setIsFollowing(!isFollowing);
      setFollowerCount((prev) => prev + (isFollowing ? -1 : 1));
      toast.success(
        isFollowing
          ? `Unfollowed @${profile.username}`
          : `Following @${profile.username}`
      );
    }

    setIsLoading(false);
  };

  const themeGradient = themeColors[profile.profile_theme] || themeColors.default;
  const cookWithMe = cookWithMeConfig[profile.cook_with_me_status];
  const CookIcon = cookWithMe.icon;

  return (
    <Card className="overflow-hidden">
      {/* Cover Image or Gradient */}
      <div
        className={cn(
          "h-48 w-full relative",
          profile.cover_image_url ? "" : `bg-gradient-to-r ${themeGradient}`
        )}
      >
        {profile.cover_image_url && (
          <Image
            src={profile.cover_image_url}
            alt="Cover"
            fill
            className="object-cover"
          />
        )}
      </div>

      <CardContent className="relative pt-0 px-6 pb-6">
        {/* Avatar with profile emoji */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-16 mb-4">
          <div className="relative">
            <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="text-3xl">
                {profile.username?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-2 -right-2 h-12 w-12 rounded-full bg-background border-2 border-background shadow-lg flex items-center justify-center text-2xl">
              {profile.profile_emoji}
            </div>
          </div>

          <div className="flex-1 sm:mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 className="text-3xl font-bold">
                  {profile.first_name && profile.last_name
                    ? `${profile.first_name} ${profile.last_name}`
                    : profile.username}
                </h1>
                <p className="text-muted-foreground">@{profile.username}</p>
              </div>

              {/* Follow Button */}
              {profile.is_following !== undefined && (
                <Button
                  onClick={handleFollowToggle}
                  disabled={isLoading}
                  variant={isFollowing ? "outline" : "default"}
                  className="w-full sm:w-auto"
                >
                  {isFollowing ? (
                    <>
                      <UserMinus className="h-4 w-4 mr-2" />
                      Following
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Follow
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-muted-foreground mb-4">{profile.bio}</p>
        )}

        {/* Cooking Philosophy */}
        {profile.cooking_philosophy && (
          <div className="flex items-start gap-2 mb-4 p-3 rounded-lg bg-muted/50">
            <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <p className="italic text-sm">{profile.cooking_philosophy}</p>
          </div>
        )}

        {/* Currently Craving */}
        {profile.currently_craving && (
          <div className="mb-4">
            <Badge variant="secondary" className="text-base py-1.5 px-3">
              Currently craving: {profile.currently_craving}
            </Badge>
          </div>
        )}

        {/* Cook With Me Status */}
        {cookWithMe.label && CookIcon && (
          <div className="mb-4">
            <Badge className={cn("text-sm py-1.5 px-3", cookWithMe.color)}>
              <CookIcon className="h-4 w-4 mr-1.5" />
              {cookWithMe.label}
            </Badge>
          </div>
        )}

        {/* Meta Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          {/* Followers */}
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold">{followerCount}</div>
            <div className="text-sm text-muted-foreground">Followers</div>
          </div>

          {/* Following */}
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold">{profile.following_count}</div>
            <div className="text-sm text-muted-foreground">Following</div>
          </div>

          {/* Recipes */}
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold">{profile.public_recipe_count}</div>
            <div className="text-sm text-muted-foreground">Recipes</div>
          </div>

          {/* Total Cooks */}
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold">{profile.total_cooks}</div>
            <div className="text-sm text-muted-foreground">Cooks</div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {profile.location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{profile.location}</span>
            </div>
          )}

          {profile.favorite_cuisine && (
            <div className="flex items-center gap-1">
              <ChefHat className="h-4 w-4" />
              <span>Loves {profile.favorite_cuisine}</span>
            </div>
          )}

          {profile.cooking_skill && (
            <Badge variant="outline" className="capitalize">
              {profile.cooking_skill.replace("_", " ")}
            </Badge>
          )}

          {profile.website && (
            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-primary transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Website</span>
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
