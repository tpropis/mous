/**
 * Supabase database types.
 * Hand-authored to match `supabase/migrations/20260615000000_init.sql`. In a real
 * project these are generated with `supabase gen types typescript`. Insert/Update
 * types are written concretely (not self-referential) so the supabase-js query
 * builder resolves payload types correctly instead of falling back to `never`.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          anonymous_name: string;
          avatar_style: string;
          bio: string | null;
          is_admin: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          anonymous_name: string;
          avatar_style?: string;
          bio?: string | null;
          is_admin?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          anonymous_name?: string;
          avatar_style?: string;
          bio?: string | null;
          is_admin?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      stories: {
        Row: {
          id: string;
          author_id: string;
          title: string;
          body: string;
          excerpt: string;
          category: string;
          mood: string;
          tags: string[];
          truth_type: string;
          location_visibility: string;
          city: string | null;
          state: string | null;
          content_warning: boolean;
          content_warning_label: string | null;
          status: string;
          featured: boolean;
          view_count: number;
          read_count: number;
          mission_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          author_id: string;
          title: string;
          body: string;
          excerpt?: string;
          category: string;
          mood: string;
          tags?: string[];
          truth_type?: string;
          location_visibility?: string;
          city?: string | null;
          state?: string | null;
          content_warning?: boolean;
          content_warning_label?: string | null;
          status?: string;
          featured?: boolean;
          view_count?: number;
          read_count?: number;
          mission_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          body?: string;
          excerpt?: string;
          category?: string;
          mood?: string;
          tags?: string[];
          truth_type?: string;
          location_visibility?: string;
          city?: string | null;
          state?: string | null;
          content_warning?: boolean;
          content_warning_label?: string | null;
          status?: string;
          featured?: boolean;
          view_count?: number;
          read_count?: number;
          mission_id?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      story_reactions: {
        Row: {
          id: string;
          story_id: string;
          user_id: string;
          reaction_type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          story_id: string;
          user_id: string;
          reaction_type: string;
          created_at?: string;
        };
        Update: {
          reaction_type?: string;
        };
        Relationships: [];
      };
      story_reviews: {
        Row: {
          id: string;
          story_id: string;
          reviewer_id: string;
          rating: number;
          writing_score: number;
          honesty_score: number;
          emotion_score: number;
          impact_score: number;
          entertainment_score: number;
          review_text: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          story_id: string;
          reviewer_id: string;
          rating: number;
          writing_score?: number;
          honesty_score?: number;
          emotion_score?: number;
          impact_score?: number;
          entertainment_score?: number;
          review_text?: string | null;
          created_at?: string;
        };
        Update: {
          rating?: number;
          writing_score?: number;
          honesty_score?: number;
          emotion_score?: number;
          impact_score?: number;
          entertainment_score?: number;
          review_text?: string | null;
        };
        Relationships: [];
      };
      bookmarks: {
        Row: { id: string; user_id: string; story_id: string; created_at: string };
        Insert: { id?: string; user_id: string; story_id: string; created_at?: string };
        Update: { id?: string };
        Relationships: [];
      };
      follows: {
        Row: {
          id: string;
          follower_id: string;
          followed_profile_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          follower_id: string;
          followed_profile_id: string;
          created_at?: string;
        };
        Update: { id?: string };
        Relationships: [];
      };
      missions: {
        Row: {
          id: string;
          title: string;
          description: string;
          category: string;
          difficulty: string;
          prompt: string;
          reward_badge: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          category: string;
          difficulty?: string;
          prompt?: string;
          reward_badge?: string | null;
          created_at?: string;
        };
        Update: {
          title?: string;
          description?: string;
          category?: string;
          difficulty?: string;
          prompt?: string;
          reward_badge?: string | null;
        };
        Relationships: [];
      };
      user_missions: {
        Row: {
          id: string;
          user_id: string;
          mission_id: string;
          status: string;
          completed_story_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          mission_id: string;
          status?: string;
          completed_story_id?: string | null;
          created_at?: string;
        };
        Update: {
          status?: string;
          completed_story_id?: string | null;
        };
        Relationships: [];
      };
      reports: {
        Row: {
          id: string;
          reporter_id: string;
          content_type: string;
          content_id: string;
          reason: string;
          details: string | null;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          reporter_id: string;
          content_type: string;
          content_id: string;
          reason: string;
          details?: string | null;
          status?: string;
          created_at?: string;
        };
        Update: {
          status?: string;
          details?: string | null;
        };
        Relationships: [];
      };
      badges: {
        Row: {
          id: string;
          name: string;
          description: string;
          icon: string;
          requirement_type: string;
          threshold: number | null;
          accent: string;
        };
        Insert: {
          id: string;
          name: string;
          description: string;
          icon: string;
          requirement_type: string;
          threshold?: number | null;
          accent?: string;
        };
        Update: {
          name?: string;
          description?: string;
          icon?: string;
          requirement_type?: string;
          threshold?: number | null;
          accent?: string;
        };
        Relationships: [];
      };
      user_badges: {
        Row: { id: string; user_id: string; badge_id: string; earned_at: string };
        Insert: { id?: string; user_id: string; badge_id: string; earned_at?: string };
        Update: { id?: string };
        Relationships: [];
      };
    };
    Views: {
      profile_public: {
        Row: {
          id: string;
          anonymous_name: string;
          avatar_style: string;
          bio: string | null;
          created_at: string;
          stories: number;
          total_views: number;
          total_reads: number;
          total_reviews: number;
          average_rating: number;
          followers: number;
        };
        Relationships: [];
      };
    };
    Functions: { [key: string]: never };
    Enums: { [key: string]: never };
    CompositeTypes: { [key: string]: never };
  };
}
