# Context Menu Navigation - Requirements Document

**Feature:** Comprehensive Right-Click Context Menus for Navigation Elements
**Date:** 2025-12-18
**Status:** Requirements Complete

---

## Executive Summary

Implement rich right-click context menus across all navigation elements in the MealPrepRecipes sidebar, inspired by Notion's interaction patterns. This feature extends the existing limited context menu implementation to provide comprehensive quick actions for folders, smart folders, categories, and pinned items.

### Goals
- Reduce clicks required for common navigation management tasks
- Provide discoverability for advanced features through contextual menus
- Maintain consistency with existing UI patterns (Radix UI + shadcn/ui)
- Support both desktop (right-click) and mobile (long-press) interactions

---

## Current State

### Existing Context Menu Implementation
- **Regular Folders** (`folder-tree-item.tsx`): Edit, Add Subfolder, Delete
- **Category Sections** (`category-section.tsx`): Edit, Delete
- **Sidebar Nav Items** (`sidebar-nav-item.tsx`): Pin/Unpin

### Available Infrastructure
- ✅ Radix UI `ContextMenu` component installed and styled
- ✅ Toast notifications via Sonner
- ✅ AlertDialog component for confirmations
- ✅ Server actions for all CRUD operations
- ✅ Icon library (lucide-react)
- ✅ Dialog/Sheet patterns for complex forms

### Gaps to Address
- ❌ Limited action coverage (only basic edit/delete)
- ❌ No keyboard shortcuts
- ❌ No submenu support for complex actions
- ❌ No bulk action capabilities
- ❌ No context-aware menu items
- ❌ No recent actions tracking
- ❌ Inconsistent mobile support

---

## Feature Scope

### In Scope
1. **Regular Folders** - User-created folders with hierarchy
2. **Smart Folders (System)** - Read-only auto-filtering folders
3. **Smart Folders (User)** - Custom editable smart folders
4. **Category Sections** - Folder grouping sections
5. **Pinned Items** - Quick access items in sidebar

### Out of Scope (for this phase)
- Context menus for recipes (already have three-dot dropdown)
- Context menus for meal plan assignments
- Context menus for shopping list items
- Bulk operations UI (checkboxes) - foundation only

---

## User Stories

### As a user managing folders...
1. I want to **duplicate a folder** so I can create similar collections without recreating recipes
2. I want to **quickly change a folder's color or emoji** without opening the full edit dialog
3. I want to **move a folder to a different category** to reorganize my sidebar
4. I want to **pin folders** to quick access for frequently used collections

### As a user working with smart folders...
5. I want to **pin system smart folders** (like "Quick Weeknight Dinners") for quick access
6. I want to **duplicate a system smart folder** to create a custom variation
7. I want to **view the filter rules** of a smart folder to understand what recipes it includes
8. I want to **export recipes** from a smart folder for external use

### As a user organizing categories...
9. I want to **collapse/expand all folders** in a category to manage visual clutter
10. I want to **reorder categories** to customize my sidebar layout
11. I want to **quickly add a folder** to a category without scrolling

### As a user with pinned items...
12. I want to **rename pinned items** to give them custom display names
13. I want to **reorder pinned items** without drag-and-drop
14. I want to **open items in new tabs** for multitasking

### As a power user...
15. I want **keyboard shortcuts** for common actions (Edit, Delete, Pin)
16. I want **recent actions** surfaced at the top of menus
17. I want **context-aware menus** that show relevant actions based on item state

---

## Functional Requirements

### FR-1: Regular Folder Context Menu

**Location:** Sidebar folders in folder tree
**Component:** `folder-tree-item.tsx`

**Actions:**

| Action | Description | Existing? | New? | Requires Confirmation? | Keyboard Shortcut |
|--------|-------------|-----------|------|------------------------|-------------------|
| Edit Folder | Open edit dialog | ✅ Yes | - | No | ⌘E |
| Duplicate Folder | Create copy with same recipes | - | ✅ Yes | Yes (with preview) | ⌘D |
| Add Subfolder | Create child folder (depth=0 only) | ✅ Yes | - | No | ⌘N |
| Move to Category | Submenu: List of categories | - | ✅ Yes | No | - |
| Change Color | Submenu: Color picker (8 colors) | - | ✅ Yes | No | - |
| Change Emoji | Submenu: Emoji picker (24 options) | - | ✅ Yes | No | - |
| Pin to Sidebar | Add to pinned section | - | ✅ Yes | No | ⌘P |
| Unpin from Sidebar | Remove from pinned | - | ✅ Yes | No | ⌘⇧P |
| **[Separator]** | - | - | - | - | - |
| Delete Folder | Remove folder + associations | ✅ Yes | - | Yes | ⌘⌫ |

