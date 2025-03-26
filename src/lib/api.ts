import { supabase } from '@/integrations/supabase/client';
import { Component, UpdateComponent, NewComponent, Category, UpdateCategory, NewCategory } from '@/lib/database.types';
import { toast } from 'sonner';

// Component CRUD operations
export const getComponents = async () => {
  console.log('Buscando componentes do banco de dados...');
  
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Erro ao buscar dados do usuário:', userError);
    }
    
    // Verificar se o usuário é admin através dos metadados
    const isAdmin = userData?.user?.user_metadata?.role === 'admin';
    console.log('Dados do usuário:', userData?.user);
    console.log('É admin:', isAdmin);
    
    // Se o usuário for admin, obter todos os componentes; caso contrário, apenas obter os públicos
    let query = supabase.from('components').select('*');
    
    // Sempre buscamos componentes públicos, esteja o usuário logado ou não
    if (!isAdmin) {
      query = query.eq('visibility', 'public');
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erro ao buscar componentes:', error);
      toast.error('Erro ao carregar componentes. Tente novamente mais tarde.');
      return [];
    }
    
    console.log('Componentes carregados com sucesso:', data?.length || 0, 'componentes');
    return data as Component[] || [];
  } catch (error) {
    console.error('Erro inesperado em getComponents:', error);
    toast.error('Falha ao conectar com o banco de dados. Tente novamente mais tarde.');
    // Retornar um array vazio em vez de lançar um erro para evitar que o app trave
    return [] as Component[];
  }
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
  console.log('Criando componente com dados:', component);
  
  try {
    const { data, error } = await supabase
      .from('components')
      .insert([component])
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao criar componente (Supabase error):', error);
      throw error;
    }
    
    console.log('Componente criado com sucesso:', data);
    return data as Component;
  } catch (error) {
    console.error('Erro na função createComponent:', error);
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

// Função para atualizar perfil do usuário
export const updateUserProfile = async (userId: string, updates: {
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
}) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    throw error;
  }
};

// Função para obter o perfil do usuário
export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) {
      // Se o perfil não existir, não é necessariamente um erro crítico
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    throw error;
  }
};
