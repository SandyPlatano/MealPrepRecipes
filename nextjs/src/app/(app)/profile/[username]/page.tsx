import { notFound } from "next/navigation";
import {
  getPublicProfile,
  getProfileStats,
  getCookPhotos,
  getProfileReviews,
  getPublicRecipes,
} from "@/app/actions/public-profile";
import { isFollowingUser } from "@/app/actions/follows";
import {
  ProfileHeader,
  ProfileStatsCard,
  ProfileCookPhotos,
  ProfileReviews,
} from "@/components/profile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";

interface ProfilePageProps {
  params: {
    username: string;
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = params;

  // Fetch profile data
  const { data: profile, error } = await getPublicProfile(username);

  if (error || !profile) {
    notFound();
  }

  // Fetch additional data based on privacy settings
  const [statsResult, photosResult, reviewsResult, recipesResult] =
    await Promise.all([
      profile.show_cooking_stats
        ? getProfileStats(profile.id)
        : Promise.resolve({ data: null, error: null }),
      profile.show_cook_photos
        ? getCookPhotos(profile.id, 12)
        : Promise.resolve({ data: null, error: null }),
      profile.show_reviews
        ? getProfileReviews(profile.id, 10)
        : Promise.resolve({ data: null, error: null }),
      getPublicRecipes(profile.id, { limit: 12 }),
    ]);

  const stats = statsResult.data;
  const cookPhotos = photosResult.data || [];
  const reviews = reviewsResult.data || [];
  const recipes = recipesResult.data || [];

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4 space-y-8">
      {/* Profile Header */}
      <ProfileHeader profile={profile} />

      {/* Cooking Stats Card */}
      {profile.show_cooking_stats && stats && (
        <ProfileStatsCard stats={stats} />
      )}

      {/* Public Recipes Section */}
      {recipes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Public Recipes</CardTitle>
            <p className="text-sm text-muted-foreground">
              {profile.public_recipe_count} recipe
              {profile.public_recipe_count !== 1 ? "s" : ""} shared
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recipes.map((recipe) => (
                <Link
                  key={recipe.id}
                  href={`/app/recipes/${recipe.id}`}
                  className="group"
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                    {recipe.image_url && (
                      <div className="relative h-48 w-full">
                        <Image
                          src={recipe.image_url}
                          alt={recipe.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                    )}
                    <CardContent className="p-4 space-y-2">
                      <h3 className="font-semibold line-clamp-1">
                        {recipe.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="secondary">{recipe.recipe_type}</Badge>
                        {recipe.avg_rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>{recipe.avg_rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* I Made It Photos */}
      {profile.show_cook_photos && cookPhotos.length > 0 && (
        <ProfileCookPhotos photos={cookPhotos} username={profile.username} />
      )}

      {/* Reviews Written */}
      {profile.show_reviews && reviews.length > 0 && (
        <ProfileReviews reviews={reviews} username={profile.username} />
      )}
    </div>
  );
}
