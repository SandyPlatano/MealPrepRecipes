"use client";

import { useState, useEffect } from "react";
import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChefHat,
  Users,
  Eye,
  Lock,
  Loader2,
  Grid3X3,
  Activity,
} from "lucide-react";
import { FollowButton } from "@/components/social/follow-button";
import { FollowersModal } from "@/components/social/followers-modal";
import { PublicRecipeCard } from "@/components/social/public-recipe-card";
import { ActivityFeed } from "@/components/social/activity-feed";
import {
  getUserByUsername,
  getUserPublicRecipes,
} from "@/app/actions/follows";
import { useUser } from "@/hooks/use-user";
import type { UserProfile } from "@/types/social";

export default function UserProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const { user: currentUser } = useUser();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [recipes, setRecipes] = useState<
    { id: string; title: string; image_url: string | null; view_count: number }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("recipes");
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [followersModalTab, setFollowersModalTab] = useState<
    "followers" | "following"
  >("followers");

  useEffect(() => {
    async function loadProfile() {
      setIsLoading(true);
      const { data: profileData, error } = await getUserByUsername(username);

      if (error || !profileData) {
        setIsLoading(false);
        return;
      }

      setProfile(profileData);

      // Load public recipes if profile is public
      if (profileData.public_profile || currentUser?.id === profileData.id) {
        const { data: recipesData } = await getUserPublicRecipes(profileData.id, {
          limit: 20,
        });
        setRecipes(recipesData || []);
      }

      setIsLoading(false);
    }

    loadProfile();
  }, [username, currentUser?.id]);

  const handleFollowChange = (isFollowing: boolean) => {
    if (profile) {
      setProfile({
        ...profile,
        is_following: isFollowing,
        follower_count: profile.follower_count + (isFollowing ? 1 : -1),
      });
    }
  };

  const openFollowersModal = (tab: "followers" | "following") => {
    setFollowersModalTab(tab);
    setShowFollowersModal(true);
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (!profile) {
    notFound();
  }

  const isOwnProfile = currentUser?.id === profile.id;
  const canViewFull = profile.public_profile || isOwnProfile;
  const displayName = profile.name || `@${profile.username}`;

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:items-start gap-6">
            {/* Avatar */}
            <Avatar className="h-24 w-24 sm:h-32 sm:w-32">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="text-3xl">
                {profile.username?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-2xl font-bold">{displayName}</h1>
                {profile.name && (
                  <p className="text-muted-foreground">@{profile.username}</p>
                )}
              </div>

              {profile.bio && canViewFull && (
                <p className="text-muted-foreground">{profile.bio}</p>
              )}

              {/* Stats */}
              <div className="flex items-center justify-center sm:justify-start gap-6 text-sm">
                <div className="flex items-center gap-1.5">
                  <ChefHat className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {profile.public_recipe_count || 0}
                  </span>
                  <span className="text-muted-foreground">
                    {(profile.public_recipe_count || 0) === 1
                      ? "recipe"
                      : "recipes"}
                  </span>
                </div>
                <button
                  onClick={() => openFollowersModal("followers")}
                  className="flex items-center gap-1.5 hover:underline"
                >
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{profile.follower_count}</span>
                  <span className="text-muted-foreground">
                    {profile.follower_count === 1 ? "follower" : "followers"}
                  </span>
                </button>
                <button
                  onClick={() => openFollowersModal("following")}
                  className="text-muted-foreground hover:underline"
                >
                  <span className="font-medium text-foreground">
                    {profile.following_count}
                  </span>{" "}
                  following
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              {isOwnProfile ? (
                <Button variant="outline" asChild>
                  <Link href="/app/settings">Edit Profile</Link>
                </Button>
              ) : (
                <FollowButton
                  userId={profile.id}
                  initialIsFollowing={profile.is_following}
                  onFollowChange={handleFollowChange}
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Private profile message */}
      {!canViewFull && (
        <div className="text-center py-12">
          <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <h2 className="text-lg font-medium mb-2">This profile is private</h2>
          <p className="text-muted-foreground">
            Follow this user to see their activity
          </p>
        </div>
      )}

      {/* Content tabs */}
      {canViewFull && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="recipes" className="gap-2">
              <Grid3X3 className="h-4 w-4" />
              Recipes
            </TabsTrigger>
            {isOwnProfile && (
              <TabsTrigger value="activity" className="gap-2">
                <Activity className="h-4 w-4" />
                Activity Feed
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="recipes" className="mt-6">
            {recipes.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {recipes.map((recipe) => (
                  <Link
                    key={recipe.id}
                    href={`/app/recipes/${recipe.id}`}
                    className="group"
                  >
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                      {recipe.image_url ? (
                        <Image
                          src={recipe.image_url}
                          alt={recipe.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ChefHat className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white text-sm font-medium truncate">
                          {recipe.title}
                        </p>
                        <div className="flex items-center gap-1 text-white/80 text-xs">
                          <Eye className="h-3 w-3" />
                          <span>{recipe.view_count}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <ChefHat className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No public recipes yet</p>
                {isOwnProfile && (
                  <p className="text-sm mt-2">
                    Make a recipe public to share it with the community
                  </p>
                )}
              </div>
            )}
          </TabsContent>

          {isOwnProfile && (
            <TabsContent value="activity" className="mt-6">
              <ActivityFeed />
            </TabsContent>
          )}
        </Tabs>
      )}

      {/* Followers Modal */}
      {profile && (
        <FollowersModal
          open={showFollowersModal}
          onOpenChange={setShowFollowersModal}
          userId={profile.id}
          username={profile.username}
          currentUserId={currentUser?.id}
          initialTab={followersModalTab}
          followerCount={profile.follower_count}
          followingCount={profile.following_count}
        />
      )}
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
            <Skeleton className="h-24 w-24 sm:h-32 sm:w-32 rounded-full" />
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-16 w-full" />
              <div className="flex gap-6">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-24" />
              </div>
            </div>
            <Skeleton className="h-10 w-28" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-lg" />
        ))}
      </div>
    </div>
  );
}
