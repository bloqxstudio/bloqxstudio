
-- Create table for WordPress site connections
CREATE TABLE public.wordpress_sites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  site_url TEXT NOT NULL,
  site_name TEXT,
  api_key TEXT NOT NULL,
  wordpress_version TEXT,
  elementor_active BOOLEAN DEFAULT false,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, site_url)
);

-- Add Row Level Security (RLS)
ALTER TABLE public.wordpress_sites ENABLE ROW LEVEL SECURITY;

-- Create policies for wordpress_sites
CREATE POLICY "Users can view their own WordPress sites" 
  ON public.wordpress_sites 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own WordPress connections" 
  ON public.wordpress_sites 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own WordPress sites" 
  ON public.wordpress_sites 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own WordPress sites" 
  ON public.wordpress_sites 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create table for component sync history
CREATE TABLE public.component_syncs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wordpress_site_id UUID REFERENCES public.wordpress_sites(id) ON DELETE CASCADE,
  component_id UUID REFERENCES public.components(id) ON DELETE CASCADE,
  sync_type TEXT NOT NULL CHECK (sync_type IN ('download', 'preview', 'import')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS for component_syncs
ALTER TABLE public.component_syncs ENABLE ROW LEVEL SECURITY;

-- Create policies for component_syncs
CREATE POLICY "Users can view syncs for their WordPress sites" 
  ON public.component_syncs 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.wordpress_sites ws 
      WHERE ws.id = component_syncs.wordpress_site_id 
      AND ws.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create syncs for their WordPress sites" 
  ON public.component_syncs 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.wordpress_sites ws 
      WHERE ws.id = component_syncs.wordpress_site_id 
      AND ws.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_wordpress_sites_user_id ON public.wordpress_sites(user_id);
CREATE INDEX idx_wordpress_sites_active ON public.wordpress_sites(is_active) WHERE is_active = true;
CREATE INDEX idx_component_syncs_site_id ON public.component_syncs(wordpress_site_id);
CREATE INDEX idx_component_syncs_component_id ON public.component_syncs(component_id);
CREATE INDEX idx_component_syncs_created_at ON public.component_syncs(created_at DESC);
