export interface CustomMealType {
  id: string;
  householdId: string;
  name: string;
  slug: string;
  emoji: string;
  color: string;
  defaultTime: string;
  sortOrder: number;
  isSystem: boolean;
  createdAt: string;
}

export interface CustomMealTypeFormData {
  name: string;
  emoji: string;
  color: string;
  defaultTime: string;
}
