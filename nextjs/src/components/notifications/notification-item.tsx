"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  Heart,
  Bookmark,
  Star,
  ThumbsUp,
  MessageCircle,
  ChefHat,
  AtSign,
  Info,
  UserPlus,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { markAsRead } from "@/app/actions/notifications";
import type { SocialNotification, NotificationType } from "@/types/social";

interface NotificationItemProps {
  notification: SocialNotification;
  onRead?: () => void;
}

const iconMap: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
  new_follower: UserPlus,
  recipe_liked: Heart,
  recipe_saved: Bookmark,
  review_received: Star,
  review_helpful: ThumbsUp,
  review_response: MessageCircle,
  recipe_cooked: ChefHat,
  mention: AtSign,
  system: Info,
};

const colorMap: Record<NotificationType, string> = {
  new_follower: "text-blue-600",
  recipe_liked: "text-red-600",
  recipe_saved: "text-yellow-600",
  review_received: "text-purple-600",
  review_helpful: "text-green-600",
  review_response: "text-indigo-600",
  recipe_cooked: "text-orange-600",
  mention: "text-pink-600",
  system: "text-gray-600",
};

export function NotificationItem({ notification, onRead }: NotificationItemProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const Icon = iconMap[notification.notification_type] || Bell;
  const iconColor = colorMap[notification.notification_type] || "text-gray-600";

  const handleClick = () => {
    if (!notification.is_read) {
      startTransition(async () => {
        await markAsRead([notification.id]);
        onRead?.();
      });
    }

    if (notification.action_url) {
      router.push(notification.action_url);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        "w-full flex items-start gap-3 p-3 text-left transition-colors hover:bg-accent/50",
        !notification.is_read && "bg-accent/30"
      )}
    >
      {/* Actor Avatar or Icon */}
      {notification.actor ? (
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarImage src={notification.actor.avatar_url || undefined} />
          <AvatarFallback>
            {notification.actor.username?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ) : (
        <div className={cn("h-10 w-10 shrink-0 rounded-full bg-muted flex items-center justify-center", iconColor)}>
          <Icon className="h-5 w-5" />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <p className="text-sm font-medium leading-tight">{notification.title}</p>
        {notification.body && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {notification.body}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(notification.created_at), {
            addSuffix: true,
          })}
        </p>
      </div>

      {/* Unread indicator */}
      {!notification.is_read && (
        <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />
      )}
    </button>
  );
}
