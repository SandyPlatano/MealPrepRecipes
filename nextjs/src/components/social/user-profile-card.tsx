"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChefHat, Users } from "lucide-react";
import { FollowButton } from "./follow-button";
import type { UserProfile } from "@/types/social";

interface UserProfileCardProps {
  profile: UserProfile;
  currentUserId?: string;
  showFollowButton?: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
  variant?: "default" | "compact";
}

export function UserProfileCard({
  profile,
  currentUserId,
  showFollowButton = true,
  onFollowChange,
  variant = "default",
}: UserProfileCardProps) {
  const isOwnProfile = currentUserId === profile.id;
  const displayName = profile.name || `@${profile.username}`;

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-3 p-2">
        <Link href={`/u/${profile.username}`}>
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback>
              {profile.username?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1 min-w-0">
          <Link
            href={`/u/${profile.username}`}
            className="font-medium hover:underline truncate block"
          >
            {displayName}
          </Link>
          <p className="text-sm text-muted-foreground truncate">
            @{profile.username}
          </p>
        </div>
        {showFollowButton && !isOwnProfile && currentUserId && (
          <FollowButton
            userId={profile.id}
            initialIsFollowing={profile.is_following}
            onFollowChange={onFollowChange}
            size="sm"
          />
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:items-start gap-4">
          {/* Avatar */}
          <Link href={`/u/${profile.username}`}>
            <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="text-2xl">
                {profile.username?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>

          {/* Info */}
          <div className="flex-1 space-y-3">
            <div>
              <Link
                href={`/u/${profile.username}`}
                className="text-xl font-semibold hover:underline"
              >
                {displayName}
              </Link>
              {profile.name && (
                <p className="text-muted-foreground">@{profile.username}</p>
              )}
            </div>

            {profile.bio && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {profile.bio}
              </p>
            )}

            {/* Stats */}
            <div className="flex items-center justify-center sm:justify-start gap-6 text-sm">
              <div className="flex items-center gap-1.5">
                <ChefHat className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{profile.public_recipe_count || 0}</span>
                <span className="text-muted-foreground">
                  {profile.public_recipe_count === 1 ? "recipe" : "recipes"}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{profile.follower_count}</span>
                <span className="text-muted-foreground">
                  {profile.follower_count === 1 ? "follower" : "followers"}
                </span>
              </div>
              <div className="text-muted-foreground">
                <span className="font-medium text-foreground">
                  {profile.following_count}
                </span>{" "}
                following
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            {isOwnProfile ? (
              <Button variant="outline" asChild>
                <Link href="/app/settings">Edit Profile</Link>
              </Button>
            ) : showFollowButton && currentUserId ? (
              <FollowButton
                userId={profile.id}
                initialIsFollowing={profile.is_following}
                onFollowChange={onFollowChange}
              />
            ) : !currentUserId ? (
              <Button asChild>
                <Link href="/auth/sign-in">Sign in to Follow</Link>
              </Button>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
