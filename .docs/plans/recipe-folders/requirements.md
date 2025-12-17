# Recipe Folders Feature

## Overview

Allow users to organize their recipes into folders and subfolders for flexible, hierarchical organization. Recipes can belong to multiple folders, and folders are shared across household members.

---

## User Requirements

| Requirement | Decision |
|-------------|----------|
| Folder membership | Many-to-many (recipe can be in multiple folders) |
| Nesting depth | 2 levels (folders + subfolders) |
| Sharing model | Shared with household |
| Custom styling | Colors and emoji icons |
| Smart folders | "Recently Added" (last 30 days) |
| Cover images | Use recipe image as folder thumbnail |
| Default folders | Starter set for new users |
| UI location | Collapsible sidebar on recipes page |

---

## User Flow

### Browsing by Folder

1. User navigates to `/app/recipes`
2. Sidebar appears on the left with folder tree
3. User clicks a folder to filter recipe grid
4. Grid shows only recipes in that folder
5. User can click "All Recipes" to clear filter

### Creating a Folder

1. User clicks "+" button in sidebar
2. Dialog opens with fields: name, emoji, color, parent folder
3. User fills out form and clicks "Create"
4. New folder appears in sidebar tree

### Adding Recipe to Folder(s)

1. User clicks recipe card menu → "Add to Folders"
2. Bottom sheet opens showing all folders with checkboxes
3. User selects/deselects folders
4. User clicks "Save"
5. Recipe is now in selected folders

### Smart Folders

- **Recently Added**: Auto-populated with recipes created in last 30 days
- These are virtual (not stored in DB), computed on-the-fly
- Appear in a separate "Smart Folders" section

---

## Technical Implementation

### Database Schema

**New Tables:**

```sql
-- Folders table
recipe_folders (
  id UUID PRIMARY KEY,
  household_id UUID NOT NULL → households(id),
  created_by_user_id UUID NOT NULL → profiles(id),
  name TEXT NOT NULL,
  emoji TEXT,
  color TEXT,
  parent_folder_id UUID → recipe_folders(id),  -- max 2 levels
  cover_recipe_id UUID → recipes(id),
  sort_order INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- Junction table (many-to-many)
recipe_folder_members (
  id UUID PRIMARY KEY,
  folder_id UUID NOT NULL → recipe_folders(id),
  recipe_id UUID NOT NULL → recipes(id),
  added_at TIMESTAMPTZ,
  added_by_user_id UUID → profiles(id),
  UNIQUE(folder_id, recipe_id)
)
```

**RLS Policies:** Household members can view/create/update/delete folders in their household.

**Constraint:** Parent folder cannot have a parent (enforces max 2 levels).

### Server Actions

**File:** `/nextjs/src/app/actions/folders.ts`

| Action | Purpose |
|--------|---------|
| `getFolders()` | Get folder tree with recipe counts |
| `getFolder(id)` | Get single folder |
| `getFolderRecipeIds(folderId)` | Get recipe IDs in a folder |
| `getRecipeFolderIds(recipeId)` | Get folder IDs containing a recipe |
| `createFolder(data)` | Create new folder |
| `updateFolder(id, data)` | Update folder |
| `deleteFolder(id)` | Delete folder (cascades) |
| `addRecipeToFolder(recipeId, folderId)` | Add recipe to folder |
| `removeRecipeFromFolder(recipeId, folderId)` | Remove recipe from folder |
| `setRecipeFolders(recipeId, folderIds[])` | Set all folders for a recipe |
| `createDefaultFolders()` | Create starter folders for household |

### UI Components

**New Directory:** `/nextjs/src/components/folders/`

| Component | Purpose |
|-----------|---------|
| `folder-sidebar.tsx` | Collapsible sidebar with folder tree |
| `folder-tree-item.tsx` | Recursive tree item with expand/collapse |
| `add-to-folder-sheet.tsx` | Bottom sheet for multi-select folders |
| `create-folder-dialog.tsx` | Dialog for creating folders |
| `edit-folder-dialog.tsx` | Dialog for editing folders |

### Integration Points

**Modified Files:**

| File | Changes |
|------|---------|
| `recipes/page.tsx` | Fetch folders, pass to client |
| `recipes-page-client.tsx` | Add sidebar, manage filter state |
| `recipe-grid.tsx` | Accept folder filter, filter recipes |
| `recipe-card.tsx` | Add "Add to Folders" menu item |

### Types

**File:** `/nextjs/src/types/folder.ts`

```typescript
interface RecipeFolder {
  id: string;
  household_id: string;
  created_by_user_id: string;
  name: string;
  emoji: string | null;
  color: string | null;
  parent_folder_id: string | null;
  cover_recipe_id: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface FolderWithChildren extends RecipeFolder {
  children: FolderWithChildren[];
  recipe_count: number;
  cover_image_url: string | null;
}

type SmartFolderType = 'recently_added' | 'favorites' | 'uncategorized';

type ActiveFolderFilter =
  | { type: 'folder'; id: string }
  | { type: 'smart'; id: SmartFolderType }
  | { type: 'all' };
```

---

## Default Folders (Starter Set)

New households get these folders automatically:

| Folder | Emoji | Color |
|--------|-------|-------|
| Weeknight Dinners | 🍽️ | #FF6B6B |
| Meal Prep | 📦 | #4ECDC4 |
| Family Favorites | ❤️ | #FFE66D |
| Quick & Easy | ⚡ | #95E1D3 |

---

## File Structure

```
nextjs/
├── src/
│   ├── app/actions/folders.ts              # NEW
│   ├── components/folders/                  # NEW DIRECTORY
│   │   ├── folder-sidebar.tsx
│   │   ├── folder-tree-item.tsx
│   │   ├── add-to-folder-sheet.tsx
│   │   ├── create-folder-dialog.tsx
│   │   ├── edit-folder-dialog.tsx
│   │   └── index.ts
│   └── types/folder.ts                      # NEW
└── supabase/migrations/
    └── 20251218_recipe_folders.sql          # NEW
```

---

## Out of Scope

- Drag-and-drop reordering of folders (future enhancement)
- Sharing individual folders publicly (only recipes can be public)
- Folder templates or presets beyond starter set
- Additional smart folder rules beyond "Recently Added"

---

## Migration Notes

- Tables use `ON DELETE CASCADE` for safe cleanup
- Existing households will get default folders via one-time migration
- New users get default folders automatically via database function
