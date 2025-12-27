"use client";

import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, History, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PepperMessage, PepperTyping } from "./pepper-message";
import { PepperInput } from "./pepper-input";
import type { ChatMessage, PepperQuickAction } from "@/types/pepper";

interface PepperPanelProps {
  isOpen: boolean;
  isMinimized: boolean;
  isLoading: boolean;
  messages: ChatMessage[];
  onClose: () => void;
  onMinimize: () => void;
  onSend: (message: string) => void;
  onQuickAction: (action: PepperQuickAction) => void;
  onViewHistory?: () => void;
  onNewChat?: () => void;
}

export function PepperPanel({
  isOpen,
  isMinimized,
  isLoading,
  messages,
  onClose,
  onMinimize,
  onSend,
  onQuickAction,
  onViewHistory,
  onNewChat,
}: PepperPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{
            y: 0,
            opacity: 1,
            height: isMinimized ? "auto" : undefined // Full height on mobile, auto on desktop when minimized
          }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{
            type: "spring",
            damping: 25,
            stiffness: 300
          }}
          className={cn(
            "fixed z-50",
            // Mobile: full screen
            "inset-0 sm:inset-auto",
            "sm:bottom-6 sm:right-6",
            "sm:w-[380px] sm:max-w-[calc(100vw-48px)]",
            "sm:rounded-xl rounded-none",
            "border-0 sm:border-2 border-black dark:border-white",
            "bg-background",
            "sm:shadow-retro",
            "flex flex-col",
            "overflow-hidden"
          )}
        >
          {/* Header */}
          <div
            className={cn(
              "flex items-center justify-between",
              "px-4 py-3",
              "border-b-2 border-black dark:border-white",
              "bg-primary text-primary-foreground"
            )}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">🌶️</span>
              <span className="font-bold">Pepper</span>
            </div>

            <div className="flex items-center gap-1">
              {onNewChat && messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onNewChat}
                  className="size-8 text-primary-foreground hover:bg-primary-foreground/20"
                  aria-label="Start new chat"
                >
                  <RotateCcw className="size-4" />
                </Button>
              )}
              {onViewHistory && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onViewHistory}
                  className="size-8 text-primary-foreground hover:bg-primary-foreground/20"
                  aria-label="View chat history"
                >
                  <History className="size-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={onMinimize}
                className="size-8 text-primary-foreground hover:bg-primary-foreground/20"
                aria-label={isMinimized ? "Expand" : "Minimize"}
              >
                <Minus className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="size-8 text-primary-foreground hover:bg-primary-foreground/20"
                aria-label="Close chat"
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>

          {/* Content - hidden when minimized */}
          {!isMinimized && (
            <>
              {/* Messages area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {/* Welcome message if no messages */}
                {messages.length === 0 && !isLoading && (
                  <div className="text-center py-8">
                    <span className="text-4xl mb-3 block">🌶️</span>
                    <h3 className="font-bold text-lg mb-1">Hey there!</h3>
                    <p className="text-sm text-muted-foreground">
                      I'm Pepper, your kitchen buddy! Ask me anything about
                      cooking, or use the quick actions below.
                    </p>
                  </div>
                )}

                {/* Message list */}
                {messages.map((message) => (
                  <PepperMessage key={message.id} message={message} />
                ))}

                {/* Typing indicator */}
                {isLoading && <PepperTyping />}

                {/* Scroll anchor */}
                <div ref={messagesEndRef} />
              </div>

              {/* Input area */}
              <div className="border-t-2 border-black dark:border-white p-3 bg-muted/30">
                <PepperInput
                  onSend={onSend}
                  onQuickAction={onQuickAction}
                  isLoading={isLoading}
                />
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
