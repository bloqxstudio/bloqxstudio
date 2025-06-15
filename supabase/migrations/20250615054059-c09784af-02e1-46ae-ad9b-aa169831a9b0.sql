
-- Create table for WordPress categories from connected sites
CREATE TABLE public.wordpress_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wordpress_site_id UUID REFERENCES public.wordpress_sites(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL, -- WordPress category ID
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  post_count INTEGER DEFAULT 0,
  last_sync_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(wordpress_site_id, category_id)
);

-- Add Row Level Security (RLS)
ALTER TABLE public.wordpress_categories ENABLE ROW LEVEL SECURITY;

-- Create policies for wordpress_categories
CREATE POLICY "Users can view categories for their WordPress sites" 
  ON public.wordpress_categories 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.wordpress_sites ws 
      WHERE ws.id = wordpress_categories.wordpress_site_id 
      AND ws.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage categories for their WordPress sites" 
  ON public.wordpress_categories 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.wordpress_sites ws 
      WHERE ws.id = wordpress_categories.wordpress_site_id 
      AND ws.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_wordpress_categories_site_id ON public.wordpress_categories(wordpress_site_id);
CREATE INDEX idx_wordpress_categories_slug ON public.wordpress_categories(slug);
CREATE INDEX idx_wordpress_categories_sync ON public.wordpress_categories(last_sync_at DESC);

-- Add a field to components table to store WordPress category info
ALTER TABLE public.components 
ADD COLUMN wordpress_category_id INTEGER,
ADD COLUMN wordpress_category_name TEXT;
