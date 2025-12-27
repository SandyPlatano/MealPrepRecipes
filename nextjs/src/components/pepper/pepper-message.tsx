"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types/pepper";

interface PepperMessageProps {
  message: ChatMessage;
}

/**
 * Simple markdown parser for Pepper messages
 * Handles: **bold**, *italic*, and recipe IDs [ID:xxx]
 */
function renderMessageContent(content: string): React.ReactNode {
  // Split by markdown patterns
  const parts = content.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\[ID:[a-f0-9-]+\])/g);

  return parts.map((part, index) => {
    // Bold text: **text**
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    // Italic text: *text*
    if (part.startsWith("*") && part.endsWith("*") && !part.startsWith("**")) {
      return (
        <em key={index} className="italic">
          {part.slice(1, -1)}
        </em>
      );
    }
    // Recipe ID: [ID:xxx] - hide from display
    if (part.match(/^\[ID:[a-f0-9-]+\]$/)) {
      return null;
    }
    // Regular text
    return part;
  });
}

export function PepperMessage({ message }: PepperMessageProps) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-lg px-3 py-2",
          "border-2 border-black dark:border-white",
          isUser
            ? "bg-primary text-primary-foreground shadow-retro-sm"
            : "bg-card text-card-foreground shadow-retro-sm"
        )}
      >
        {/* Message content with basic markdown */}
        <div className="text-sm whitespace-pre-wrap break-words">
          {renderMessageContent(message.content)}
        </div>

        {/* Timestamp */}
        <div
          className={cn(
            "mt-1 text-xs opacity-60",
            isUser ? "text-right" : "text-left"
          )}
        >
          {formatTime(message.created_at)}
        </div>
      </div>
    </motion.div>
  );
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Typing indicator component
export function PepperTyping() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-start"
    >
      <div
        className={cn(
          "rounded-lg px-4 py-3",
          "border-2 border-black dark:border-white",
          "bg-card text-card-foreground shadow-retro-sm"
        )}
      >
        <div className="flex items-center gap-1">
          <span className="text-sm mr-2">🌶️</span>
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="size-2 rounded-full bg-muted-foreground"
              animate={{
                y: [0, -4, 0],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
