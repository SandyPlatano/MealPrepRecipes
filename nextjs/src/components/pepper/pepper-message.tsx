"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types/pepper";

interface PepperMessageProps {
  message: ChatMessage;
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
        {/* Message content */}
        <div className="text-sm whitespace-pre-wrap break-words">
          {message.content}
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
