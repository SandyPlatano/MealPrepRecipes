"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat, Star, Camera } from "lucide-react";
import type { ProfileCookingEntry } from "@/app/actions/public-profile";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface ProfileCookingHistoryProps {
  entries: ProfileCookingEntry[];
  username: string;
}

export function ProfileCookingHistory({
  entries,
  username,
}: ProfileCookingHistoryProps) {
  if (entries.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ChefHat className="h-5 w-5" />
          Recipes Cooked
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {entries.length} recipe{entries.length !== 1 ? "s" : ""} cooked by @
          {username}
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {entries.map((entry) => (
            <Link
              key={entry.id}
              href={`/app/recipes/${entry.recipe_id}`}
              className="block group"
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Recipe Thumbnail */}
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                      {entry.recipe_image_url ? (
                        <Image
                          src={entry.recipe_image_url}
                          alt={entry.recipe_title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ChefHat className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col gap-2">
                      {/* Recipe Title */}
                      <h4 className="font-semibold text-base group-hover:text-primary transition-colors line-clamp-1">
                        {entry.recipe_title}
                      </h4>

                      {/* Rating and Date */}
                      <div className="flex items-center gap-3 flex-wrap">
                        {entry.rating && (
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={cn(
                                  "h-4 w-4",
                                  star <= entry.rating!
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-muted-foreground/30"
                                )}
                              />
                            ))}
                          </div>
                        )}
                        <span className="text-sm text-muted-foreground">
                          Cooked{" "}
                          {formatDistanceToNow(new Date(entry.cooked_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>

                      {/* Photo indicator */}
                      {entry.photo_url && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Camera className="h-3 w-3" />
                          <span>Photo attached</span>
                        </div>
                      )}

                      {/* Notes */}
                      {entry.notes && (
                        <p className="text-sm text-muted-foreground italic line-clamp-2">
                          &quot;{entry.notes}&quot;
                        </p>
                      )}

                      {/* Modifications */}
                      {entry.modifications && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          <span className="font-medium">Changes:</span>{" "}
                          {entry.modifications}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
