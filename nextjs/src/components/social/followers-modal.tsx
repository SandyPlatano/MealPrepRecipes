"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Users } from "lucide-react";
import { UserProfileCard } from "./user-profile-card";
import { getFollowers, getFollowing } from "@/app/actions/follows";
import type { UserProfile } from "@/types/social";

interface FollowersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  username: string;
  currentUserId?: string;
  initialTab?: "followers" | "following";
  followerCount: number;
  followingCount: number;
}

export function FollowersModal({
  open,
  onOpenChange,
  userId,
  username,
  currentUserId,
  initialTab = "followers",
  followerCount,
  followingCount,
}: FollowersModalProps) {
  const [activeTab, setActiveTab] = useState<"followers" | "following">(initialTab);
  const [followers, setFollowers] = useState<UserProfile[]>([]);
  const [following, setFollowing] = useState<UserProfile[]>([]);
  const [isLoadingFollowers, setIsLoadingFollowers] = useState(false);
  const [isLoadingFollowing, setIsLoadingFollowing] = useState(false);
  const [isLoadingMoreFollowers, setIsLoadingMoreFollowers] = useState(false);
  const [isLoadingMoreFollowing, setIsLoadingMoreFollowing] = useState(false);
  const [hasMoreFollowers, setHasMoreFollowers] = useState(true);
  const [hasMoreFollowing, setHasMoreFollowing] = useState(true);
  const [followersOffset, setFollowersOffset] = useState(0);
  const [followingOffset, setFollowingOffset] = useState(0);
  const [loadedFollowers, setLoadedFollowers] = useState(false);
  const [loadedFollowing, setLoadedFollowing] = useState(false);

  const LIMIT = 20;

  const loadFollowers = useCallback(async (reset = false) => {
    if (reset) {
      setIsLoadingFollowers(true);
    }

    const result = await getFollowers(userId, {
      limit: LIMIT,
      offset: reset ? 0 : followersOffset,
    });

    if (result.data) {
      if (reset) {
        setFollowers(result.data);
        setFollowersOffset(result.data.length);
      } else {
        setFollowers((prev) => [...prev, ...result.data!]);
        setFollowersOffset((prev) => prev + result.data!.length);
      }
      setHasMoreFollowers(result.data.length === LIMIT);
    }

    setIsLoadingFollowers(false);
    setIsLoadingMoreFollowers(false);
    setLoadedFollowers(true);
  }, [userId, followersOffset]);

  const loadFollowing = useCallback(async (reset = false) => {
    if (reset) {
      setIsLoadingFollowing(true);
    }

    const result = await getFollowing(userId, {
      limit: LIMIT,
      offset: reset ? 0 : followingOffset,
    });

    if (result.data) {
      if (reset) {
        setFollowing(result.data);
        setFollowingOffset(result.data.length);
      } else {
        setFollowing((prev) => [...prev, ...result.data!]);
        setFollowingOffset((prev) => prev + result.data!.length);
      }
      setHasMoreFollowing(result.data.length === LIMIT);
    }

    setIsLoadingFollowing(false);
    setIsLoadingMoreFollowing(false);
    setLoadedFollowing(true);
  }, [userId, followingOffset]);

  // Load data when modal opens or tab changes
  useEffect(() => {
    if (open) {
      if (activeTab === "followers" && !loadedFollowers) {
        loadFollowers(true);
      } else if (activeTab === "following" && !loadedFollowing) {
        loadFollowing(true);
      }
    }
  }, [open, activeTab, loadedFollowers, loadedFollowing, loadFollowers, loadFollowing]);

  // Reset when modal closes
  useEffect(() => {
    if (!open) {
      setFollowers([]);
      setFollowing([]);
      setLoadedFollowers(false);
      setLoadedFollowing(false);
      setFollowersOffset(0);
      setFollowingOffset(0);
      setHasMoreFollowers(true);
      setHasMoreFollowing(true);
    }
  }, [open]);

  const handleFollowChange = (profileId: string, isFollowing: boolean) => {
    // Update the followers list
    setFollowers((prev) =>
      prev.map((p) =>
        p.id === profileId ? { ...p, is_following: isFollowing } : p
      )
    );
    // Update the following list
    setFollowing((prev) =>
      prev.map((p) =>
        p.id === profileId ? { ...p, is_following: isFollowing } : p
      )
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>@{username}</DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "followers" | "following")}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="followers">
              Followers ({followerCount})
            </TabsTrigger>
            <TabsTrigger value="following">
              Following ({followingCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="followers" className="mt-4">
            {isLoadingFollowers ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <UserCardSkeleton key={i} />
                ))}
              </div>
            ) : followers.length === 0 ? (
              <EmptyState text="No followers yet" />
            ) : (
              <div className="space-y-1 max-h-[400px] overflow-y-auto">
                {followers.map((profile) => (
                  <UserProfileCard
                    key={profile.id}
                    profile={profile}
                    currentUserId={currentUserId}
                    variant="compact"
                    onFollowChange={(isFollowing) =>
                      handleFollowChange(profile.id, isFollowing)
                    }
                  />
                ))}

                {hasMoreFollowers && (
                  <div className="pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setIsLoadingMoreFollowers(true);
                        loadFollowers(false);
                      }}
                      disabled={isLoadingMoreFollowers}
                    >
                      {isLoadingMoreFollowers ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Load more"
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="following" className="mt-4">
            {isLoadingFollowing ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <UserCardSkeleton key={i} />
                ))}
              </div>
            ) : following.length === 0 ? (
              <EmptyState text="Not following anyone" />
            ) : (
              <div className="space-y-1 max-h-[400px] overflow-y-auto">
                {following.map((profile) => (
                  <UserProfileCard
                    key={profile.id}
                    profile={profile}
                    currentUserId={currentUserId}
                    variant="compact"
                    onFollowChange={(isFollowing) =>
                      handleFollowChange(profile.id, isFollowing)
                    }
                  />
                ))}

                {hasMoreFollowing && (
                  <div className="pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setIsLoadingMoreFollowing(true);
                        loadFollowing(false);
                      }}
                      disabled={isLoadingMoreFollowing}
                    >
                      {isLoadingMoreFollowing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Load more"
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function UserCardSkeleton() {
  return (
    <div className="flex items-center gap-3 p-2">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-1">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="h-8 w-20" />
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="py-8 text-center">
      <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
      <p className="text-muted-foreground">{text}</p>
    </div>
  );
}