**Business Rules:**
- "Add Subfolder" only visible for root folders (depth=0)
- "Pin/Unpin" toggles based on current state
- "Move to Category" submenu shows all categories + "Uncategorized"
- Duplicate creates folder with name "{Original Name} (Copy)"

**Technical Notes:**
- Use existing `createFolder()`, `updateFolder()`, `deleteFolder()` actions
- Add new `duplicateFolder(folderId)` server action
- Color/emoji pickers use existing UI from edit dialog
- Pin actions use existing `pinSidebarItemAuto()` / `unpinSidebarItemAuto()`

---

### FR-2: System Smart Folder Context Menu

**Location:** Sidebar smart folders (read-only, built-in)
**Component:** `sidebar-collections.tsx` (system smart folders section)

**Actions:**

| Action | Description | Existing? | New? | Requires Confirmation? | Keyboard Shortcut |
|--------|-------------|-----------|------|------------------------|-------------------|
| Pin to Sidebar | Add to pinned section | - | ✅ Yes | No | ⌘P |
| Unpin from Sidebar | Remove from pinned | - | ✅ Yes | No | ⌘⇧P |
| Duplicate as Custom | Create editable user smart folder | - | ✅ Yes | Yes (show preview) | ⌘D |
| View Filter Rules | Read-only dialog showing criteria | - | ✅ Yes | No | ⌘I |
| Export Recipes | Download matching recipes as JSON/CSV | - | ✅ Yes | No | ⌘⇧E |

**Business Rules:**
- No edit/delete actions (system folders are read-only)
- "Duplicate as Custom" creates user smart folder with same filters
- "View Filter Rules" shows human-readable filter criteria
- "Export Recipes" applies smart folder filters before export

**Technical Notes:**
- Use `getSystemSmartFolders()` for data
- Add `duplicateSystemSmartFolder(id)` server action
- Export uses existing recipe export functionality + filter application
- Filter rules dialog shows conditions in plain English (e.g., "Dinner recipes under 30 minutes")

---

### FR-3: User Smart Folder Context Menu

**Location:** Sidebar smart folders (custom, editable)
**Component:** `sidebar-collections.tsx` (user smart folders section)

**Actions:**

| Action | Description | Existing? | New? | Requires Confirmation? | Keyboard Shortcut |
|--------|-------------|-----------|------|------------------------|-------------------|
| Edit Filters | Open smart folder edit dialog | - | ✅ Yes | No | ⌘E |
| Duplicate | Create copy of smart folder | - | ✅ Yes | Yes (with preview) | ⌘D |
| Pin to Sidebar | Add to pinned section | - | ✅ Yes | No | ⌘P |
| Unpin from Sidebar | Remove from pinned | - | ✅ Yes | No | ⌘⇧P |
| **[Separator]** | - | - | - | - | - |
| Delete Smart Folder | Remove custom smart folder | ✅ Yes | - | Yes | ⌘⌫ |

**Business Rules:**
- Only visible for user-created smart folders (not system)
- Duplicate creates folder with name "{Original Name} (Copy)"
- Edit opens existing `smart-folder-dialog.tsx`

**Technical Notes:**
- Use existing `updateSmartFolder()`, `deleteSmartFolder()` actions
- Add new `duplicateSmartFolder(id)` server action
- Reuse existing smart folder edit dialog

---

### FR-4: Category Section Context Menu

**Location:** Sidebar category headers
**Component:** `category-section.tsx`

**Actions:**

