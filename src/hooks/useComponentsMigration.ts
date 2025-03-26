
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { checkAndMigrateComponents } from '@/scripts/migrateComponentsToSupabase';

export const useComponentsMigration = () => {
  const { isAdmin, user } = useAuth();
  const [migrationRun, setMigrationRun] = useState(false);

  useEffect(() => {
    if (user && isAdmin && !migrationRun) {
      // Check database for components and migrate if needed
      const runMigration = async () => {
        try {
          await checkAndMigrateComponents();
          setMigrationRun(true);
        } catch (error) {
          console.error('Error running component migration:', error);
        }
      };
      
      runMigration();
    }
  }, [user, isAdmin, migrationRun]);

  return { migrationRun };
};
