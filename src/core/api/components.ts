
// API para buscar componentes diretamente do WordPress
import { Component } from '@/core/types';

interface WordPressPost {
  id: number;
  slug: string;
  title: { rendered: string };
  content: { rendered: string };
  date: string;
  modified: string;
  featured_media: number;
  categories: number[];
  meta: {
    _elementor_data?: string;
  };
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string;
      alt_text: string;
    }>;
    'wp:term'?: Array<Array<{
      id: number;
      name: string;
      slug: string;
    }>>;
  };
}

const WORDPRESS_API_BASE = 'https://superelements.io/wp-json/wp/v2';

// Função para extrair dados do Elementor do meta field
const extractElementorData = (post: WordPressPost): string => {
  if (post.meta?._elementor_data) {
    return post.meta._elementor_data;
  }
  
  // Fallback: tentar extrair do conteúdo renderizado
  return post.content.rendered || '[]';
};

// Função para determinar categoria baseada nas categorias do WordPress
const mapWordPressCategory = (categories: Array<{ name: string; slug: string }> = []): string => {
  if (categories.length === 0) return 'geral';
  
  const categoryMap: Record<string, string> = {
    'uncategorized': 'geral',
    'header': 'cabecalho',
    'hero': 'secoes-hero', 
    'features': 'destaques',
    'testimonials': 'depoimentos',
    'footer': 'rodape',
    'contact': 'contato',
    'pricing': 'precos',
    'faq': 'perguntas-frequentes',
    'team': 'equipe',
    'video': 'video',
    'blog': 'blog'
  };
  
  const firstCategory = categories[0];
  return categoryMap[firstCategory.slug] || firstCategory.slug || 'geral';
};

// Função para extrair tags do título e conteúdo
const extractTags = (title: string, content: string): string[] => {
  const tags: string[] = [];
  
  // Tags baseadas em palavras-chave no título
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('header') || titleLower.includes('cabeçalho')) tags.push('header');
  if (titleLower.includes('hero') || titleLower.includes('banner')) tags.push('hero');
  if (titleLower.includes('footer') || titleLower.includes('rodapé')) tags.push('footer');
  if (titleLower.includes('button') || titleLower.includes('botão')) tags.push('button');
  if (titleLower.includes('form') || titleLower.includes('formulário')) tags.push('form');
  if (titleLower.includes('gallery') || titleLower.includes('galeria')) tags.push('gallery');
  if (titleLower.includes('pricing') || titleLower.includes('preço')) tags.push('pricing');
  if (titleLower.includes('testimonial') || titleLower.includes('depoimento')) tags.push('testimonial');
  if (titleLower.includes('team') || titleLower.includes('equipe')) tags.push('team');
  if (titleLower.includes('contact') || titleLower.includes('contato')) tags.push('contact');
  
  // Tags baseadas no conteúdo Elementor
  if (content.includes('elementor-widget-button')) tags.push('button');
  if (content.includes('elementor-widget-image')) tags.push('image');
  if (content.includes('elementor-widget-video')) tags.push('video');
  if (content.includes('elementor-widget-heading')) tags.push('heading');
  if (content.includes('elementor-widget-text-editor')) tags.push('text');
  if (content.includes('elementor-widget-form')) tags.push('form');
  
  return [...new Set(tags)]; // Remove duplicatas
};

export const getComponents = async (): Promise<Component[]> => {
  console.log('🔍 Buscando componentes diretamente da API do WordPress...');
  
  try {
    // Buscar posts com dados embedded (featured media e categorias)
    const response = await fetch(
      `${WORDPRESS_API_BASE}/posts?per_page=100&page=1&orderby=date&order=desc&_embed=1`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Erro na API do WordPress: ${response.status}`);
    }

    const posts: WordPressPost[] = await response.json();
    console.log('📊 Posts recebidos do WordPress:', posts.length);

    // Converter posts do WordPress para o formato Component
    const components: Component[] = await Promise.all(
      posts.map(async (post, index) => {
        console.log(`🔄 Processando post ${index + 1}: ${post.title.rendered} (slug: ${post.slug})`);

        // Extrair dados do Elementor
        const elementorData = extractElementorData(post);
        
        // Obter imagem destacada
        const featuredImage = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || '';
        
        // Obter categorias
        const categories = post._embedded?.['wp:term']?.[0] || [];
        const mappedCategory = mapWordPressCategory(categories);
        
        // Extrair tags
        const tags = extractTags(post.title.rendered, post.content.rendered);
        
        // Criar descrição baseada no título
        const description = `Componente Elementor: ${post.title.rendered}`;

        const component: Component = {
          id: `wp-${post.id}`,
          title: post.title.rendered || 'Sem título',
          description,
          category: mappedCategory,
          code: elementorData,
          json_code: elementorData,
          preview_image: featuredImage,
          tags,
          type: 'elementor',
          visibility: 'public' as const,
          created_at: post.date,
          updated_at: post.modified,
          created_by: 'wordpress-import',
          source: 'wordpress' as const,
          slug: post.slug
        };

        console.log(`✅ Componente processado: ${component.title} (slug: ${component.slug})`);
        return component;
      })
    );

    console.log(`🎉 Total de ${components.length} componentes carregados do WordPress`);
    return components;

  } catch (error) {
    console.error('💥 Erro ao buscar componentes do WordPress:', error);
    return [];
  }
};

// Função para buscar componente específico por ID
export const getComponentById = async (id: string): Promise<Component | null> => {
  try {
    // Extrair ID numérico do WordPress (remover prefixo wp-)
    const wpId = id.replace('wp-', '');
    
    const response = await fetch(
      `${WORDPRESS_API_BASE}/posts/${wpId}?_embed=1`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Post não encontrado: ${response.status}`);
    }

    const post: WordPressPost = await response.json();
    
    // Converter para formato Component
    const elementorData = extractElementorData(post);
    const featuredImage = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || '';
    const categories = post._embedded?.['wp:term']?.[0] || [];
    const mappedCategory = mapWordPressCategory(categories);
    const tags = extractTags(post.title.rendered, post.content.rendered);
    const description = `Componente Elementor: ${post.title.rendered}`;

    const component: Component = {
      id: `wp-${post.id}`,
      title: post.title.rendered || 'Sem título',
      description,
      category: mappedCategory,
      code: elementorData,
      json_code: elementorData,
      preview_image: featuredImage,
      tags,
      type: 'elementor',
      visibility: 'public' as const,
      created_at: post.date,
      updated_at: post.modified,
      created_by: 'wordpress-import',
      source: 'wordpress' as const,
      slug: post.slug
    };

    return component;
  } catch (error) {
    console.error('Erro ao buscar componente por ID:', error);
    return null;
  }
};

// Funções não utilizadas em modo público
export const uploadComponentImage = async (file: File, path: string): Promise<string> => {
  throw new Error('Upload não disponível em modo público');
};

export const createComponent = async (componentData: any): Promise<Component> => {
  throw new Error('Criação de componentes não disponível em modo público');
};

export const updateComponent = async (id: string, componentData: FormData): Promise<Component> => {
  throw new Error('Atualização de componentes não disponível em modo público');
};

export const deleteComponent = async (id: string): Promise<void> => {
  throw new Error('Exclusão de componentes não disponível em modo público');
};