| Action | Description | Existing? | New? | Requires Confirmation? | Keyboard Shortcut |
|--------|-------------|-----------|------|------------------------|-------------------|
| Edit Category | Open edit dialog | ✅ Yes | - | No | ⌘E |
| Add New Folder | Quick create folder in this category | - | ✅ Yes | No | ⌘N |
| Collapse All | Collapse all folders in category | - | ✅ Yes | No | - |
| Expand All | Expand all folders in category | - | ✅ Yes | No | - |
| Move Up | Reorder category higher | - | ✅ Yes | No | ⌘↑ |
| Move Down | Reorder category lower | - | ✅ Yes | No | ⌘↓ |
| Change Icon/Emoji | Inline emoji picker | - | ✅ Yes | No | - |
| **[Separator]** | - | - | - | - | - |
| Delete Category | Remove category (not "Uncategorized") | ✅ Yes | - | Yes | ⌘⌫ |

**Business Rules:**
- "Delete Category" disabled for "Uncategorized" system category
- "Move Up" disabled if already first
- "Move Down" disabled if already last
- Collapse/Expand affects only folders in this category
- "Add New Folder" pre-fills category in create dialog

**Technical Notes:**
- Use existing `updateFolderCategory()`, `deleteFolderCategory()` actions
- Add new `reorderFolderCategories(categoryIds)` server action
- Collapse/expand state stored in local storage or sidebar context
- Icon picker uses same emoji list as category edit dialog

---

### FR-5: Pinned Item Context Menu

**Location:** Sidebar pinned section
**Component:** `sidebar-nav-item.tsx`

**Actions:**

| Action | Description | Existing? | New? | Requires Confirmation? | Keyboard Shortcut |
|--------|-------------|-----------|------|------------------------|-------------------|
| Rename | Give custom display name | - | ✅ Yes | No | ⌘R |
| Open in New Tab | Open in new browser tab | - | ✅ Yes | No | ⌘Click |
| Move Up | Reorder higher in pinned list | - | ✅ Yes | No | ⌘↑ |
| Move Down | Reorder lower in pinned list | - | ✅ Yes | No | ⌘↓ |
| Quick Actions | Submenu: Context-specific actions | - | ✅ Yes | Varies | - |
| **[Separator]** | - | - | - | - | - |
| Unpin | Remove from pinned section | ✅ Yes | - | No | ⌘⇧P |

**Quick Actions Submenu (context-specific):**
- **For Recipes:** Edit Recipe, Duplicate Recipe, Add to Meal Plan
- **For Folders:** Edit Folder, Add Recipe to Folder
- **For Pages:** (No additional actions)

