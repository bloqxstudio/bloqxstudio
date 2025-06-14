
import { supabase } from '@/integrations/supabase/client';
import { Component, NewComponent, UpdateComponent } from '@/core/types';

export const getComponents = async (): Promise<Component[]> => {
  const { data, error } = await supabase
    .from('components')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching components:', error);
    throw error;
  }

  return (data || []).map(item => ({
    ...item,
    visibility: item.visibility as 'public' | 'private',
    alignment: item.alignment as 'left' | 'center' | 'right' | 'full' | undefined,
    columns: item.columns as '1' | '2' | '3+' | undefined,
    elements: item.elements as ('button' | 'video' | 'image' | 'list' | 'heading')[] | undefined
  }));
};

export const getComponentById = async (id: string): Promise<Component | null> => {
  const { data, error } = await supabase
    .from('components')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching component:', error);
    throw error;
  }

  return {
    ...data,
    visibility: data.visibility as 'public' | 'private',
    alignment: data.alignment as 'left' | 'center' | 'right' | 'full' | undefined,
    columns: data.columns as '1' | '2' | '3+' | undefined,
    elements: data.elements as ('button' | 'video' | 'image' | 'list' | 'heading')[] | undefined
  };
};

export const uploadComponentImage = async (file: File, path: string): Promise<string> => {
  const { data, error } = await supabase.storage
    .from('component-images')
    .upload(path, file);

  if (error) {
    console.error('Error uploading image:', error);
    throw error;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('component-images')
    .getPublicUrl(data.path);

  return publicUrl;
};

export const createComponent = async (componentData: any): Promise<Component> => {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const componentPayload: NewComponent = {
    title: componentData.title,
    description: componentData.description || '',
    category: componentData.category || 'general',
    code: componentData.code,
    json_code: componentData.json_code,
    preview_image: componentData.preview_image,
    tags: componentData.tags || [],
    type: componentData.type || 'elementor',
    visibility: componentData.visibility,
    created_by: user.id,
    alignment: componentData.alignment,
    columns: componentData.columns,
    elements: componentData.elements || [],
  };

  const { data, error } = await supabase
    .from('components')
    .insert(componentPayload)
    .select()
    .single();

  if (error) {
    console.error('Error creating component:', error);
    throw error;
  }

  return {
    ...data,
    visibility: data.visibility as 'public' | 'private',
    alignment: data.alignment as 'left' | 'center' | 'right' | 'full' | undefined,
    columns: data.columns as '1' | '2' | '3+' | undefined,
    elements: data.elements as ('button' | 'video' | 'image' | 'list' | 'heading')[] | undefined
  };
};

export const updateComponent = async (id: string, componentData: FormData): Promise<Component> => {
  // Extract form data
  const title = componentData.get('title') as string;
  const tags = JSON.parse(componentData.get('tags') as string || '[]');
  const jsonCode = componentData.get('jsonCode') as string;
  const visibility = componentData.get('visibility') as 'public' | 'private';
  const alignment = componentData.get('alignment') as string;
  const columns = componentData.get('columns') as string;
  const elements = JSON.parse(componentData.get('elements') as string || '[]');

  const componentPayload: UpdateComponent = {
    title,
    tags,
    code: jsonCode,
    json_code: jsonCode,
    visibility,
    alignment: alignment as 'left' | 'center' | 'right' | 'full' | undefined,
    columns: columns as '1' | '2' | '3+' | undefined,
    elements,
  };

  const { data, error } = await supabase
    .from('components')
    .update(componentPayload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating component:', error);
    throw error;
  }

  return {
    ...data,
    visibility: data.visibility as 'public' | 'private',
    alignment: data.alignment as 'left' | 'center' | 'right' | 'full' | undefined,
    columns: data.columns as '1' | '2' | '3+' | undefined,
    elements: data.elements as ('button' | 'video' | 'image' | 'list' | 'heading')[] | undefined
  };
};

export const deleteComponent = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('components')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting component:', error);
    throw error;
  }
};
