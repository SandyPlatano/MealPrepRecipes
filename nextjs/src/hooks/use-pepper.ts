"use client";

import { useState, useCallback } from "react";
import type {
  ChatMessage,
  PepperQuickAction,
  PepperUIState,
  PEPPER_QUICK_ACTIONS,
} from "@/types/pepper";

const QUICK_ACTION_PROMPTS: Record<PepperQuickAction, string> = {
  what_can_i_make: "What can I make with what's in my pantry?",
  plan_week: "Help me plan meals for this week",
  shopping_help: "What do I need to buy for this week's meals?",
  cooking_tips: "I have a cooking question",
};

interface UsePepperReturn extends PepperUIState {
  open: () => void;
  close: () => void;
  toggle: () => void;
  minimize: () => void;
  sendMessage: (message: string) => Promise<void>;
  handleQuickAction: (action: PepperQuickAction) => void;
  clearMessages: () => void;
}

export function usePepper(): UsePepperReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const open = useCallback(() => {
    setIsOpen(true);
    setIsMinimized(false);
    setUnreadCount(0);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setIsMinimized(false);
  }, []);

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  const minimize = useCallback(() => {
    setIsMinimized((prev) => !prev);
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    // Add user message immediately
    const userMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      session_id: currentSessionId || "",
      role: "user",
      content: content.trim(),
      metadata: {},
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/pepper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content.trim(),
          session_id: currentSessionId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from Pepper");
      }

      const data = await response.json();

      // Update session ID if new
      if (data.session_id && !currentSessionId) {
        setCurrentSessionId(data.session_id);
      }

      // Add assistant message
      const assistantMessage: ChatMessage = {
        id: data.message?.id || `resp-${Date.now()}`,
        session_id: data.session_id,
        role: "assistant",
        content: data.message?.content || "Sorry, I couldn't process that. Try again?",
        metadata: data.message?.metadata || {},
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Pepper error:", error);

      // Add error message
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        session_id: currentSessionId || "",
        role: "assistant",
        content: "Oops! Something went wrong. Let's try that again!",
        metadata: { error: String(error) },
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [currentSessionId, isLoading]);

  const handleQuickAction = useCallback((action: PepperQuickAction) => {
    const prompt = QUICK_ACTION_PROMPTS[action];
    if (prompt) {
      sendMessage(prompt);
    }
  }, [sendMessage]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setCurrentSessionId(null);
  }, []);

  return {
    // State
    isOpen,
    isMinimized,
    isLoading,
    currentSessionId,
    messages,
    unreadCount,

    // Actions
    open,
    close,
    toggle,
    minimize,
    sendMessage,
    handleQuickAction,
    clearMessages,
  };
}
