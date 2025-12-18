"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  updateKeyboardShortcuts,
  toggleKeyboardShortcuts,
} from "@/app/actions/user-preferences";
import type { KeyboardPreferences } from "@/types/user-preferences-v2";
import { DEFAULT_KEYBOARD_SHORTCUTS } from "@/types/user-preferences-v2";
import { Keyboard, RotateCcw, AlertTriangle } from "lucide-react";

interface KeyboardShortcutsSectionProps {
  userId: string;
  initialPreferences: KeyboardPreferences;
}

interface ShortcutAction {
  key: string;
  label: string;
  description: string;
}

const SHORTCUT_ACTIONS: ShortcutAction[] = [
  { key: "newRecipe", label: "New Recipe", description: "Create a new recipe" },
  { key: "search", label: "Search", description: "Focus search bar" },
  { key: "nextWeek", label: "Next Week", description: "Navigate to next week in planner" },
  { key: "prevWeek", label: "Previous Week", description: "Navigate to previous week" },
  { key: "toggleDarkMode", label: "Toggle Dark Mode", description: "Switch between light/dark theme" },
  { key: "openSettings", label: "Open Settings", description: "Open settings page" },
  { key: "goToPlanner", label: "Go to Planner", description: "Navigate to meal planner" },
  { key: "goToRecipes", label: "Go to Recipes", description: "Navigate to recipes page" },
  { key: "goToShopping", label: "Go to Shopping", description: "Navigate to shopping list" },
];

export function KeyboardShortcutsSection({
  userId,
  initialPreferences,
}: KeyboardShortcutsSectionProps) {
  const [preferences, setPreferences] = useState<KeyboardPreferences>(initialPreferences);
  const [editingAction, setEditingAction] = useState<string | null>(null);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);

  const handleToggle = async (enabled: boolean) => {
    const updatedPrefs = { ...preferences, enabled };
    setPreferences(updatedPrefs);

    setIsSaving(true);
    const result = await toggleKeyboardShortcuts(userId, enabled);
    setIsSaving(false);

    if (result.error) {
      toast.error("Failed to update keyboard shortcuts");
      setPreferences(preferences);
    } else {
      toast.success(enabled ? "Keyboard shortcuts enabled" : "Keyboard shortcuts disabled");
    }
  };

  const handleStartEditing = (actionKey: string) => {
    setEditingAction(actionKey);
    setPendingKey(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, actionKey: string) => {
    e.preventDefault();

    let key = e.key;

    // Convert special keys to readable format
    if (key === " ") key = "Space";
    if (key.startsWith("Arrow")) key = key; // Keep ArrowLeft, ArrowRight, etc.

    // Check for conflicts
    const conflicts = Object.entries(preferences.shortcuts).filter(
      ([k, v]) => v === key && k !== actionKey
    );

    if (conflicts.length > 0) {
      const conflictingAction = SHORTCUT_ACTIONS.find((a) => a.key === conflicts[0][0]);
      toast.error(
        `Key "${key}" is already assigned to ${conflictingAction?.label || conflicts[0][0]}`
      );
      return;
    }

    setPendingKey(key);
  };

  const handleSaveShortcut = async (actionKey: string) => {
    if (!pendingKey) {
      setEditingAction(null);
      return;
    }

    const updatedShortcuts = {
      ...preferences.shortcuts,
      [actionKey]: pendingKey,
    };

    setPreferences({ ...preferences, shortcuts: updatedShortcuts });

    setIsSaving(true);
    const result = await updateKeyboardShortcuts(userId, updatedShortcuts);
    setIsSaving(false);

    if (result.error) {
      toast.error("Failed to update shortcut");
      setPreferences(preferences);
    } else {
      toast.success("Shortcut updated");
    }

    setEditingAction(null);
    setPendingKey(null);
  };

  const handleCancelEditing = () => {
    setEditingAction(null);
    setPendingKey(null);
  };

  const handleResetToDefaults = async () => {
    setPreferences({ ...preferences, shortcuts: DEFAULT_KEYBOARD_SHORTCUTS });

    setIsSaving(true);
    const result = await updateKeyboardShortcuts(userId, DEFAULT_KEYBOARD_SHORTCUTS);
    setIsSaving(false);

    if (result.error) {
      toast.error("Failed to reset shortcuts");
      setPreferences(preferences);
    } else {
      toast.success("Shortcuts reset to defaults");
    }

    setShowResetDialog(false);
  };

  const formatKey = (key: string) => {
    // Format key for display
    if (key === "Space") return "␣";
    if (key.startsWith("Arrow")) return key.replace("Arrow", "→ ");
    if (key === ",") return "Comma";
    if (key === "/") return "Slash";
    return key.toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Master Toggle */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Keyboard className="h-4 w-4 text-muted-foreground" />
            <Label>Enable Keyboard Shortcuts</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Use keyboard shortcuts to navigate faster
          </p>
        </div>
        <Switch
          checked={preferences.enabled}
          onCheckedChange={handleToggle}
        />
      </div>

      {preferences.enabled && (
        <>
          {/* Shortcuts List */}
          <div className="space-y-2">
            {SHORTCUT_ACTIONS.map((action) => {
              const currentKey = preferences.shortcuts[action.key] || "—";
              const isEditing = editingAction === action.key;

              return (
                <Card
                  key={action.key}
                  className={cn(
                    "p-4 transition-colors",
                    isEditing && "ring-2 ring-primary"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{action.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {action.description}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <>
                          <input
                            type="text"
                            className="px-3 py-1.5 bg-primary/10 border-2 border-primary rounded-md min-w-[60px] text-center text-sm font-mono focus:outline-none"
                            onKeyDown={(e) => handleKeyDown(e, action.key)}
                            value={pendingKey ? formatKey(pendingKey) : ""}
                            placeholder="Press key..."
                            readOnly
                            autoFocus
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleCancelEditing}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleSaveShortcut(action.key)}
                            disabled={!pendingKey}
                          >
                            Save
                          </Button>
                        </>
                      ) : (
                        <>
                          <Badge
                            variant="secondary"
                            className="font-mono text-sm cursor-pointer hover:bg-secondary/80"
                            onClick={() => handleStartEditing(action.key)}
                          >
                            {formatKey(currentKey)}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleStartEditing(action.key)}
                          >
                            Change
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Reset Button */}
          <div className="flex items-center justify-between pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              Click a shortcut to rebind it
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowResetDialog(true)}
              disabled={isSaving}
            >
              <RotateCcw className="h-3 w-3 mr-1.5" />
              Reset to Defaults
            </Button>
          </div>
        </>
      )}

      {isSaving && (
        <p className="text-xs text-muted-foreground text-center">Saving...</p>
      )}

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Reset Keyboard Shortcuts?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will restore all keyboard shortcuts to their default values. Your custom shortcuts will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetToDefaults}>
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
