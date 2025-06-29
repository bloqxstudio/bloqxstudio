
import { supabase } from '@/integrations/supabase/client';
import { User, UpdateUser } from '@/core/types';
import { toast } from 'sonner';

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

export const getUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as User[];
};

// Função para atualizar perfil do usuário
export const updateUserProfile = async (userId: string, updates: UpdateUser): Promise<User> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
      
    if (error) throw error;
    return data as User;
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    throw error;
  }
};

// Função para obter o perfil do usuário
export const getUserProfile = async (userId: string): Promise<User | null> => {
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
    return data as User;
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    throw error;
  }
};
