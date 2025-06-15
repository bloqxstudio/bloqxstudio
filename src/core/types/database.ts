
// Unified database types - Single source of truth

export interface Component {
  id: string;
  title: string;
  description: string; // Required field
  category: string;
  code: string;
  json_code?: string;
  content?: string; // HTML content for style extraction
  preview_image?: string;
  tags?: string[];
  type?: string;
  visibility: 'public' | 'private';
  created_at: string;
  updated_at: string;
  created_by: string;
  alignment?: 'left' | 'center' | 'right' | 'full';
  columns?: '1' | '2' | '3+';
  elements?: ('button' | 'video' | 'image' | 'list' | 'heading')[];
  source?: 'local' | 'wordpress'; // Add source property to the base Component type
  source_site?: string;
  wordpress_site_id?: string;
  slug?: string; // WordPress post slug for URL construction
  wordpress_category_id?: number;
  wordpress_category_name?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string | null;
  first_name?: string | null;
  last_name?: string | null;
  avatar_url?: string | null;
  role: string | null;
  created_at: string;
  updated_at: string;
}

// Database operation types
export type NewComponent = Omit<Component, 'id' | 'created_at' | 'updated_at'>;
export type UpdateComponent = Partial<Omit<Component, 'id' | 'created_at' | 'updated_at'>>;
export type NewCategory = Omit<Category, 'id' | 'created_at'>;
export type UpdateCategory = Partial<Omit<Category, 'id' | 'created_at'>>;
export type NewUser = Omit<User, 'created_at' | 'updated_at'>;
export type UpdateUser = Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>;

// Supabase database schema type
export type Database = {
  public: {
    Tables: {
      components: {
        Row: Component;
        Insert: NewComponent;
        Update: UpdateComponent;
      };
      categories: {
        Row: Category;
        Insert: NewCategory;
        Update: UpdateCategory;
      };
      profiles: {
        Row: User;
        Insert: NewUser;
        Update: UpdateUser;
      };
    };
  };
};
