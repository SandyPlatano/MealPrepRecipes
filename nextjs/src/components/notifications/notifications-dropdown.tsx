"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { getNotifications, markAllAsRead } from "@/app/actions/notifications";
import { NotificationItem } from "./notification-item";
import type { SocialNotification } from "@/types/social";

interface NotificationsDropdownProps {
  onNotificationRead?: () => void;
}

export function NotificationsDropdown({ onNotificationRead }: NotificationsDropdownProps) {
  const [notifications, setNotifications] = useState<SocialNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setIsLoading(true);
    const { data, error } = await getNotifications(20);

    if (error) {
      toast.error("Failed to load notifications");
      setIsLoading(false);
      return;
    }

    setNotifications(data || []);
    setIsLoading(false);
  };

  const handleMarkAllAsRead = () => {
    startTransition(async () => {
      const { error } = await markAllAsRead();

      if (error) {
        toast.error("Failed to mark notifications as read");
        return;
      }

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      );
      onNotificationRead?.();
      toast.success("All notifications marked as read");
    });
  };

  const handleNotificationRead = () => {
    onNotificationRead?.();
  };

  if (isLoading) {
    return (
      <div className="w-[380px] max-w-[calc(100vw-2rem)]">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="w-[380px] max-w-[calc(100vw-2rem)]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-3">
        <h3 className="font-semibold">Notifications</h3>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={isPending}
            className="h-auto py-1 px-2 text-xs"
          >
            Mark all as read
          </Button>
        )}
      </div>

      <Separator />

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <p className="text-sm text-muted-foreground">No notifications yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            You'll see updates about your recipes and activity here
          </p>
        </div>
      ) : (
        <>
          <ScrollArea className="h-[400px]">
            <div className="divide-y">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={handleNotificationRead}
                />
              ))}
            </div>
          </ScrollArea>

          <Separator />

          {/* Footer */}
          <div className="p-3">
            <Button variant="ghost" size="sm" className="w-full" asChild>
              <Link href="/app/notifications">View all notifications</Link>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
