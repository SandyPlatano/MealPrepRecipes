import { useEffect, useCallback, useRef } from "react";

/**
 * Keyboard shortcuts hook for context menu actions
 *
 * Supports:
 * - ⌘E / Ctrl+E: Edit
 * - ⌘D / Ctrl+D: Duplicate
 * - ⌘N / Ctrl+N: New/Add
 * - ⌘P / Ctrl+P: Pin
 * - ⌘⇧P / Ctrl+Shift+P: Unpin
 * - ⌘⌫ / Ctrl+Backspace: Delete
 * - ⌘↑ / Ctrl+ArrowUp: Move Up
 * - ⌘↓ / Ctrl+ArrowDown: Move Down
 * - ⌘R / Ctrl+R: Rename
 * - ⌘I / Ctrl+I: Info/View
 */

export type ShortcutKey =
  | "edit"
  | "duplicate"
  | "new"
  | "pin"
  | "unpin"
  | "delete"
  | "moveUp"
  | "moveDown"
  | "rename"
  | "info";

export interface KeyboardShortcutHandlers {
  onEdit?: () => void;
  onDuplicate?: () => void;
  onNew?: () => void;
  onPin?: () => void;
  onUnpin?: () => void;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onRename?: () => void;
  onInfo?: () => void;
}

interface ShortcutConfig {
  key: string;
  meta?: boolean; // ⌘ on Mac, Ctrl on Windows/Linux
  shift?: boolean;
  alt?: boolean;
}

const SHORTCUTS: Record<ShortcutKey, ShortcutConfig> = {
  edit: { key: "e", meta: true },
  duplicate: { key: "d", meta: true },
  new: { key: "n", meta: true },
  pin: { key: "p", meta: true },
  unpin: { key: "p", meta: true, shift: true },
  delete: { key: "Backspace", meta: true },
  moveUp: { key: "ArrowUp", meta: true },
  moveDown: { key: "ArrowDown", meta: true },
  rename: { key: "r", meta: true },
  info: { key: "i", meta: true },
};

/**
 * Hook to register keyboard shortcuts for context menu actions
 * Only active when the element is focused or context menu is open
 */
export function useContextMenuShortcuts(
  handlers: KeyboardShortcutHandlers,
  options: {
    enabled?: boolean;
    preventDefault?: boolean;
  } = {}
) {
  const { enabled = true, preventDefault = true } = options;
  const handlersRef = useRef(handlers);

  // Update handlers ref when they change
  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      const isMac = typeof window !== "undefined" && /Mac|iPhone|iPad|iPod/.test(navigator.platform);
      const metaKey = isMac ? event.metaKey : event.ctrlKey;

      // Check each shortcut
      for (const [action, config] of Object.entries(SHORTCUTS) as [ShortcutKey, ShortcutConfig][]) {
        const keyMatches = event.key === config.key;
        const metaMatches = config.meta ? metaKey : !metaKey;
        const shiftMatches = config.shift ? event.shiftKey : !event.shiftKey;
        const altMatches = config.alt ? event.altKey : !event.altKey;

        if (keyMatches && metaMatches && shiftMatches && altMatches) {
          const handler = handlersRef.current[`on${action.charAt(0).toUpperCase() + action.slice(1)}` as keyof KeyboardShortcutHandlers];

          if (handler) {
            if (preventDefault) {
              event.preventDefault();
              event.stopPropagation();
            }
            handler();
            return;
          }
        }
      }
    },
    [enabled, preventDefault]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled, handleKeyDown]);
}

/**
 * Get the display string for a keyboard shortcut
 * Returns platform-specific format (⌘E on Mac, Ctrl+E on Windows/Linux)
 */
export function getShortcutDisplay(shortcut: ShortcutKey): string {
  const isMac = typeof window !== "undefined" && /Mac|iPhone|iPad|iPod/.test(navigator.platform);
  const config = SHORTCUTS[shortcut];

  if (!config) return "";

  let display = "";

  if (config.meta) {
    display += isMac ? "⌘" : "Ctrl+";
  }

  if (config.shift) {
    display += isMac ? "⇧" : "Shift+";
  }

  if (config.alt) {
    display += isMac ? "⌥" : "Alt+";
  }

  // Format the key
  let key = config.key;
  if (key === "Backspace") {
    key = isMac ? "⌫" : "⌫";
  } else if (key === "ArrowUp") {
    key = "↑";
  } else if (key === "ArrowDown") {
    key = "↓";
  } else {
    key = key.toUpperCase();
  }

  display += key;

  return display;
}

/**
 * Component to display a keyboard shortcut hint in context menu
 */
export function ContextMenuShortcut({ shortcut }: { shortcut: ShortcutKey }) {
  return (
    <span className="ml-auto text-xs text-muted-foreground pl-4">
      {getShortcutDisplay(shortcut)}
    </span>
  );
}
