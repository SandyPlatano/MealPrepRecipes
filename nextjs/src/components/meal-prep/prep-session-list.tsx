"use client";

import { useRouter } from "next/navigation";
import { PrepSessionCard } from "./prep-session-card";
import type { PrepSession } from "@/types/meal-prep";

export interface PrepSessionListProps {
  sessions: PrepSession[];
  title?: string;
  showActions?: boolean;
}

export function PrepSessionList({
  sessions,
  title,
  showActions = true,
}: PrepSessionListProps) {
  const router = useRouter();

  const handleView = (sessionId: string) => {
    router.push(`/app/prep/${sessionId}`);
  };

  const handleStart = (sessionId: string) => {
    router.push(`/app/prep/${sessionId}/start`);
  };

  const handleDelete = async (sessionId: string) => {
    if (!confirm("Are you sure you want to delete this prep session?")) {
      return;
    }
    // TODO: Implement delete functionality
    router.refresh();
  };

  return (
    <div className="space-y-4">
      {title && <h2 className="text-xl font-semibold">{title}</h2>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sessions.map((session) => (
          <PrepSessionCard
            key={session.id}
            session={session}
            recipeCount={0}
            completedRecipeCount={0}
            onView={handleView}
            onStart={showActions ? handleStart : undefined}
            onDelete={showActions ? handleDelete : undefined}
          />
        ))}
      </div>
    </div>
  );
}
