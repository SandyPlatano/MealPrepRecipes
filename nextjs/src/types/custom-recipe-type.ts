export interface CustomRecipeType {
  id: string;
  householdId: string;
  name: string;
  slug: string;
  emoji: string;
  color: string;
  description: string | null;
  sortOrder: number;
  isSystem: boolean;
  createdAt: string;
}

export interface CustomRecipeTypeFormData {
  name: string;
  emoji: string;
  color: string;
  description?: string;
}
