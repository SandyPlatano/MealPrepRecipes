"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getCookInitials, getCookColor } from "@/types/household-cooks";

interface CookAvatarProps {
  name: string;
  avatarUrl?: string | null;
  color?: string | null;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  xs: "size-5 text-[9px]",
  sm: "size-6 text-[10px]",
  md: "size-8 text-xs",
  lg: "size-10 text-sm",
} as const;

export function CookAvatar({
  name,
  avatarUrl,
  color,
  size = "sm",
  className,
}: CookAvatarProps) {
  const initials = getCookInitials(name);
  const fallbackColor = color || getCookColor(name);

  // Calculate text color based on background luminance
  const getContrastColor = (hexColor: string): string => {
    const hex = hexColor.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? "#1A1A1A" : "#FFFFFF";
  };

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {avatarUrl && (
        <AvatarImage src={avatarUrl} alt={name} />
      )}
      <AvatarFallback
        style={{
          backgroundColor: fallbackColor,
          color: getContrastColor(fallbackColor),
        }}
        className="font-semibold"
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
