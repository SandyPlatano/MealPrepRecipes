/**
 * Ingredient substitution type definitions
 * Database functions have been moved to @/app/actions/substitutions
 */

export interface Substitution {
  id: string;
  original_ingredient: string;
  substitute_ingredient: string;
  notes: string | null;
  is_default: boolean;
}

export interface UserSubstitution {
  id: string;
  user_id: string;
  original_ingredient: string;
  substitute_ingredient: string;
  notes: string | null;
}
