
import { supabase } from '@/integrations/supabase/client';
import { Component, UpdateComponent, NewComponent, Category, UpdateCategory, NewCategory } from '@/lib/database.types';

// Component CRUD operations
export const getComponents = async () => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  
  // Verificar se o usuário é admin através dos metadados
  const isAdmin = userData?.user?.user_metadata?.role === 'admin';
  console.log('User data:', userData?.user);
  console.log('Is admin:', isAdmin);
  
  // If the user is an admin, get all components; otherwise, only get public ones
  let query = supabase.from('components').select('*');
  
  if (!isAdmin) {
    query = query.eq('visibility', 'public');
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching components:', error);
    throw error;
  }
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
  const { data: userData, error: userError } = await supabase.auth.getUser();
  
  // Verificar se o usuário é admin através dos metadados
  const isAdmin = userData?.user?.user_metadata?.role === 'admin';
  
  let query = supabase.from('components')
    .select('*')
    .eq('category', categoryId);
  
  if (!isAdmin) {
    query = query.eq('visibility', 'public');
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as Component[];
};

export const createComponent = async (component: NewComponent) => {
  console.log('Creating component with data:', component);
  
  try {
    const { data, error } = await supabase
      .from('components')
      .insert([component])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating component (Supabase error):', error);
      throw error;
    }
    
    console.log('Component created successfully:', data);
    return data as Component;
  } catch (error) {
    console.error('Error in createComponent function:', error);
    throw error;
  }
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
  console.log('Uploading image:', file.name, 'to path:', path);
  
  const { data, error } = await supabase.storage
    .from('component-images')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
  
  console.log('Upload successful:', data);
  
  const { data: { publicUrl } } = supabase.storage
    .from('component-images')
    .getPublicUrl(path);
  
  console.log('Public URL:', publicUrl);  
  return publicUrl;
};

// User management operations
export const getUserRole = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data?.role || 'user';
};

export const updateUserRole = async (userId: string, role: 'admin' | 'user') => {
  const { error } = await supabase
    .from('profiles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) throw error;
  return true;
};

export const getUsers = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// Admin dashboard operations
export const getComponentStats = async () => {
  const { data: components, error: componentsError } = await supabase
    .from('components')
    .select('*');

  if (componentsError) throw componentsError;

  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('*');

  if (categoriesError) throw categoriesError;

  return {
    totalComponents: components?.length || 0,
    totalCategories: categories?.length || 0,
    publicComponents: components?.filter(c => c.visibility === 'public').length || 0,
    privateComponents: components?.filter(c => c.visibility === 'private').length || 0
  };
};