**Business Rules:**
- "Rename" changes display name in pinned section only (doesn't affect source item)
- "Move Up/Down" disabled at list boundaries
- "Quick Actions" submenu changes based on item type (recipe/folder/page)
- "Open in New Tab" uses native browser behavior

**Technical Notes:**
- Use existing `reorderPinnedItemsAuto()` action
- Add new `renamePinnedItem(id, customName)` action
- Custom names stored in sidebar preferences
- Quick actions dispatch to item-specific server actions

---

## Non-Functional Requirements

### NFR-1: Performance
- Context menus must render within 100ms of right-click
- Menu actions must execute within 500ms (excluding network requests)
- Server actions must return within 2 seconds

### NFR-2: Accessibility
- All menu items keyboard navigable (Tab, Arrow keys, Enter)
- Screen reader support via ARIA labels (Radix UI built-in)
- Focus management on menu open/close
- Escape key to close menu

### NFR-3: Mobile Support
- Long-press (500ms) to open context menu on touch devices
- Touch-friendly menu item sizing (44px min height)
- Prevent page scroll during long-press
- Fallback to three-dot button if long-press fails

### NFR-4: Visual Design
- Match existing Radix UI context menu styling
- Icons from lucide-react (consistent with app)
- Smart grouping: non-destructive → separator → destructive
- Destructive actions styled with `text-destructive` class
- Keyboard shortcuts right-aligned in menu items

### NFR-5: Error Handling
- Server action failures show error toast
- Failed confirmations don't execute action
- Network errors display retry option
- Optimistic UI updates with rollback on error

---

## User Experience Flow

### Flow 1: Duplicate Folder
1. User right-clicks on "Dinner Ideas" folder
2. Context menu appears with "Duplicate Folder" option
3. User clicks "Duplicate Folder"
4. Confirmation dialog appears: "Create 'Dinner Ideas (Copy)' with 23 recipes?"
5. User confirms
6. New folder created immediately (optimistic UI)
7. Toast notification: "Folder duplicated"
8. Server action completes in background

### Flow 2: Move Folder to Category
1. User right-clicks on "Summer Recipes" folder
2. Context menu appears with "Move to Category" option
3. User hovers over "Move to Category"
4. Submenu appears showing all categories: "My Folders", "Seasonal Recipes", "Uncategorized"
5. User clicks "Seasonal Recipes"
6. Folder moves immediately (optimistic UI)
7. Toast notification: "Moved to Seasonal Recipes"

### Flow 3: Change Folder Color (Quick)
1. User right-clicks on folder
2. Selects "Change Color"
3. Submenu appears with 8 color swatches
4. User clicks "Teal"
5. Color updates immediately
6. Toast notification: "Color updated"

### Flow 4: View Smart Folder Rules
1. User right-clicks "Quick Weeknight Dinners" (system smart folder)
2. Selects "View Filter Rules"
3. Read-only dialog appears:
   ```
   Filter Rules for "Quick Weeknight Dinners"

   ✓ Recipe Type: Dinner
   ✓ Total Time: ≤ 30 minutes

   Currently matching: 47 recipes
   ```
4. User closes dialog

### Flow 5: Bulk Selection + Action (Future Enhancement)
1. User clicks checkbox on multiple folders
2. User right-clicks on any selected folder
3. Context menu shows bulk actions: "Move Selected to Category", "Delete Selected", "Pin Selected"
4. User selects action
5. Confirmation dialog with count: "Delete 3 folders?"
6. Action applies to all selected items

---

## Technical Implementation

### Architecture Overview

```
User Right-Click
    ↓
ContextMenu Component (Radix UI)
    ↓
Menu Items with Actions
    ↓
[Confirmation Dialog] (if required)
    ↓
Server Action (Next.js)
    ↓
Supabase Database
    ↓
Revalidate Path/Tag
    ↓
UI Update + Toast Notification
```

### Component Structure

```tsx
<ContextMenu>
  <ContextMenuTrigger asChild>
    {/* Folder/Category/Item */}
  </ContextMenuTrigger>

  <ContextMenuContent>
    {/* Recent Actions (if any) */}
    {recentActions.length > 0 && (
      <>
        {recentActions.map(action => (
          <ContextMenuItem key={action.id}>
            <Icon /> {action.label}
            <ContextMenuShortcut>{action.shortcut}</ContextMenuShortcut>
          </ContextMenuItem>
        ))}
        <ContextMenuSeparator />
      </>
    )}

    {/* Non-destructive actions */}
    <ContextMenuItem onClick={handleEdit}>
      <Pencil className="h-4 w-4 mr-2" />
      Edit
      <ContextMenuShortcut>⌘E</ContextMenuShortcut>
    </ContextMenuItem>

    <ContextMenuSub>
      <ContextMenuSubTrigger>
        <Palette className="h-4 w-4 mr-2" />
        Change Color
      </ContextMenuSubTrigger>
      <ContextMenuSubContent>
        {colors.map(color => (
          <ContextMenuItem key={color} onClick={() => handleColorChange(color)}>
            <div className="h-4 w-4 mr-2 rounded" style={{backgroundColor: color}} />
            {color}
          </ContextMenuItem>
        ))}
      </ContextMenuSubContent>
    </ContextMenuSub>

    {/* Separator before destructive */}
    <ContextMenuSeparator />

    {/* Destructive actions */}
    <ContextMenuItem
      className="text-destructive focus:text-destructive"
      onClick={handleDelete}
    >
      <Trash2 className="h-4 w-4 mr-2" />
      Delete
      <ContextMenuShortcut>⌘⌫</ContextMenuShortcut>
    </ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>
```

### New Server Actions Required

**File: `/src/app/actions/folders.ts`**
```typescript
export async function duplicateFolder(folderId: string): Promise<ActionResult<RecipeFolder>>
export async function reorderFolderCategories(categoryIds: string[]): Promise<ActionResult<void>>
```

**File: `/src/app/actions/smart-folders.ts`**
```typescript
export async function duplicateSmartFolder(folderId: string): Promise<ActionResult<RecipeFolder>>
export async function duplicateSystemSmartFolder(systemFolderId: string): Promise<ActionResult<RecipeFolder>>
export async function exportSmartFolderRecipes(folderId: string, format: 'json' | 'csv'): Promise<ActionResult<Blob>>
```

**File: `/src/app/actions/sidebar-preferences.ts`**
```typescript
export async function renamePinnedItem(itemId: string, customName: string): Promise<ActionResult<void>>
export async function trackRecentAction(action: string): Promise<void>
export async function getRecentActions(): Promise<string[]>
```

### New UI Components

**File: `/src/components/folders/filter-rules-dialog.tsx`**
- Display smart folder filter criteria in human-readable format
- Show current recipe count matching filters

**File: `/src/components/folders/duplicate-folder-dialog.tsx`**
- Confirmation dialog for folder duplication
- Show preview: folder name, recipe count, category

**File: `/src/components/context-menus/folder-context-menu.tsx`**
- Reusable context menu for folders (wraps business logic)

**File: `/src/components/context-menus/smart-folder-context-menu.tsx`**
- Reusable context menu for smart folders (system vs user)

**File: `/src/components/context-menus/category-context-menu.tsx`**
- Reusable context menu for categories

**File: `/src/components/context-menus/pinned-item-context-menu.tsx`**
- Reusable context menu for pinned items

**File: `/src/hooks/useKeyboardShortcuts.ts`**
- Global keyboard shortcut handler
- Register shortcuts: ⌘E, ⌘D, ⌘N, ⌘P, ⌘⇧P, ⌘⌫, etc.

**File: `/src/hooks/useRecentActions.ts`**
- Track recently used menu actions
- Store in local storage
- Return top 3 recent actions

### State Management

**Keyboard Shortcuts:**
- Global event listener on document
- Scoped to focused element (e.g., folder in sidebar)
- Prevent default browser behavior

**Recent Actions:**
- Local storage: `recent_actions_${userId}`
- Array of action IDs with timestamps
- Max 10 actions tracked, show top 3

**Bulk Selection:**
- Context state: `selectedItems: string[]`
- Checkbox UI on hover/selection mode
- Clear selection after action

**Collapse/Expand State:**
- Local storage: `collapsed_categories_${userId}`
- Set of category IDs that are collapsed
- Toggle on "Collapse/Expand All" action

---

## Edge Cases & Error Handling

### Edge Case 1: Delete Folder with Recipes
- **Scenario:** User deletes folder containing recipes
- **Behavior:** Show confirmation with recipe count
- **Dialog:** "Delete 'Dinner Ideas' and remove 23 recipes from this folder? The recipes themselves will not be deleted."

### Edge Case 2: Move Folder to Same Category
- **Scenario:** User tries to move folder to its current category
- **Behavior:** Action completes silently (no-op)
- **Feedback:** No toast (already in that category)

### Edge Case 3: Duplicate Folder with Name Conflict
- **Scenario:** Duplicate creates name that already exists
- **Behavior:** Auto-append number: "Dinner Ideas (Copy 2)"
- **Feedback:** Toast shows actual created name

### Edge Case 4: Offline/Network Error
- **Scenario:** Server action fails due to network issue
- **Behavior:** Rollback optimistic UI update
- **Feedback:** Error toast: "Failed to update. Check your connection."

### Edge Case 5: Delete Last Category
- **Scenario:** User tries to delete the only remaining category
- **Behavior:** Prevent deletion
- **Feedback:** Error toast: "Cannot delete last category"

### Edge Case 6: Keyboard Shortcut Conflict
- **Scenario:** Browser shortcut conflicts with app shortcut
- **Behavior:** Respect browser shortcuts (⌘T, ⌘W, etc.)
- **Feedback:** Document known conflicts in help

### Edge Case 7: Long-Press on Mobile (Accidental)
- **Scenario:** User scrolling triggers long-press
- **Behavior:** Detect scroll movement, cancel long-press
- **Feedback:** No menu if scroll detected

---

## Testing Requirements

### Unit Tests
- Context menu rendering with correct items
- Conditional menu items (depth-based, state-based)
- Keyboard shortcut registration
- Recent actions tracking

### Integration Tests
- Server action success/failure flows
- Optimistic UI updates + rollback
- Toast notifications on actions
- Dialog confirmations

### E2E Tests
- Right-click → Select action → Confirm → Verify result
- Keyboard shortcut → Verify action executed
- Mobile long-press → Menu opens
- Bulk selection → Multi-item action

### Accessibility Tests
- Keyboard navigation (Tab, Arrows, Enter, Escape)
- Screen reader announcements
- Focus management

---

## Rollout Plan

### Phase 1: Foundation (Week 1)
- Keyboard shortcut system
- Recent actions tracking
- Reusable context menu components
- Server actions for new operations

### Phase 2: Regular Folders (Week 2)
- Duplicate folder
- Move to category (submenu)
- Change color/emoji (submenu)
- Pin/unpin

### Phase 3: Smart Folders (Week 2-3)
- System smart folder menu
- User smart folder menu
- Filter rules dialog
- Export functionality

### Phase 4: Categories & Pinned (Week 3)
- Category menu (collapse/expand, reorder)
- Pinned item menu (rename, reorder)
- Quick actions submenu

### Phase 5: Polish & Enhancements (Week 4)
- Context-aware menus
- Bulk selection foundation
- Mobile long-press refinement
- Error handling improvements

---

## Success Metrics

### Quantitative
- **Adoption Rate:** 60% of users try context menu within first week
- **Usage Frequency:** Average 5 context menu actions per session
- **Performance:** Menu render < 100ms, action execution < 500ms
- **Error Rate:** < 1% of context menu actions fail

### Qualitative
- Users report context menus as "discoverable"
- Reduced support requests for "How do I move/duplicate/organize?"
- Positive feedback on Notion-like interaction patterns

---

## Dependencies

### External Dependencies
- Radix UI `@radix-ui/react-context-menu` (already installed)
- lucide-react icons (already installed)
- Sonner for toasts (already installed)
- Next.js 14+ (already using)
- Supabase (already configured)

### Internal Dependencies
- Existing server actions: `folders.ts`, `smart-folders.ts`, `sidebar-preferences.ts`
- Existing components: `dialog.tsx`, `alert-dialog.tsx`, `context-menu.tsx`
- Existing types: `RecipeFolder`, `FolderCategory`, `SmartFilterCriteria`

---

## Open Questions

1. **Keyboard Shortcuts on Windows/Linux:**
   - Should we use Ctrl instead of ⌘ on non-Mac platforms?
   - **Decision:** Yes, detect platform and show appropriate modifier

2. **Bulk Actions Priority:**
   - Should bulk selection be part of Phase 1 or a future enhancement?
   - **Decision:** Foundation only in Phase 4, full implementation deferred

3. **Export Format Preference:**
   - Should we support multiple export formats (JSON, CSV, PDF)?
   - **Decision:** Start with JSON, add CSV if requested

4. **Recent Actions Persistence:**
   - Should recent actions sync across devices via Supabase?
   - **Decision:** Local storage only for now, may sync in future

5. **Context Menu Positioning:**
   - Should menus always open to the right, or adapt based on available space?
   - **Decision:** Radix UI handles auto-positioning

---

## Assumptions & Constraints

### Assumptions
- Users are familiar with right-click interactions (desktop)
- Touch device users understand long-press pattern
- Existing server actions handle permissions correctly (RLS)
- Folder hierarchy stays at max 2 levels (no changes needed)

### Constraints
- No breaking changes to existing folder data model
- Must work with existing household-scoped permissions
- Cannot exceed 300ms render time for menu (UX requirement)
- Mobile long-press must not interfere with native scrolling

---

## Future Enhancements (Out of Scope)

1. **Advanced Bulk Operations**
   - Multi-select with checkboxes
   - Bulk move, delete, pin actions
   - Selection persistence across navigation

2. **Custom Keyboard Shortcuts**
   - User-configurable shortcuts
   - Shortcut conflict detection
   - Settings page for customization

3. **Context Menu Themes**
   - Light/dark mode variants
   - Compact vs. spacious layouts
   - Icon-only mode

4. **Action History**
   - Undo/redo for context menu actions
   - Action history viewer
   - Replay actions

5. **AI-Powered Suggestions**
   - Suggest folders to create based on usage
   - Recommend colors/emojis based on folder content
   - Auto-categorize folders

---

## Conclusion

This feature brings MealPrepRecipes navigation interactions to parity with modern productivity tools like Notion, while respecting the existing architecture and user workflows. The phased rollout ensures stability and allows for user feedback between phases.

**Estimated Effort:** 3-4 weeks (1 developer)
**Risk Level:** Low (extends existing patterns, no data model changes)
**User Impact:** High (significantly improves navigation management UX)
