// Social features type definitions

import type { Recipe } from "./recipe";

// ============================================
// SHARING TYPES
// ============================================

export interface ShareableRecipe extends Recipe {
  is_public: boolean;
  share_token: string | null;
  view_count: number;
  original_recipe_id: string | null;
  original_author_id: string | null;
}

export interface RecipeShareEvent {
  id: string;
  recipe_id: string;
  event_type: "view" | "share_link_created" | "copy_recipe" | "signup_from_share";
  viewer_id: string | null;
  referrer: string | null;
  created_at: string;
}

export interface ShareAnalytics {
  total_views: number;
  unique_views: number;
  copies: number;
  signups_from_share: number;
}

// ============================================
// PUBLIC RECIPE TYPES
// ============================================

export interface RecipeAuthor {
  id: string;
  username: string;
  avatar_url: string | null;
  first_name?: string | null;
  last_name?: string | null;
}

export interface OriginalAuthor {
  id: string;
  username: string;
}

export interface PublicRecipe extends Recipe {
  is_public: boolean;
  share_token: string | null;
  view_count: number;
  original_recipe_id: string | null;
  original_author_id: string | null;
  author: RecipeAuthor;
  avg_rating: number | null;
  review_count: number;
  is_saved?: boolean;
  original_author?: OriginalAuthor | null;
}

export interface PublicRecipeFilters {
  search?: string;
  recipe_type?: string;
  category?: string;
  sort?: "trending" | "recent" | "rating" | "views";
  page?: number;
  limit?: number;
}

// ============================================
// REVIEW TYPES
// ============================================

export interface Review {
  id: string;
  recipe_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  content: string | null;
  photo_url: string | null;
  helpful_count: number;
  is_helpful?: boolean; // Whether current user marked it helpful
  created_at: string;
  updated_at: string;
  author: RecipeAuthor;
  response?: ReviewResponse | null;
}

export interface ReviewResponse {
  id: string;
  review_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface ReviewFormData {
  rating: number;
  title?: string;
  content?: string;
  photo?: File;
}

export interface ReviewWithAuthor extends Review {
  author: RecipeAuthor;
}

// ============================================
// USER PROFILE TYPES
// ============================================

export interface UserProfile {
  id: string;
  username: string;
  first_name: string | null;
  last_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  public_profile: boolean;
  follower_count: number;
  following_count: number;
  public_recipe_count?: number;
  is_following?: boolean; // Whether current user follows this user
  created_at: string;
}

export interface ProfileFormData {
  username: string;
  bio?: string;
  public_profile: boolean;
}

// ============================================
// FOLLOWING TYPES
// ============================================

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface FollowWithProfile extends Follow {
  profile: UserProfile;
}

// ============================================
// ACTIVITY FEED TYPES
// ============================================

export type ActivityEventType = "new_recipe" | "review" | "cook_logged";

export interface ActivityFeedItem {
  id: string;
  actor_id: string;
  event_type: ActivityEventType;
  recipe_id: string | null;
  is_public: boolean;
  created_at: string;
  actor: RecipeAuthor;
  recipe?: {
    id: string;
    title: string;
    image_url: string | null;
  } | null;
}

// ============================================
// REPORT TYPES
// ============================================

export type ReportReason = "inappropriate" | "spam" | "copyright" | "misleading" | "other";
export type RecipeReportReason = ReportReason; // Alias for use in actions
export type ReportStatus = "pending" | "reviewed" | "actioned" | "dismissed";

export interface RecipeReport {
  id: string;
  recipe_id: string;
  reporter_id: string;
  reason: ReportReason;
  description: string | null;
  status: ReportStatus;
  created_at: string;
}

export interface ReportFormData {
  reason: ReportReason;
  description?: string;
}

// ============================================
// SAVED RECIPES TYPES
// ============================================

export interface SavedRecipe {
  id: string;
  user_id: string;
  recipe_id: string;
  created_at: string;
}

// Simplified type for saved recipe list display (doesn't need all Recipe fields)
export interface SavedRecipeListItem {
  id: string;
  title: string;
  recipe_type: string;
  category: string | null;
  prep_time: string | null;
  cook_time: string | null;
  servings: string | null;
  image_url: string | null;
  view_count: number;
  avg_rating: number | null;
  review_count: number;
  created_at: string;
  author: RecipeAuthor;
  is_saved: boolean;
}

// ============================================
// TRENDING TYPES
// ============================================

export interface TrendingRecipe {
  id: string;
  title: string;
  recipe_type: string;
  category: string | null;
  image_url: string | null;
  view_count: number;
  save_count: number;
  score: number;
  author: RecipeAuthor;
  is_saved: boolean;
}

export interface TrendingCacheEntry {
  recipe_id: string;
  score: number;
  view_count: number;
  save_count: number;
  calculated_at: string;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ShareLinkResponse {
  share_token: string;
  share_url: string;
}

export interface PublicRecipesResponse {
  recipes: PublicRecipe[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export interface ReviewsResponse {
  reviews: Review[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
  avg_rating: number | null;
}

export interface ActivityFeedResponse {
  items: ActivityFeedItem[];
  has_more: boolean;
  cursor: string | null;
}
