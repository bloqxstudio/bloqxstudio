
import { supabase } from '@/integrations/supabase/client';
import { Component, UpdateComponent, NewComponent } from '@/lib/database.types';
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
    
    // Always show public components to all users (logged in or not)
    let query = supabase.from('components').select('*').eq('visibility', 'public');
    
    // If the user is logged in, also show their own private components
    if (userData?.user) {
      // For admins, show all components
      if (isAdmin) {
        query = supabase.from('components').select('*');
      } else {
        // For regular users, show public components and their own private components
        query = supabase.from('components').select('*')
          .or(`visibility.eq.public,created_by.eq.${userData.user.id}`);
      }
    }
    
    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(50); // Limitar número de resultados para melhorar performance
    
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

export const getUserComponents = async (userId: string) => {
  console.log('Buscando componentes do usuário:', userId);
  
  try {
    const { data, error } = await supabase
      .from('components')
      .select('*')
      .eq('created_by', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erro ao buscar componentes do usuário:', error);
      toast.error('Erro ao carregar seus componentes. Tente novamente mais tarde.');
      return [];
    }
    
    console.log('Componentes do usuário carregados:', data?.length || 0, 'componentes');
    return data as Component[] || [];
  } catch (error) {
    console.error('Erro inesperado em getUserComponents:', error);
    toast.error('Falha ao conectar com o banco de dados. Tente novamente mais tarde.');
    return [] as Component[];
  }
};

export const getComponentById = async (id: string) => {
  try {
    // Adicionar timeout para evitar problemas de performance
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos timeout
    
    const { data, error } = await supabase
      .from('components')
      .select('*')
      .eq('id', id)
      .single();
    
    clearTimeout(timeoutId); // Limpar timeout se requisição completar antes
    
    if (error) {
      console.error('Erro ao obter componente por ID:', error);
      throw error;
    }
    
    return data as Component;
  } catch (error) {
    console.error('Erro ao buscar componente:', error);
    throw error;
  }
};

export const getComponentsByCategory = async (categoryId: string) => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  
  // Verificar se o usuário é admin através dos metadados
  const isAdmin = userData?.user?.user_metadata?.role === 'admin';
  
  let query = supabase.from('components')
    .select('*')
    .eq('category', categoryId);
  
  // Para usuários não logados ou não admin, mostrar apenas componentes públicos ou criados pelo usuário
  if (!isAdmin && userData?.user) {
    query = query.or(`visibility.eq.public,created_by.eq.${userData.user.id}`);
  } else if (!userData?.user) {
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
  // Primeiro, verificar se o usuário tem permissão para editar este componente
  const { data: userData } = await supabase.auth.getUser();
  
  if (!userData.user) {
    throw new Error('Usuário não autenticado');
  }
  
  // Verificar se o usuário é admin
  const isAdmin = userData?.user?.user_metadata?.role === 'admin';
  
  // Obter o componente atual
  const { data: currentComponent, error: getError } = await supabase
    .from('components')
    .select('*')
    .eq('id', id)
    .single();
  
  if (getError) {
    throw getError;
  }
  
  // Verificar se o usuário é o criador do componente ou um admin
  if (!isAdmin && currentComponent.created_by !== userData.user.id) {
    throw new Error('Você não tem permissão para editar este componente');
  }
  
  // Se for um usuário normal (não admin), limitar quais campos podem ser atualizados
  let updatesToApply = updates;
  if (!isAdmin) {
    // Usuários normais só podem atualizar título, descrição, categoria e visibilidade
    updatesToApply = {
      title: updates.title,
      description: updates.description,
      category: updates.category,
      visibility: updates.visibility,
      updated_at: new Date().toISOString()
    };
  } else {
    // Administradores podem atualizar todos os campos
    updatesToApply = { ...updates, updated_at: new Date().toISOString() };
  }
  
  // Aplicar as atualizações
  const { data, error } = await supabase
    .from('components')
    .update(updatesToApply)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as Component;
};

export const deleteComponent = async (id: string) => {
  // Primeiro, verificar se o usuário tem permissão para excluir este componente
  const { data: userData } = await supabase.auth.getUser();
  
  if (!userData.user) {
    throw new Error('Usuário não autenticado');
  }
  
  // Verificar se o usuário é admin
  const isAdmin = userData?.user?.user_metadata?.role === 'admin';
  
  if (!isAdmin) {
    // Se não for admin, verificar se o usuário é o criador do componente
    const { data: currentComponent, error: getError } = await supabase
      .from('components')
      .select('created_by')
      .eq('id', id)
      .single();
    
    if (getError) {
      throw getError;
    }
    
    if (currentComponent.created_by !== userData.user.id) {
      throw new Error('Você não tem permissão para excluir este componente');
    }
  }
  
  // Excluir o componente
  const { error } = await supabase
    .from('components')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
};

// Get component statistics for admin dashboard
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
