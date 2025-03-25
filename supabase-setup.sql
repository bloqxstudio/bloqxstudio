
-- Create components table
CREATE TABLE IF NOT EXISTS public.components (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    json_code TEXT NOT NULL,
    preview_image TEXT,
    tags TEXT[] DEFAULT '{}'::TEXT[],
    type TEXT NOT NULL,
    visibility TEXT NOT NULL DEFAULT 'public',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    created_by UUID NOT NULL REFERENCES auth.users(id)
);

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Create policies for components table
-- Admin users can do everything
CREATE POLICY "Admin users have full access to components" 
ON public.components
FOR ALL
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Regular users can only read public components
CREATE POLICY "Users can view public components" 
ON public.components
FOR SELECT
TO authenticated
USING (visibility = 'public');

-- Users can view their own components
CREATE POLICY "Users can view their own components" 
ON public.components
FOR SELECT
TO authenticated
USING (created_by = auth.uid());

-- Create policies for categories table
-- Everyone can read categories
CREATE POLICY "Everyone can read categories" 
ON public.categories
FOR SELECT
TO authenticated
USING (true);

-- Only admins can modify categories
CREATE POLICY "Only admins can modify categories" 
ON public.categories
FOR ALL
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Create storage bucket for component images
INSERT INTO storage.buckets (id, name, public) VALUES ('component-images', 'component-images', true);

-- Create policy to allow authenticated users to read component images
CREATE POLICY "Anyone can read component images"
ON storage.objects FOR SELECT
USING (bucket_id = 'component-images');

-- Create policy to allow only admins to upload component images
CREATE POLICY "Only admins can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'component-images' AND
    auth.jwt() ->> 'role' = 'admin'
);

-- Create policy to allow only admins to update/delete component images
CREATE POLICY "Only admins can update/delete images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'component-images' AND
    auth.jwt() ->> 'role' = 'admin'
);

-- Function to handle user role management (to be called from Dashboard UI)
CREATE OR REPLACE FUNCTION public.set_user_role(user_id UUID, role TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE auth.users
  SET raw_user_meta_data = 
    CASE
      WHEN raw_user_meta_data IS NULL THEN jsonb_build_object('role', role)
      ELSE jsonb_set(raw_user_meta_data, '{role}', to_jsonb(role))
    END
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users (Restrict this in production by creating a service role)
GRANT EXECUTE ON FUNCTION public.set_user_role TO authenticated;
