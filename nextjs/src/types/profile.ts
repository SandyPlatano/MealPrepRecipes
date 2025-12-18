// Public profile type definitions
// For the quirky, fun cooking social network "bonding over food"

// ============================================
// PUBLIC PROFILE TYPES
// ============================================

export type CookingSkillLevel = 'beginner' | 'home_cook' | 'enthusiast' | 'semi_pro' | 'professional';
export type CookWithMeStatus = 'not_set' | 'open' | 'busy' | 'looking_for_partner';

export interface PublicProfile {
  id: string;
  username: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  cover_image_url: string | null;
  bio: string | null;
  cooking_philosophy: string | null;
  location: string | null;
  website: string | null;
  favorite_cuisine: string | null;
  cooking_skill: CookingSkillLevel | null;
  cook_with_me_status: CookWithMeStatus;
  currently_craving: string | null;
  profile_theme: string;
  profile_emoji: string;
  follower_count: number;
  following_count: number;
  public_recipe_count: number;
  total_cooks: number;
  created_at: string;
  is_following?: boolean; // Whether current user follows this profile

  // Privacy toggles
  show_cooking_stats: boolean;
  show_badges: boolean;
  show_cook_photos: boolean;
  show_reviews: boolean;
  show_saved_recipes: boolean;
}

// ============================================
// COOKING STATS TYPES
// ============================================

export interface CookingStreak {
  current_streak_days: number;
  longest_streak_days: number;
  total_meals_cooked: number;
  total_recipes_tried: number;
  weekly_target: number;
  current_week_count: number;
}

// ============================================
// BADGE TYPES (Future feature placeholder)
// ============================================

export type BadgeRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type BadgeCategory = 'cooking' | 'social' | 'collection' | 'achievement' | 'special';

export interface UserBadge {
  id: string;
  slug: string;
  name: string;
  description: string;
  emoji: string;
  category: BadgeCategory;
  rarity: BadgeRarity;
  earned_at: string;
  is_featured: boolean;
}

// ============================================
// COOK PHOTO TYPES
// ============================================

export interface CookPhoto {
  id: string;
  photo_url: string;
  caption: string | null;
  recipe_id: string;
  recipe_title: string;
  recipe_image_url: string | null;
  like_count: number;
  created_at: string;
  is_liked?: boolean; // Whether current user liked this photo
}

// ============================================
// COLLECTION TYPES
// ============================================

export interface PublicCollection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  emoji: string;
  recipe_count: number;
  save_count: number;
  is_public: boolean;
  created_at: string;
}

// ============================================
// REVIEW TYPES (for profile display)
// ============================================

export interface ProfileReview {
  id: string;
  recipe_id: string;
  recipe_title: string;
  recipe_image_url: string | null;
  rating: number;
  title: string | null;
  content: string | null;
  created_at: string;
  helpful_count: number;
}
