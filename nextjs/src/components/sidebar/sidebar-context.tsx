"use client";

import * as React from "react";
import {
  getSidebarState,
  setSidebarWidth as setStorageWidth,
  setSidebarCollapsed as setStorageCollapsed,
  SIDEBAR_DIMENSIONS,
} from "@/lib/sidebar/sidebar-storage";
import type { PinnedItem, SidebarMode, SidebarPreferences } from "@/types/user-preferences-v2";
import { DEFAULT_SIDEBAR_PREFERENCES } from "@/types/user-preferences-v2";
import type {
  SectionConfig,
  SidebarPreferencesV2,
  BuiltInSectionId,
  CustomSectionConfig,
  CustomSectionItem,
} from "@/types/sidebar-customization";
import {
  DEFAULT_SECTION_ORDER,
  DEFAULT_BUILTIN_SECTIONS,
  isBuiltInSectionId,
} from "@/types/sidebar-customization";
import {
  normalizeSidebarPreferences,
  getVisibleSections,
  createCustomSection,
} from "@/lib/sidebar/sidebar-migration";
import {
  getSidebarPreferencesAuto,
  updateSidebarPreferencesAuto,
  pinSidebarItemAuto,
  unpinSidebarItemAuto,
  reorderPinnedItemsAuto,
} from "@/app/actions/sidebar-preferences";
import {
  createCustomSectionAuto,
  updateCustomSectionAuto,
  deleteCustomSectionAuto,
  addCustomSectionItemAuto,
  removeCustomSectionItemAuto,
  reorderSectionsAuto,
  updateBuiltInSectionAuto,
  updateBuiltInItemAuto,
  reorderBuiltInItemsAuto,
  addCustomItemToBuiltInSectionAuto,
  removeCustomItemFromBuiltInSectionAuto,
  resetBuiltInItemAuto,
} from "@/app/actions/sidebar-section-actions";
import type { SectionItemConfig, BuiltInSectionConfig } from "@/types/sidebar-customization";
import { DEFAULT_MEAL_PLANNING_ITEMS } from "@/types/sidebar-customization";

// Media query breakpoints
const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;

interface SidebarContextValue {
  // Core state
  width: number;
  isCollapsed: boolean;
  isMobileOpen: boolean;
  isMobile: boolean;
  isTablet: boolean;

  // Mode (synced)
  mode: SidebarMode;
  pinnedItems: PinnedItem[];

  // Section customization state
  sections: Record<string, SectionConfig>;
  sectionOrder: string[];
  reducedMotion: boolean;

  // Derived
  isIconOnly: boolean;
  isExpanded: boolean; // True when sidebar is in expanded mode

  // Core actions
  setWidth: (width: number) => void;
  toggleCollapse: () => void;
  collapse: () => void;
  expand: () => void;
  openMobile: () => void;
  closeMobile: () => void;
  toggleMobile: () => void;

  // Synced actions
  setMode: (mode: SidebarMode) => Promise<void>;
  pinItem: (item: Omit<PinnedItem, "addedAt">) => Promise<void>;
  unpinItem: (itemId: string) => Promise<void>;
  reorderPinned: (itemIds: string[]) => Promise<void>;
  isPinned: (itemId: string) => boolean;

  // Section customization actions
  reorderSections: (sectionIds: string[]) => Promise<void>;
  toggleSectionVisibility: (sectionId: string) => Promise<void>;
  updateSectionLabel: (sectionId: string, label: string) => Promise<void>;
  updateSectionEmoji: (sectionId: string, emoji: string | null) => Promise<void>;
  resetSection: (sectionId: BuiltInSectionId) => Promise<void>;

  // Custom section actions
  addCustomSection: (title: string) => Promise<string | null>;
  updateCustomSection: (sectionId: string, updates: Partial<CustomSectionConfig>) => Promise<void>;
  removeCustomSection: (sectionId: string) => Promise<void>;
  addCustomSectionItem: (sectionId: string, item: Omit<CustomSectionItem, "id" | "sortOrder">) => Promise<void>;
  removeCustomSectionItem: (sectionId: string, itemId: string) => Promise<void>;

