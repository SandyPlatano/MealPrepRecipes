"use client";

import { useState, useEffect, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Users } from "lucide-react";
import { getHouseholdActivities } from "@/app/actions/household";
import { useActivityFeedRealtime } from "@/hooks/use-household-realtime";
import type { HouseholdActivityWithUser } from "@/types/household";
import { ACTIVITY_TYPE_CONFIG } from "@/types/household";

interface HouseholdActivityFeedProps {
  householdId: string | null;
  initialItems?: HouseholdActivityWithUser[];
}

export function HouseholdActivityFeed({ householdId, initialItems = [] }: HouseholdActivityFeedProps) {
  const [items, setItems] = useState<HouseholdActivityWithUser[]>(initialItems);
  const [isLoading, setIsLoading] = useState(initialItems.length === 0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(initialItems.length);

  const LIMIT = 20;

  const loadFeed = useCallback(async (reset = false) => {
    if (reset) {
      setIsLoading(true);
    }

    const result = await getHouseholdActivities(LIMIT);

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
  }, []);

  useEffect(() => {
    if (initialItems.length === 0) {
      loadFeed(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Real-time updates for new activities
  useActivityFeedRealtime(householdId, (payload) => {
    if (payload.eventType === "INSERT" && payload.new) {
      const newActivity = payload.new;
      setItems((prev) => [newActivity as HouseholdActivityWithUser, ...prev]);
    }
  });

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    loadFeed(false);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <ActivityItemSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
        <h3 className="text-lg font-medium mb-2">No household activity yet</h3>
        <p className="text-muted-foreground">
          Activity from your household members will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
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

function ActivityItem({ item }: { item: HouseholdActivityWithUser }) {
  const config = ACTIVITY_TYPE_CONFIG[item.activity_type];

  const getUserDisplayName = () => {
    if (item.user?.first_name) {
      return item.user.last_name
        ? `${item.user.first_name} ${item.user.last_name}`
        : item.user.first_name;
    }
    return "Someone";
  };

  const getUserInitials = () => {
    if (item.user?.first_name) {
      const firstInitial = item.user.first_name.charAt(0).toUpperCase();
      const lastInitial = item.user.last_name?.charAt(0).toUpperCase() || "";
      return firstInitial + lastInitial;
    }
    return "?";
  };

  return (
    <Card className="p-4">
      <div className="flex gap-4">
        {/* Avatar */}
        <Avatar>
          <AvatarImage src={item.user?.avatar_url || undefined} />
          <AvatarFallback>{getUserInitials()}</AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-sm flex-wrap">
            <span className="text-lg" role="img" aria-label={config.label}>
              {config.icon}
            </span>
            <span className="font-medium">{getUserDisplayName()}</span>
            <span className="text-muted-foreground">{config.verb}</span>
            {item.entity_title && (
              <span className="font-medium">{item.entity_title}</span>
            )}
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">
              {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
            </span>
          </div>

          {/* Additional metadata if present */}
          {item.metadata && Object.keys(item.metadata).length > 0 && (
            <div className="mt-2 text-sm text-muted-foreground">
              {renderMetadata(item.metadata, item.activity_type)}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function renderMetadata(metadata: Record<string, unknown>, activityType: string): React.ReactNode {
  // Handle specific activity types with custom metadata rendering
  if (activityType === "schedule_updated" && metadata.day_of_week !== undefined && metadata.meal_type) {
    const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const day = dayNames[metadata.day_of_week as number] || "Unknown";
    const meal = String(metadata.meal_type).charAt(0).toUpperCase() + String(metadata.meal_type).slice(1);
    return `${day} ${meal}`;
  }

  // Default: don't render metadata
  return null;
}

function ActivityItemSkeleton() {
  return (
    <Card className="p-4 animate-pulse">
      <div className="flex gap-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </div>
    </Card>
  );
}
