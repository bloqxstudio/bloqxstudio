// Central type exports - Single source of truth for all types
export * from './database';
export * from './api';
export * from './forms';

export interface Component {
  id: string;
  title: string;
  description?: string;
  category: string;
  code: string;
  json_code?: string;
  preview_image?: string;
  tags?: string[];
  type: 'elementor' | 'custom';
  visibility: 'public' | 'private';
  created_at: string;
  updated_at: string;
  created_by: string;
  source?: 'local' | 'wordpress';
  source_site?: string;
  wordpress_site_id?: string;
  slug?: string;
  alignment?: 'left' | 'center' | 'right' | 'full';
  columns?: '1' | '2' | '3+';
  elements?: ('button' | 'video' | 'image' | 'list' | 'heading')[];
  content?: string;
  // New WordPress category fields
  wordpress_category_id?: number;
  wordpress_category_name?: string;
}