  // Built-in section item actions (for meal planning items)
  updateBuiltInItem: (
    sectionId: BuiltInSectionId,
    itemId: string,
    updates: Partial<Pick<SectionItemConfig, "customName" | "customIcon" | "customEmoji" | "hidden">>
  ) => Promise<void>;
  reorderBuiltInItems: (sectionId: BuiltInSectionId, itemOrder: string[]) => Promise<void>;
  addCustomItemToBuiltInSection: (
    sectionId: BuiltInSectionId,
    item: Omit<CustomSectionItem, "id" | "sortOrder">
  ) => Promise<void>;
  removeCustomItemFromBuiltInSection: (sectionId: BuiltInSectionId, itemId: string) => Promise<void>;
  resetBuiltInItem: (sectionId: BuiltInSectionId, itemId: string) => Promise<void>;

  // Helper
  getVisibleSections: () => SectionConfig[];

  // Loading state
  isLoading: boolean;
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

interface SidebarProviderProps {
  children: React.ReactNode;
  defaultWidth?: number;
  defaultCollapsed?: boolean;
  initialPreferences?: SidebarPreferences;
}

export function SidebarProvider({
  children,
  defaultWidth = SIDEBAR_DIMENSIONS.DEFAULT_WIDTH,
  defaultCollapsed = false,
  initialPreferences,
}: SidebarProviderProps) {
  // Core state (localStorage-based for responsiveness)
  const [width, setWidthState] = React.useState(defaultWidth);
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const [isTablet, setIsTablet] = React.useState(false);
  const [isInitialized, setIsInitialized] = React.useState(false);

  // Synced preferences state
  const [mode, setModeState] = React.useState<SidebarMode>(
    initialPreferences?.mode || DEFAULT_SIDEBAR_PREFERENCES.mode
  );
  const [pinnedItems, setPinnedItems] = React.useState<PinnedItem[]>(
    initialPreferences?.pinnedItems || DEFAULT_SIDEBAR_PREFERENCES.pinnedItems
  );

  // Section customization state
  const [sections, setSections] = React.useState<Record<string, SectionConfig>>(
    () => structuredClone(DEFAULT_BUILTIN_SECTIONS)
  );
  const [sectionOrder, setSectionOrder] = React.useState<string[]>(
    () => [...DEFAULT_SECTION_ORDER]
  );
  const [reducedMotion, setReducedMotion] = React.useState(false);

  // Loading state
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoading, _setIsLoading] = React.useState(false);

  // Track explicit user interaction to prevent auto-collapse from overriding
  const userExplicitlyExpandedRef = React.useRef(false);

  // Initialize from localStorage on mount
  React.useEffect(() => {
    const stored = getSidebarState();
    setWidthState(stored.width);
    setIsCollapsed(stored.isCollapsed);
    setIsInitialized(true);
  }, []);

  // Fetch synced preferences on mount (if not provided initially)
  React.useEffect(() => {
    if (!initialPreferences) {
      getSidebarPreferencesAuto().then(({ data }) => {
        // Normalize preferences to ensure valid state
        const normalized = normalizeSidebarPreferences(data as Partial<SidebarPreferencesV2>);

        setModeState(normalized.mode);
        setPinnedItems(normalized.pinnedItems);
        setSections(normalized.sections);
        setSectionOrder(normalized.sectionOrder);
        setReducedMotion(normalized.reducedMotion);

        if (normalized.width) {
          setWidthState(normalized.width);
        }
      });
    }
  }, [initialPreferences]);

  // Media query listeners
  React.useEffect(() => {
    const checkBreakpoints = () => {
      const windowWidth = window.innerWidth;
      setIsMobile(windowWidth < MOBILE_BREAKPOINT);
      setIsTablet(windowWidth >= MOBILE_BREAKPOINT && windowWidth < TABLET_BREAKPOINT);
    };

    // Check immediately
    checkBreakpoints();

    // Listen for resize
    window.addEventListener("resize", checkBreakpoints);
    return () => window.removeEventListener("resize", checkBreakpoints);
  }, []);

