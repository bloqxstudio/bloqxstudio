
import { supabase } from '@/integrations/supabase/client';
import { Component, NewComponent, UpdateComponent } from '@/core/types/database';
import { syncWordPressSiteCategories } from '@/core/api/wordpress-categories';

export const getComponents = async (): Promise<Component[]> => {
  try {
    const { data, error } = await supabase
      .from('components')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Auto-sync categories if we have WordPress components without category info
    const wpComponentsWithoutCategories = (data || []).filter(
      component => component.source === 'wordpress' && 
      component.wordpress_site_id && 
      !component.wordpress_category_id
    );

    if (wpComponentsWithoutCategories.length > 0) {
      console.log('Found WordPress components without category info, triggering sync...');
      // Get unique site IDs
      const siteIds = [...new Set(wpComponentsWithoutCategories.map(c => c.wordpress_site_id))];
      
      // Sync categories for these sites (don't await to avoid blocking)
      siteIds.forEach(siteId => {
        if (siteId) {
          syncWordPressSiteCategories(siteId).catch(error => 
            console.warn('Background category sync failed:', error)
          );
        }
      });
    }

    return data as Component[] || [];
  } catch (error) {
    console.error('Error fetching components:', error);
    throw error;
  }
};

export const getComponent = async (id: string): Promise<Component> => {
  try {
    const { data, error } = await supabase
      .from('components')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Component;
  } catch (error) {
    console.error('Error fetching component:', error);
    throw error;
  }
};

export const createComponent = async (component: NewComponent): Promise<Component> => {
  try {
    const { data, error } = await supabase
      .from('components')
      .insert(component)
      .select()
      .single();

    if (error) throw error;
    return data as Component;
  } catch (error) {
    console.error('Error creating component:', error);
    throw error;
  }
};

export const updateComponent = async (id: string, updates: UpdateComponent): Promise<Component> => {
  try {
    const { data, error } = await supabase
      .from('components')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Component;
  } catch (error) {
    console.error('Error updating component:', error);
    throw error;
  }
};

export const deleteComponent = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('components')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting component:', error);
    throw error;
  }
};
