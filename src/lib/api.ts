
import { supabase } from './supabase';
import { NewComponent, UpdateComponent, Component, Category, NewCategory } from './database.types';

// Component CRUD operations
export const getComponents = async () => {
  const { data, error } = await supabase
    .from('components')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as Component[];
};

export const getComponentById = async (id: string) => {
  const { data, error } = await supabase
    .from('components')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data as Component;
};

export const getComponentsByCategory = async (categoryId: string) => {
  const { data, error } = await supabase
    .from('components')
    .select('*')
    .eq('category', categoryId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as Component[];
};

export const createComponent = async (component: NewComponent) => {
  const { data, error } = await supabase
    .from('components')
    .insert([component])
    .select()
    .single();
  
  if (error) throw error;
  return data as Component;
};

export const updateComponent = async (id: string, updates: UpdateComponent) => {
  const { data, error } = await supabase
    .from('components')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as Component;
};

export const deleteComponent = async (id: string) => {
  const { error } = await supabase
    .from('components')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
};

// Category operations
export const getCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });
  
  if (error) throw error;
  return data as Category[];
};

export const createCategory = async (category: NewCategory) => {
  const { data, error } = await supabase
    .from('categories')
    .insert([category])
    .select()
    .single();
  
  if (error) throw error;
  return data as Category;
};

// Upload preview image
export const uploadComponentImage = async (file: File, path: string) => {
  const { data, error } = await supabase.storage
    .from('component-images')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage
    .from('component-images')
    .getPublicUrl(path);
    
  return publicUrl;
};
