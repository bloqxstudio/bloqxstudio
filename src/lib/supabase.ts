
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if the required environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing Supabase environment variables. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.'
  );
}

// Create a temporary placeholder client if we're in development and missing env vars
const createSupabaseClient = () => {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      if (import.meta.env.DEV) {
        console.warn('Using mock Supabase client for development. Authentication and database operations will not work.');
        // Return a mock client for development that won't throw immediate errors
        return {
          auth: {
            getSession: () => Promise.resolve({ data: { session: null } }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
            signInWithPassword: () => Promise.resolve({ error: new Error('Supabase not configured') }),
            signUp: () => Promise.resolve({ error: new Error('Supabase not configured') }),
            signOut: () => Promise.resolve()
          },
          from: () => ({
            select: () => ({ data: [], error: null }),
            insert: () => ({ data: null, error: new Error('Supabase not configured') }),
            update: () => ({ data: null, error: new Error('Supabase not configured') }),
            delete: () => ({ error: new Error('Supabase not configured') })
          }),
          storage: {
            from: () => ({
              upload: () => ({ data: null, error: new Error('Supabase not configured') }),
              getPublicUrl: () => ({ data: { publicUrl: '' } })
            })
          }
        } as any;
      }
      // In production, we should still throw an error
      throw new Error('Supabase URL and Anon Key are required');
    }
    
    // Create the real client if we have the environment variables
    return createClient<Database>(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error('Error initializing Supabase client:', error);
    throw error;
  }
};

export const supabase = createSupabaseClient();

// Helper to check if a user is an admin
export const isUserAdmin = (user: any) => {
  return user?.user_metadata?.role === 'admin';
};
