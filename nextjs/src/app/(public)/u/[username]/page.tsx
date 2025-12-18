import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getUserByUsername, getUserPublicRecipes } from "@/app/actions/follows";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChefHat, Users, Eye, Lock } from "lucide-react";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const { data: profile } = await getUserByUsername(username);

  if (!profile) {
    return {
      title: "User not found",
    };
  }

  return {
    title: `${[profile.first_name, profile.last_name].filter(Boolean).join(" ") || `@${profile.username}`} | MealPrepRecipes`,
    description: profile.bio || `Check out ${profile.username}'s public recipes on MealPrepRecipes`,
  };
}

export default async function PublicUserProfilePage({ params }: Props) {
  const { username } = await params;
  const supabase = await createClient();

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  const { data: profile, error } = await getUserByUsername(username);

  if (error || !profile) {
    notFound();
  }

  // If profile is not public and not own profile, show limited view
  const isOwnProfile = currentUser?.id === profile.id;
  const canViewFull = profile.public_profile || isOwnProfile;

  // Get public recipes
  const { data: recipes } = canViewFull
    ? await getUserPublicRecipes(profile.id, { limit: 12 })
    : { data: [] };

  const displayName = [profile.first_name, profile.last_name].filter(Boolean).join(" ") || `@${profile.username}`;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl">
            MealPrepRecipes
          </Link>
          {currentUser ? (
            <Button variant="outline" asChild>
              <Link href="/app">Go to App</Link>
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Profile Card */}
        <Card className="mb-8">
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
                  {(profile.first_name || profile.last_name) && (
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
                    <span className="font-medium">{profile.public_recipe_count || 0}</span>
                    <span className="text-muted-foreground">
                      {(profile.public_recipe_count || 0) === 1 ? "recipe" : "recipes"}
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
              <div>
                {isOwnProfile ? (
                  <Button variant="outline" asChild>
                    <Link href="/app/settings">Edit Profile</Link>
                  </Button>
                ) : !currentUser ? (
                  <Button asChild>
                    <Link href={`/auth/sign-up?redirect=/u/${username}`}>
                      Sign up to Follow
                    </Link>
                  </Button>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Private profile message */}
        {!canViewFull && (
          <div className="text-center py-12">
            <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h2 className="text-lg font-medium mb-2">This profile is private</h2>
            <p className="text-muted-foreground mb-4">
              Follow this user to see their activity
            </p>
            {!currentUser && (
              <Button asChild>
                <Link href={`/auth/sign-up?redirect=/u/${username}`}>
                  Sign up to Follow
                </Link>
              </Button>
            )}
          </div>
        )}

        {/* Public Recipes */}
        {canViewFull && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Public Recipes</h2>

            {recipes && recipes.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {recipes.map((recipe) => (
                  <Link
                    key={recipe.id}
                    href={currentUser ? `/app/recipes/${recipe.id}` : `/discover`}
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
              </div>
            )}

            {!currentUser && recipes && recipes.length > 0 && (
              <div className="text-center mt-8">
                <p className="text-muted-foreground mb-4">
                  Sign up to save recipes and follow {profile.username}
                </p>
                <Button asChild>
                  <Link href={`/auth/sign-up?redirect=/u/${username}`}>
                    Create Free Account
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
