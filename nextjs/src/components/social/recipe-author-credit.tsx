"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sparkles, User } from "lucide-react";
import type { OriginalAuthor } from "@/types/social";

interface RecipeAuthorCreditProps {
  originalAuthor?: OriginalAuthor | null;
  originalRecipeId?: string | null;
  variant?: "inline" | "badge";
}

export function RecipeAuthorCredit({
  originalAuthor,
  originalRecipeId,
  variant = "badge",
}: RecipeAuthorCreditProps) {
  // No original author - not a copied recipe
  if (!originalRecipeId) return null;

  // Original author exists
  if (originalAuthor?.username) {
    if (variant === "inline") {
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          <span>Originally shared by</span>
          <Link
            href={`/u/${originalAuthor.username}`}
            className="font-medium text-primary hover:underline"
          >
            @{originalAuthor.username}
          </Link>
        </div>
      );
    }

    return (
      <Link href={`/u/${originalAuthor.username}`}>
        <Badge
          variant="outline"
          className="gap-1.5 hover:bg-primary/10 transition-colors cursor-pointer"
        >
          <Sparkles className="h-3 w-3 text-primary" />
          Originally by @{originalAuthor.username}
        </Badge>
      </Link>
    );
  }

  // Original author was deleted or unknown
  if (variant === "inline") {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <User className="h-4 w-4" />
        <span>Based on a community recipe</span>
      </div>
    );
  }

  return (
    <Badge variant="outline" className="gap-1.5">
      <User className="h-3 w-3" />
      Community Recipe
    </Badge>
  );
}

interface RecipeAuthorInfoProps {
  author: {
    id: string;
    username: string;
    avatar_url?: string | null;
    first_name?: string | null;
    last_name?: string | null;
  };
  showAvatar?: boolean;
  linkToProfile?: boolean;
}

export function RecipeAuthorInfo({
  author,
  showAvatar = true,
  linkToProfile = true,
}: RecipeAuthorInfoProps) {
  const content = (
    <div className="flex items-center gap-2">
      {showAvatar && (
        <Avatar className="h-6 w-6">
          <AvatarImage src={author.avatar_url || undefined} />
          <AvatarFallback className="text-xs">
            {author.username?.charAt(0).toUpperCase() || "?"}
          </AvatarFallback>
        </Avatar>
      )}
      <span className="text-sm">
        {[author.first_name, author.last_name].filter(Boolean).join(" ") || `@${author.username}`}
      </span>
    </div>
  );

  if (linkToProfile) {
    return (
      <Link
        href={`/u/${author.username}`}
        className="hover:text-primary transition-colors"
      >
        {content}
      </Link>
    );
  }

  return content;
}
