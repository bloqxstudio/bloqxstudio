
export interface Component {
  id: string;
  title: string;
  description?: string;
  category: string;
  code: string;
  json_code?: string;
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
  email: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

export type Database = {
  public: {
    Tables: {
      components: {
        Row: Component;
        Insert: Omit<Component, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Component, 'id' | 'created_at' | 'updated_at'>>;
      };
      categories: {
        Row: Category;
        Insert: Omit<Category, 'id' | 'created_at'>;
        Update: Partial<Omit<Category, 'id' | 'created_at'>>;
      };
      profiles: {
        Row: User;
        Insert: Omit<User, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
};