  // Auto-collapse on tablet if not explicitly expanded
  React.useEffect(() => {
    // Skip if user explicitly expanded the sidebar
    if (userExplicitlyExpandedRef.current) {
      return;
    }

    if (isTablet && !isCollapsed && isInitialized) {
      // Only auto-collapse if user hasn't explicitly set state
      const stored = getSidebarState();
      if (!stored.isCollapsed && stored.width === SIDEBAR_DIMENSIONS.DEFAULT_WIDTH) {
        setIsCollapsed(true);
        setStorageCollapsed(true);
      }
    }
  }, [isTablet, isCollapsed, isInitialized]);

  // Close mobile sidebar on resize to desktop
  React.useEffect(() => {
    if (!isMobile && isMobileOpen) {
      setIsMobileOpen(false);
    }
  }, [isMobile, isMobileOpen]);

  // Keyboard shortcut: Cmd/Ctrl + \ to toggle sidebar
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "\\") {
        event.preventDefault();
        if (isMobile) {
          setIsMobileOpen((prev) => !prev);
        } else {
          setIsCollapsed((prev) => {
            const newValue = !prev;
            // Track explicit user interaction
            userExplicitlyExpandedRef.current = !newValue;
            setStorageCollapsed(newValue);
            return newValue;
          });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobile]);

  // Core actions
  const setWidth = React.useCallback((newWidth: number) => {
    const clampedWidth = Math.max(
      SIDEBAR_DIMENSIONS.MIN_WIDTH,
      Math.min(SIDEBAR_DIMENSIONS.MAX_WIDTH, newWidth)
    );
    setWidthState(clampedWidth);
    setStorageWidth(clampedWidth);

    if (clampedWidth <= SIDEBAR_DIMENSIONS.COLLAPSE_THRESHOLD) {
      setIsCollapsed(true);
      setStorageCollapsed(true);
    } else if (clampedWidth > SIDEBAR_DIMENSIONS.COLLAPSE_THRESHOLD && isCollapsed) {
      setIsCollapsed(false);
      setStorageCollapsed(false);
    }
  }, [isCollapsed]);

  const toggleCollapse = React.useCallback(() => {
    setIsCollapsed((prev) => {
      const newValue = !prev;
      // Track explicit user interaction
      userExplicitlyExpandedRef.current = !newValue;
      setStorageCollapsed(newValue);
      return newValue;
    });
  }, []);

  const collapse = React.useCallback(() => {
    userExplicitlyExpandedRef.current = false;
    setIsCollapsed(true);
    setStorageCollapsed(true);
  }, []);

  const expand = React.useCallback(() => {
    userExplicitlyExpandedRef.current = true;
    setIsCollapsed(false);
    setStorageCollapsed(false);
  }, []);

  const openMobile = React.useCallback(() => setIsMobileOpen(true), []);
  const closeMobile = React.useCallback(() => setIsMobileOpen(false), []);
  const toggleMobile = React.useCallback(() => setIsMobileOpen((prev) => !prev), []);

  // Synced actions
  const setMode = React.useCallback(async (newMode: SidebarMode) => {
    setModeState(newMode);
    // Also sync collapsed state with mode
    const shouldCollapse = newMode === "collapsed";
    setIsCollapsed(shouldCollapse);
    setStorageCollapsed(shouldCollapse);
    await updateSidebarPreferencesAuto({ mode: newMode });
  }, []);

  const pinItem = React.useCallback(async (item: Omit<PinnedItem, "addedAt">) => {
    // Optimistic update
    const newItem: PinnedItem = {
      ...item,
      addedAt: new Date().toISOString(),
    };
    setPinnedItems((prev) => [...prev, newItem]);
    await pinSidebarItemAuto(item);
  }, []);

  const unpinItem = React.useCallback(async (itemId: string) => {
    // Optimistic update
    setPinnedItems((prev) => prev.filter((p) => p.id !== itemId));
    await unpinSidebarItemAuto(itemId);
  }, []);

  const reorderPinned = React.useCallback(async (itemIds: string[]) => {
    // Optimistic update
    setPinnedItems((prev) => {
      const itemMap = new Map(prev.map((item) => [item.id, item]));
      return itemIds
        .map((id) => itemMap.get(id))
        .filter((item): item is PinnedItem => item !== undefined);
    });
    await reorderPinnedItemsAuto(itemIds);
  }, []);

  const isPinned = React.useCallback(
    (itemId: string) => pinnedItems.some((p) => p.id === itemId),
    [pinnedItems]
  );

  // Section customization actions
  const reorderSections = React.useCallback(async (newOrder: string[]) => {
    const previousOrder = sectionOrder;
    setSectionOrder(newOrder);

    const { error } = await reorderSectionsAuto(newOrder);
    if (error) {
      setSectionOrder(previousOrder);
      console.error("Failed to reorder sections:", error);
    }
  }, [sectionOrder]);

  const toggleSectionVisibility = React.useCallback(async (sectionId: string) => {
    const previousSections = sections;
    const section = sections[sectionId];
    if (!section) return;

    const newHidden = !section.hidden;

    setSections((prev) => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        hidden: newHidden,
      },
    }));

    const { error } = isBuiltInSectionId(sectionId)
      ? await updateBuiltInSectionAuto(sectionId, { hidden: newHidden })
      : await updateCustomSectionAuto(sectionId, { hidden: newHidden });

    if (error) {
      setSections(previousSections);
      console.error("Failed to toggle section visibility:", error);
    }
  }, [sections]);

  const updateSectionLabel = React.useCallback(async (sectionId: string, label: string) => {
    const previousSections = sections;
    const section = sections[sectionId];
    if (!section) return;

    setSections((prev) => {
      if (section.type === "custom") {
        return {
          ...prev,
          [sectionId]: {
            ...section,
            title: label,
          },
        };
      } else {
        return {
          ...prev,
          [sectionId]: {
            ...section,
            customTitle: label,
          },
        };
      }
    });

    const { error } = isBuiltInSectionId(sectionId)
      ? await updateBuiltInSectionAuto(sectionId, { customTitle: label })
      : await updateCustomSectionAuto(sectionId, { title: label });

    if (error) {
      setSections(previousSections);
      console.error("Failed to update section label:", error);
    }
  }, [sections]);

  const updateSectionEmoji = React.useCallback(async (sectionId: string, emoji: string | null) => {
    const previousSections = sections;
    const section = sections[sectionId];
    if (!section) return;

    setSections((prev) => {
      if (section.type === "custom") {
        return {
          ...prev,
          [sectionId]: {
            ...section,
            emoji,
          },
        };
      } else {
        return {
          ...prev,
          [sectionId]: {
            ...section,
            customEmoji: emoji,
          },
        };
      }
    });

    const { error } = isBuiltInSectionId(sectionId)
      ? await updateBuiltInSectionAuto(sectionId, { customEmoji: emoji })
      : await updateCustomSectionAuto(sectionId, { emoji });

    if (error) {
      setSections(previousSections);
      console.error("Failed to update section emoji:", error);
    }
  }, [sections]);

  const resetSection = React.useCallback(async (sectionId: BuiltInSectionId) => {
    const previousSections = sections;
    const defaultSection = DEFAULT_BUILTIN_SECTIONS[sectionId];

    setSections((prev) => ({
      ...prev,
      [sectionId]: structuredClone(defaultSection),
    }));

    // Reset to defaults by clearing custom values
    const { error } = await updateBuiltInSectionAuto(sectionId, {
      customTitle: null,
      customIcon: null,
      customEmoji: null,
      hidden: defaultSection.hidden,
      defaultCollapsed: defaultSection.defaultCollapsed,
    });

    if (error) {
      setSections(previousSections);
      console.error("Failed to reset section:", error);
    }
  }, [sections]);

  // Custom section actions
  const addCustomSection = React.useCallback(async (title: string): Promise<string | null> => {
    const maxSortOrder = Math.max(
      ...Object.values(sections).map((s) => s.sortOrder),
      0
    );
    const newSection = createCustomSection(title, maxSortOrder + 1);

    // Optimistic update
    setSections((prev) => ({
      ...prev,
      [newSection.id]: newSection,
    }));
    setSectionOrder((prev) => [...prev, newSection.id]);

    // Persist to database
    const { error, sectionId } = await createCustomSectionAuto({
      type: "custom",
      title: newSection.title,
      emoji: newSection.emoji,
      icon: newSection.icon,
      items: newSection.items,
      hidden: newSection.hidden,
      defaultCollapsed: newSection.defaultCollapsed,
    });

    if (error) {
      console.error("Failed to create custom section:", error);
      // Rollback optimistic update on error
      setSections((prev) =>
        Object.fromEntries(
          Object.entries(prev).filter(([key]) => key !== newSection.id)
        ) as Record<string, SectionConfig>
      );
      setSectionOrder((prev) => prev.filter((id) => id !== newSection.id));
      return null;
    }

    return sectionId || newSection.id;
  }, [sections]);

  const updateCustomSection = React.useCallback(
    async (sectionId: string, updates: Partial<CustomSectionConfig>) => {
      // Store previous state for rollback
      let previousSection: SectionConfig | undefined;

      setSections((prev) => {
        const section = prev[sectionId];
        if (!section || section.type !== "custom") return prev;

        previousSection = section;

        return {
          ...prev,
          [sectionId]: {
            ...section,
            ...updates,
          },
        };
      });

      // Persist to database
      const { error } = await updateCustomSectionAuto(sectionId, updates);

      if (error) {
        console.error("Failed to update custom section:", error);
        // Rollback on error
        if (previousSection) {
          setSections((prev) => ({
            ...prev,
            [sectionId]: previousSection!,
          }));
        }
      }
    },
    []
  );

  const removeCustomSection = React.useCallback(async (sectionId: string) => {
    // Store previous state for rollback
    let previousSection: SectionConfig | undefined;
    let previousOrder: string[] = [];

    setSections((prev) => {
      previousSection = prev[sectionId];
      return Object.fromEntries(
        Object.entries(prev).filter(([key]) => key !== sectionId)
      ) as Record<string, SectionConfig>;
    });
    setSectionOrder((prev) => {
      previousOrder = prev;
      return prev.filter((id) => id !== sectionId);
    });

    // Persist to database
    const { error } = await deleteCustomSectionAuto(sectionId);

    if (error) {
      console.error("Failed to delete custom section:", error);
      // Rollback on error
      if (previousSection) {
        setSections((prev) => ({
          ...prev,
          [sectionId]: previousSection!,
        }));
        setSectionOrder(previousOrder);
      }
    }
  }, []);

  const addCustomSectionItem = React.useCallback(
    async (sectionId: string, item: Omit<CustomSectionItem, "id" | "sortOrder">) => {
      // Generate temp ID for optimistic update
      const tempItemId = crypto.randomUUID();
      let previousSection: SectionConfig | undefined;

      setSections((prev) => {
        const section = prev[sectionId];
        if (!section || section.type !== "custom") return prev;

        previousSection = section;

        const maxSortOrder = Math.max(
          ...section.items.map((i) => i.sortOrder),
          0
        );

        const newItem: CustomSectionItem = {
          ...item,
          id: tempItemId,
          sortOrder: maxSortOrder + 1,
        } as CustomSectionItem;

        return {
          ...prev,
          [sectionId]: {
            ...section,
            items: [...section.items, newItem],
          },
        };
      });

      // Persist to database
      const { error } = await addCustomSectionItemAuto(sectionId, item);

      if (error) {
        console.error("Failed to add custom section item:", error);
        // Rollback on error
        if (previousSection) {
          setSections((prev) => ({
            ...prev,
            [sectionId]: previousSection!,
          }));
        }
      }
    },
    []
  );

  const removeCustomSectionItem = React.useCallback(
    async (sectionId: string, itemId: string) => {
      let previousSection: SectionConfig | undefined;

      setSections((prev) => {
        const section = prev[sectionId];
        if (!section || section.type !== "custom") return prev;

        previousSection = section;

        return {
          ...prev,
          [sectionId]: {
            ...section,
            items: section.items.filter((i) => i.id !== itemId),
          },
        };
      });

      // Persist to database
      const { error } = await removeCustomSectionItemAuto(sectionId, itemId);

      if (error) {
        console.error("Failed to remove custom section item:", error);
        // Rollback on error
        if (previousSection) {
          setSections((prev) => ({
            ...prev,
            [sectionId]: previousSection!,
          }));
        }
      }
    },
    []
  );

  // Built-in section item actions
  const updateBuiltInItem = React.useCallback(
    async (
      sectionId: BuiltInSectionId,
      itemId: string,
      updates: Partial<Pick<SectionItemConfig, "customName" | "customIcon" | "customEmoji" | "hidden">>
    ) => {
      let previousSection: SectionConfig | undefined;

      setSections((prev) => {
        const section = prev[sectionId];
        if (!section || section.type !== "builtin") return prev;

        previousSection = section;
        const existingItem = section.items[itemId];
        if (!existingItem) return prev;

        return {
          ...prev,
          [sectionId]: {
            ...section,
            items: {
              ...section.items,
              [itemId]: {
                ...existingItem,
                ...updates,
              },
            },
          },
        };
      });

      const { error } = await updateBuiltInItemAuto(sectionId, itemId, updates);

      if (error) {
        console.error("Failed to update built-in item:", error);
        if (previousSection) {
          setSections((prev) => ({
            ...prev,
            [sectionId]: previousSection!,
          }));
        }
      }
    },
    []
  );

  const reorderBuiltInItems = React.useCallback(
    async (sectionId: BuiltInSectionId, itemOrder: string[]) => {
      let previousSection: SectionConfig | undefined;

      setSections((prev) => {
        const section = prev[sectionId];
        if (!section || section.type !== "builtin") return prev;

        previousSection = section;

        return {
          ...prev,
          [sectionId]: {
            ...section,
            itemOrder,
          },
        };
      });

      const { error } = await reorderBuiltInItemsAuto(sectionId, itemOrder);

      if (error) {
        console.error("Failed to reorder built-in items:", error);
        if (previousSection) {
          setSections((prev) => ({
            ...prev,
            [sectionId]: previousSection!,
          }));
        }
      }
    },
    []
  );

  const addCustomItemToBuiltInSection = React.useCallback(
    async (sectionId: BuiltInSectionId, item: Omit<CustomSectionItem, "id" | "sortOrder">) => {
      const tempItemId = crypto.randomUUID();
      let previousSection: SectionConfig | undefined;

      setSections((prev) => {
        const section = prev[sectionId];
        if (!section || section.type !== "builtin") return prev;

        previousSection = section;

        const maxSortOrder = Math.max(
          ...section.customItems.map((i) => i.sortOrder),
          0
        );

        const newItem: CustomSectionItem = {
          ...item,
          id: tempItemId,
          sortOrder: maxSortOrder + 1,
        } as CustomSectionItem;

        return {
          ...prev,
          [sectionId]: {
            ...section,
            customItems: [...section.customItems, newItem],
            itemOrder: [...section.itemOrder, tempItemId],
          },
        };
      });

      const { error } = await addCustomItemToBuiltInSectionAuto(sectionId, item);

      if (error) {
        console.error("Failed to add custom item to built-in section:", error);
        if (previousSection) {
          setSections((prev) => ({
            ...prev,
            [sectionId]: previousSection!,
          }));
        }
      }
    },
    []
  );

  const removeCustomItemFromBuiltInSection = React.useCallback(
    async (sectionId: BuiltInSectionId, itemId: string) => {
      let previousSection: SectionConfig | undefined;

      setSections((prev) => {
        const section = prev[sectionId];
        if (!section || section.type !== "builtin") return prev;

        previousSection = section;

        return {
          ...prev,
          [sectionId]: {
            ...section,
            customItems: section.customItems.filter((i) => i.id !== itemId),
            itemOrder: section.itemOrder.filter((id) => id !== itemId),
          },
        };
      });

      const { error } = await removeCustomItemFromBuiltInSectionAuto(sectionId, itemId);

      if (error) {
        console.error("Failed to remove custom item from built-in section:", error);
        if (previousSection) {
          setSections((prev) => ({
            ...prev,
            [sectionId]: previousSection!,
          }));
        }
      }
    },
    []
  );

  const resetBuiltInItem = React.useCallback(
    async (sectionId: BuiltInSectionId, itemId: string) => {
      let previousSection: SectionConfig | undefined;
      const defaultItem = DEFAULT_MEAL_PLANNING_ITEMS[itemId];

      if (!defaultItem) {
        console.error("Cannot reset: invalid item ID");
        return;
      }

      setSections((prev) => {
        const section = prev[sectionId];
        if (!section || section.type !== "builtin") return prev;

        previousSection = section;

        return {
          ...prev,
          [sectionId]: {
            ...section,
            items: {
              ...section.items,
              [itemId]: structuredClone(defaultItem),
            },
          },
        };
      });

      const { error } = await resetBuiltInItemAuto(sectionId, itemId);

      if (error) {
        console.error("Failed to reset built-in item:", error);
        if (previousSection) {
          setSections((prev) => ({
            ...prev,
            [sectionId]: previousSection!,
          }));
        }
      }
    },
    []
  );

  // Helper
  const getVisibleSectionsCallback = React.useCallback(() => {
    return getVisibleSections({
      sections,
      sectionOrder,
      mode,
      width,
      pinnedItems,
      pinnedSectionExpanded: true,
      schemaVersion: 2,
      reducedMotion,
    });
  }, [sections, sectionOrder, mode, width, pinnedItems, reducedMotion]);

  // Derived state
  const isIconOnly = isCollapsed || width <= SIDEBAR_DIMENSIONS.MIN_WIDTH;
  const isExpanded = mode === "expanded";

  const value = React.useMemo<SidebarContextValue>(
    () => ({
      width,
      isCollapsed,
      isMobileOpen,
      isMobile,
      isTablet,
      mode,
      pinnedItems,
      sections,
      sectionOrder,
      reducedMotion,
      isIconOnly,
      isExpanded,
      setWidth,
      toggleCollapse,
      collapse,
      expand,
      openMobile,
      closeMobile,
      toggleMobile,
      setMode,
      pinItem,
      unpinItem,
      reorderPinned,
      isPinned,
      reorderSections,
      toggleSectionVisibility,
      updateSectionLabel,
      updateSectionEmoji,
      resetSection,
      addCustomSection,
      updateCustomSection,
      removeCustomSection,
      addCustomSectionItem,
      removeCustomSectionItem,
      updateBuiltInItem,
      reorderBuiltInItems,
      addCustomItemToBuiltInSection,
      removeCustomItemFromBuiltInSection,
      resetBuiltInItem,
      getVisibleSections: getVisibleSectionsCallback,
      isLoading,
    }),
    [
      width,
      isCollapsed,
      isMobileOpen,
      isMobile,
      isTablet,
      mode,
      pinnedItems,
      sections,
      sectionOrder,
      reducedMotion,
      isIconOnly,
      isExpanded,
      setWidth,
      toggleCollapse,
      collapse,
      expand,
      openMobile,
      closeMobile,
      toggleMobile,
      setMode,
      pinItem,
      unpinItem,
      reorderPinned,
      isPinned,
      reorderSections,
      toggleSectionVisibility,
      updateSectionLabel,
      updateSectionEmoji,
      resetSection,
      addCustomSection,
      updateCustomSection,
      removeCustomSection,
      addCustomSectionItem,
      removeCustomSectionItem,
      updateBuiltInItem,
      reorderBuiltInItems,
      addCustomItemToBuiltInSection,
      removeCustomItemFromBuiltInSection,
      resetBuiltInItem,
      getVisibleSectionsCallback,
      isLoading,
    ]
  );

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar(): SidebarContextValue {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

// Export dimensions for use in components
export { SIDEBAR_DIMENSIONS };
