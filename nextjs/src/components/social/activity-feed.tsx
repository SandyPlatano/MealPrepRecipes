"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ChefHat, Star, UtensilsCrossed, Loader2 } from "lucide-react";
import { getActivityFeed } from "@/app/actions/follows";
import type { ActivityFeedItem } from "@/types/social";

interface ActivityFeedProps {
  initialItems?: ActivityFeedItem[];
}

export function ActivityFeed({ initialItems = [] }: ActivityFeedProps) {
  const [items, setItems] = useState<ActivityFeedItem[]>(initialItems);
  const [isLoading, setIsLoading] = useState(initialItems.length === 0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(initialItems.length);

  const LIMIT = 20;

  const loadFeed = useCallback(async (reset = false) => {
    if (reset) {
      setIsLoading(true);
    }

    const result = await getActivityFeed({
      limit: LIMIT,
      offset: reset ? 0 : offset,
    });

    if (result.data) {
      if (reset) {
        setItems(result.data);
        setOffset(result.data.length);
      } else {
        setItems((prev) => [...prev, ...result.data!]);
        setOffset((prev) => prev + result.data!.length);
      }
      setHasMore(result.data.length === LIMIT);
    }

    setIsLoading(false);
    setIsLoadingMore(false);
  }, [offset]);

  useEffect(() => {
    if (initialItems.length === 0) {
      loadFeed(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    loadFeed(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <ActivityItemSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<UtensilsCrossed className="h-12 w-12 text-muted-foreground/50" />}
        title="Your feed is empty"
        description="Follow some chefs to see their latest recipes and activity here!"
        action={
          <Button asChild>
            <Link href="/app/discover">Discover Chefs</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <ActivityItem key={item.id} item={item} />
      ))}

      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

function ActivityItem({ item }: { item: ActivityFeedItem }) {
  const getEventIcon = () => {
    switch (item.event_type) {
      case "new_recipe":
        return <ChefHat className="h-4 w-4" />;
      case "review":
        return <Star className="h-4 w-4" />;
      case "cook_logged":
        return <UtensilsCrossed className="h-4 w-4" />;
      default:
        return <ChefHat className="h-4 w-4" />;
    }
  };

  const getEventText = () => {
    switch (item.event_type) {
      case "new_recipe":
        return "shared a new recipe";
      case "review":
        return "reviewed a recipe";
      case "cook_logged":
        return "cooked a recipe";
      default:
        return "did something";
    }
  };

  return (
    <div className="flex gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
      {/* Avatar */}
      <Link href={`/u/${item.actor.username}`}>
        <Avatar>
          <AvatarImage src={item.actor.avatar_url || undefined} />
          <AvatarFallback>
            {item.actor.username?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </Link>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">{getEventIcon()}</span>
          <Link
            href={`/u/${item.actor.username}`}
            className="font-medium hover:underline"
          >
            @{item.actor.username}
          </Link>
          <span className="text-muted-foreground">{getEventText()}</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">
            {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
          </span>
        </div>

        {/* Recipe preview */}
        {item.recipe && (
          <Link
            href={`/app/recipes/${item.recipe.id}`}
            className="mt-3 flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
          >
            {item.recipe.image_url ? (
              <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                <Image
                  src={item.recipe.image_url}
                  alt={item.recipe.title}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                <ChefHat className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{item.recipe.title}</p>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}

function ActivityItemSkeleton() {
  return (
    <div className="flex gap-4 p-4 border rounded-lg">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-16 w-full rounded-lg" />
      </div>
    </div>
  );
}
