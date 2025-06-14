
import { supabase } from './client';
import { Component, NewComponent } from '@/core/types/database';

// Component operations
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

export const createComponent = async (component: NewComponent) => {
  const { data, error } = await supabase
    .from('components')
    .insert([component])
    .select()
    .single();
  
  if (error) throw error;
  return data as Component;
};

export const updateComponent = async (id: string, updates: Partial<NewComponent>) => {
  const { data, error } = await supabase
    .from('components')
    .update(updates)
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

// Upload preview image
export const uploadComponentImage = async (file: File, path: string) => {
  console.log('Enviando imagem:', file.name, 'para o caminho:', path);
  
  const { data, error } = await supabase.storage
    .from('component-images')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (error) {
    console.error('Erro ao enviar imagem:', error);
    throw error;
  }
  
  console.log('Envio bem-sucedido:', data);
  
  const { data: { publicUrl } } = supabase.storage
    .from('component-images')
    .getPublicUrl(path);
  
  console.log('URL pública:', publicUrl);  
  return publicUrl;
};
