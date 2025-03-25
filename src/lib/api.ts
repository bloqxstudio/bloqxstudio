
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

// Update Components.tsx to use API
<lov-write file_path="src/pages/Components.tsx">
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import ComponentCard from '@/components/ComponentCard';
import { 
  Button,
  Card,
  CardContent
} from '@/components/ui';
import { PlusCircle, Filter, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getComponents, getCategories } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const Components = () => {
  const { isAdmin } = useAuth();
  const [filter, setFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Fetch components
  const { data: components = [], isLoading } = useQuery({
    queryKey: ['components'],
    queryFn: getComponents
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories
  });

  // Filter components based on search term and category
  const filteredComponents = components.filter(component => {
    const matchesSearch = component.title.toLowerCase().includes(filter.toLowerCase()) ||
      (component.description || '').toLowerCase().includes(filter.toLowerCase()) ||
      (component.tags || []).some(tag => tag.toLowerCase().includes(filter.toLowerCase()));
    
    const matchesCategory = !categoryFilter || component.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tighter">Componentes</h1>
            <p className="text-muted-foreground mt-1">
              Explore e utilize componentes Elementor pré-construídos.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button asChild className="hover-lift" size="sm">
                <Link to="/components/new">
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Novo Componente
                </Link>
              </Button>
            )}
            {isAdmin && (
              <Button asChild variant="outline" size="sm">
                <Link to="/admin">
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Painel Admin
                </Link>
              </Button>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="md:col-span-3">
            <div className="relative">
              <input
                type="search"
                placeholder="Buscar componentes por título, descrição ou tags..."
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <select
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">Todas as categorias</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredComponents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredComponents.map((component) => (
              <Link key={component.id} to={`/component/${component.id}`}>
                <ComponentCard 
                  component={{
                    id: component.id,
                    title: component.title,
                    description: component.description || '',
                    category: component.category,
                    type: component.type,
                    jsonCode: component.json_code,
                    previewImage: component.preview_image,
                    tags: component.tags || [],
                    dateCreated: component.created_at,
                    dateUpdated: component.updated_at,
                    visibility: component.visibility
                  }} 
                />
              </Link>
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-primary/10 p-3 mb-4">
                <Filter className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Nenhum componente encontrado</h3>
              <p className="text-muted-foreground max-w-md mb-4">
                Não encontramos nenhum componente com os filtros aplicados. Tente ajustar sua busca ou criar um novo componente.
              </p>
              {isAdmin && (
                <Button asChild>
                  <Link to="/components/new">
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Criar Componente
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </main>
      
      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Bloqx Studio. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
};

export default Components;
