"use client";

import { createContext, useContext, type ReactNode } from "react";
import { usePepper } from "@/hooks/use-pepper";
import { PepperBubble } from "./pepper-bubble";
import { PepperPanel } from "./pepper-panel";

type PepperContextValue = ReturnType<typeof usePepper>;

const PepperContext = createContext<PepperContextValue | null>(null);

export function usePepperContext() {
  const context = useContext(PepperContext);
  if (!context) {
    throw new Error("usePepperContext must be used within a PepperProvider");
  }
  return context;
}

interface PepperProviderProps {
  children: ReactNode;
}

export function PepperProvider({ children }: PepperProviderProps) {
  const pepper = usePepper();

  return (
    <PepperContext.Provider value={pepper}>
      {children}

      {/* Floating chat bubble */}
      <PepperBubble
        isOpen={pepper.isOpen}
        onClick={pepper.toggle}
        unreadCount={pepper.unreadCount}
      />

      {/* Slide-out panel */}
      <PepperPanel
        isOpen={pepper.isOpen}
        isMinimized={pepper.isMinimized}
        isLoading={pepper.isLoading}
        messages={pepper.messages}
        onClose={pepper.close}
        onMinimize={pepper.minimize}
        onSend={pepper.sendMessage}
        onQuickAction={pepper.handleQuickAction}
        onNewChat={pepper.clearMessages}
      />
    </PepperContext.Provider>
  );
}
