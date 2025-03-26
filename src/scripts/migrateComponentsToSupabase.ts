
import { supabase } from '@/integrations/supabase/client';
import { components } from '@/lib/data';

export const migrateComponentsToSupabase = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('No authenticated user found. Please sign in as an admin to migrate components.');
    return false;
  }
  
  try {
    console.log('Starting migration of sample components to Supabase...');
    
    // Check for existing components
    const { data: existingComponents } = await supabase
      .from('components')
      .select('id');
    
    if (existingComponents && existingComponents.length > 0) {
      console.log('Components already exist in the database. Skipping migration.');
      return true;
    }
    
    // Prepare components for insertion
    const componentsToInsert = components.map(component => ({
      title: component.title,
      description: component.description,
      category: component.category,
      code: component.jsonCode,
      json_code: component.jsonCode,
      preview_image: component.previewImage,
      tags: component.tags,
      type: component.type,
      visibility: 'public',
      created_by: user.id
    }));
    
    // Insert all components
    const { data, error } = await supabase
      .from('components')
      .insert(componentsToInsert);
    
    if (error) {
      console.error('Error migrating components:', error);
      return false;
    }
    
    console.log('Successfully migrated components to Supabase!');
    return true;
  } catch (error) {
    console.error('Error in migration process:', error);
    return false;
  }
};

// Helper function to run migration if needed
export const checkAndMigrateComponents = async () => {
  // Check if components need to be migrated
  const { data, error } = await supabase
    .from('components')
    .select('count', { count: 'exact' });
  
  if (error) {
    console.error('Error checking components count:', error);
    return;
  }
  
  // If no components exist, run migration
  const componentCount = data ? (data as any).count || 0 : 0;
  
  if (componentCount === 0) {
    console.log('No components found in database. Running migration...');
    await migrateComponentsToSupabase();
  } else {
    console.log(`Found ${componentCount} components in database. No migration needed.`);
  }
};
