"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, UserCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { followUser, unfollowUser } from "@/app/actions/follows";
import { cn } from "@/lib/utils";

interface FollowButtonProps {
  userId: string;
  initialIsFollowing?: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
  size?: "sm" | "default";
  variant?: "default" | "outline" | "ghost";
  className?: string;
}

export function FollowButton({
  userId,
  initialIsFollowing = false,
  onFollowChange,
  size = "default",
  variant = "default",
  className,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    const newIsFollowing = !isFollowing;
    setIsFollowing(newIsFollowing);

    startTransition(async () => {
      const result = newIsFollowing
        ? await followUser(userId)
        : await unfollowUser(userId);

      if (result.error) {
        setIsFollowing(!newIsFollowing);
        toast.error(result.error);
      } else {
        toast.success(newIsFollowing ? "Now following!" : "Unfollowed");
        onFollowChange?.(newIsFollowing);
      }
    });
  };

  return (
    <Button
      variant={isFollowing ? "outline" : variant}
      size={size}
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        isFollowing && "hover:border-destructive hover:text-destructive",
        className
      )}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isFollowing ? (
        <>
          <UserCheck className="h-4 w-4 mr-2" />
          Following
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4 mr-2" />
          Follow
        </>
      )}
    </Button>
  );
}
