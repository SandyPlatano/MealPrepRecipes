"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export function SettingsButton() {
  const pathname = usePathname();
  const isActive = pathname === "/app/settings" || pathname.startsWith("/app/settings/");

  return (
    <Link href="/app/settings">
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-9 w-9 transition-all",
          isActive
            ? "text-primary bg-primary/10 border border-primary/50"
            : "text-muted-foreground hover:text-foreground hover:bg-accent"
        )}
      >
        <Settings
          className={cn(
            "h-4 w-4",
            isActive && "drop-shadow-[0_6px_24px_rgba(99,102,241,0.45)]"
          )}
        />
      </Button>
    </Link>
  );
}

