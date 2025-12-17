export type CustomFieldType =
  | 'text'
  | 'number'
  | 'boolean'
  | 'date'
  | 'select'
  | 'multi_select'
  | 'url'
  | 'rating';

export interface SelectOption {
  value: string;
  label: string;
  color?: string;
}

export interface ValidationRules {
  min?: number;
  max?: number;
  pattern?: string;
  required?: boolean;
}

export interface CustomFieldDefinition {
  id: string;
  householdId: string;
  name: string;
  slug: string;
  fieldType: CustomFieldType;
  description: string | null;
  isRequired: boolean;
  defaultValue: unknown;
  options: SelectOption[] | null; // for select types
  validationRules: ValidationRules | null;
  showInCard: boolean;
  showInFilters: boolean;
  sortOrder: number;
  icon: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomFieldValue {
  id: string;
  recipeId: string;
  fieldDefinitionId: string;
  value: unknown;
  createdAt: string;
  updatedAt: string;
}

export interface CustomFieldDefinitionFormData {
  name: string;
  fieldType: CustomFieldType;
  description?: string;
  isRequired?: boolean;
  defaultValue?: unknown;
  options?: SelectOption[];
  validationRules?: ValidationRules;
  showInCard?: boolean;
  showInFilters?: boolean;
  icon?: string;
}
