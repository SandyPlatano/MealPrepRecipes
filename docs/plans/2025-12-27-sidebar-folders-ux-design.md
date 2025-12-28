# Sidebar Folders UX Redesign

**Date:** 2025-12-27
**Status:** Approved
**Author:** Claude + User collaboration

## Problem Statement

The current recipe sidebar has UX issues:
- Unclear distinction between categories, folders, and smart folders
- The [+] button sits alone at the bottom with no context
- No guidance for new users on how to organize recipes
- No ability to collapse sections

## Design Goals

1. Make the sidebar intuitive and self-explanatory
2. Clearly distinguish smart folders from manual folders
3. Provide helpful onboarding for new users
4. Allow collapsing to save space

---

## Final Design

### Overall Structure

```
┌─────────────────────────────────────┐
│                                     │
│  ▼ FOLDERS                      [+] │
│  │ 📖  All Recipes              3  │
│  │ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─   │
│  │ ⚡  Quick Meals            ✨   │
│  │ ⭐  Highly Rated           ✨   │
│  │ 🆕  Recently Added         ✨   │
│  │ 🔍  Never Cooked           ✨   │
│  │ 🔥  Frequently Cooked      ✨   │
│  │ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─   │
│  │ 📁  Italian                 12  │
│  │ 📁  Healthy                  8  │
│  │ 📁  Party Food               5  │
│                                     │
└─────────────────────────────────────┘
```

**Key decisions:**
- **Single "FOLDERS" section** — everything in one collapsible group
- **All Recipes at top** — pinned as "home base"
- **Smart folders next** — with ✨ sparkle badge to indicate auto-updating
- **User folders last** — manual collections
- **Subtle dividers** — dashed lines separate the three groups
- **[+] button in header** — clear, contextual placement

### Hierarchy Within Section

1. All Recipes (always first, pinned)
2. Smart folders (system-provided + user-created, marked with ✨)
3. User folders (manual collections)

### Visual Distinction

- **Smart folders**: Show ✨ sparkle badge on the right side
- **User folders**: Show recipe count on the right side
- **All Recipes**: Shows total recipe count

---

## Empty States & Onboarding

### Empty State (no user folders)

```
│  │ 🔥  Frequently Cooked      ✨   │
│  │ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─   │
│  │ ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐  │
│  │   + Create a folder            │
│  │     to organize recipes        │
│  │ └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘  │
```

- Dashed box appears below smart folders when no user folders exist
- Clicking opens "Create Folder" dialog

### First-Time Tooltip

```
┌─────────────────────────────────────┐
│  ▼ FOLDERS                      [+]◄───┐
│                                        │
│                    ┌───────────────────┤
│                    │ 💡 Organize your  │
│                    │ recipes into      │
│                    │ folders, or use   │
│                    │ smart folders to  │
│                    │ filter by rating, │
│                    │ cook time & more  │
│                    │          [Got it] │
│                    └──────────────────-┘
```

- Points to [+] button
- Shows on first visit after sign-up
- Dismissed with "Got it" button
- Stored in localStorage as `folders_tooltip_shown`

---

## Interactions

### [+] Button Menu

```
┌──────────────────┐
│ 📁 New Folder    │
│ ✨ New Smart     │
│    Folder        │
└──────────────────┘
```

### Hover State

Shows ⋯ menu button on each item (except All Recipes):

```
│  │ 📁  Italian            12   [⋯] │
```

### Context Menu (right-click or ⋯)

**For user folders:**
```
┌────────────────────┐
│ ✏️  Rename         │
│ 🎨  Change Icon    │
│ ───────────────    │
│ 🗑️  Delete         │
└────────────────────┘
```

**For smart folders (including system):**
```
┌────────────────────┐
│ ✏️  Edit Filters   │
│ 🎨  Change Icon    │
│ ───────────────    │
│ 🗑️  Delete         │
└────────────────────┘
```

All smart folders can be deleted, including system ones.

### Active State

Selected folder shows:
- Left accent bar (existing behavior)
- Subtle background highlight (existing behavior)

---

## Collapsed State

### Collapsed Section

```
│  ▶ FOLDERS (14)                 [+] │
```

- Shows item count in parentheses
- [+] button remains visible

### Icon-Only Sidebar

```
┌──────┐
│  📁  │  ← hover tooltip: "Folders (14)"
└──────┘
```

### Persistence

- Collapse state stored in `localStorage.sidebar_folders_collapsed`
- Persists across sessions
- Mobile: always starts expanded (no persistence)

---

## localStorage Keys

| Key | Type | Purpose |
|-----|------|---------|
| `sidebar_folders_collapsed` | boolean | Section collapse state |
| `folders_tooltip_shown` | boolean | First-time tooltip dismissed |

---

## What's NOT Changing

- Folder creation/edit dialogs (existing UI)
- Smart folder filter builder (existing UI)
- Recipe assignment to folders (existing flow)
- Active state styling (existing behavior)

## What's Being Removed

- **Categories** — No more category groupings, flat folder list only
- **Separate sections** — No more "RECIPES" vs categories, just one "FOLDERS" section

---

## Migration Notes

- Existing categories will be removed; folders become flat list
- Existing folders retain their data, just lose category association
- System smart folders remain as-is but now deletable

---

## Summary of Changes

| Current | Proposed |
|---------|----------|
| Separate "RECIPES" label + smart folders + categories + folders | Single "FOLDERS" section |
| Categories containing folders | Flat folder list (no categories) |
| Unclear what's smart vs manual | ✨ badge on smart folders |
| Lonely [+] button at bottom | [+] in section header with menu |
| No empty state guidance | Inline prompt + first-time tooltip |
| No collapse | Collapsible with localStorage persistence |
