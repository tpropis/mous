/**
 * Supabase database types.
 * Hand-authored to match `supabase/schema.sql`. In a real project these are
 * generated with `supabase gen types typescript`. Kept intentionally close to
 * the CLI output shape so regeneration is a drop-in replacement.
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
          avatar_style: string;
          bio?: string | null;
          is_admin?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
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
        Update: Partial<Database["public"]["Tables"]["stories"]["Insert"]>;
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
        Update: Partial<Database["public"]["Tables"]["story_reactions"]["Insert"]>;
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
        Insert: Omit<
          Database["public"]["Tables"]["story_reviews"]["Row"],
          "id" | "created_at"
        > & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["story_reviews"]["Insert"]>;
        Relationships: [];
      };
      bookmarks: {
        Row: { id: string; user_id: string; story_id: string; created_at: string };
        Insert: {
          id?: string;
          user_id: string;
          story_id: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["bookmarks"]["Insert"]>;
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
        Update: Partial<Database["public"]["Tables"]["follows"]["Insert"]>;
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
        Insert: Omit<
          Database["public"]["Tables"]["missions"]["Row"],
          "id" | "created_at"
        > & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["missions"]["Insert"]>;
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
        Insert: Omit<
          Database["public"]["Tables"]["user_missions"]["Row"],
          "id" | "created_at"
        > & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["user_missions"]["Insert"]>;
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
        Insert: Omit<
          Database["public"]["Tables"]["reports"]["Row"],
          "id" | "created_at" | "status"
        > & { id?: string; created_at?: string; status?: string };
        Update: Partial<Database["public"]["Tables"]["reports"]["Insert"]>;
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
        Insert: Database["public"]["Tables"]["badges"]["Row"];
        Update: Partial<Database["public"]["Tables"]["badges"]["Row"]>;
        Relationships: [];
      };
      user_badges: {
        Row: {
          id: string;
          user_id: string;
          badge_id: string;
          earned_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          badge_id: string;
          earned_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_badges"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: { [key: string]: never };
    Functions: { [key: string]: never };
    Enums: { [key: string]: never };
    CompositeTypes: { [key: string]: never };
  };
}
