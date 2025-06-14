
import { supabase } from '@/integrations/supabase/client';
import { Component } from '@/core/types/database';

export const getComponents = async (): Promise<Component[]> => {
  const { data, error } = await supabase
    .from('components')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching components:', error);
    throw error;
  }

  return data || [];
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

  return data;
};

export const createComponent = async (componentData: FormData): Promise<Component> => {
  // Extract form data
  const title = componentData.get('title') as string;
  const tags = JSON.parse(componentData.get('tags') as string || '[]');
  const jsonCode = componentData.get('jsonCode') as string;
  const visibility = componentData.get('visibility') as 'public' | 'private';
  const alignment = componentData.get('alignment') as string;
  const columns = componentData.get('columns') as string;
  const elements = JSON.parse(componentData.get('elements') as string || '[]');
  const category = componentData.get('category') as string || 'general';
  const description = componentData.get('description') as string || '';

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const componentPayload = {
    title,
    tags,
    code: jsonCode,
    json_code: jsonCode,
    visibility,
    alignment,
    columns,
    elements,
    category,
    description,
    created_by: user.id,
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

  return data;
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

  const componentPayload = {
    title,
    tags,
    code: jsonCode,
    json_code: jsonCode,
    visibility,
    alignment,
    columns,
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

  return data;
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
