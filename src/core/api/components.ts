
// API para buscar componentes diretamente do WordPress
import { Component } from '@/core/types';
import { getUserWordPressSites } from './wordpress-sites';

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

// Buscar componentes de um site WordPress conectado
const getWordPressSiteComponents = async (siteId: string, siteUrl: string, apiKey: string, siteName: string): Promise<Component[]> => {
  try {
    const cleanUrl = siteUrl.replace(/\/$/, '');
    
    // Parse auth info
    let authHeader;
    if (apiKey.includes(':')) {
      const [username, password] = apiKey.split(':');
      const basicAuthToken = btoa(`${username}:${password}`);
      authHeader = `Basic ${basicAuthToken}`;
    } else {
      authHeader = `Bearer ${apiKey}`;
    }

    const response = await fetch(
      `${cleanUrl}/wp-json/wp/v2/posts?per_page=50&_embed=1`,
      {
        headers: {
          'Authorization': authHeader,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.warn(`Erro ao buscar componentes do site ${siteName}: ${response.status}`);
      return [];
    }

    const posts: WordPressPost[] = await response.json();

    return posts.map((post) => {
      const elementorData = extractElementorData(post);
      const featuredImage = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || '';
      const categories = post._embedded?.['wp:term']?.[0] || [];
      const mappedCategory = mapWordPressCategory(categories);
      const tags = extractTags(post.title.rendered, post.content.rendered);
      const description = `Componente de ${siteName}: ${post.title.rendered}`;

      return {
        id: `${siteId}-${post.id}`,
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
        created_by: siteId,
        source: 'wordpress' as const,
        source_site: siteName,
        slug: post.slug,
        wordpress_site_id: siteId
      };
    });
  } catch (error) {
    console.error(`Erro ao buscar componentes do site ${siteName}:`, error);
    return [];
  }
};

// Função principal para buscar todos os componentes
export const getComponents = async (): Promise<Component[]> => {
  console.log('🔍 Buscando componentes dos sites WordPress conectados...');
  
  try {
    // Buscar componentes dos sites conectados (somente se usuário autenticado)
    let connectedSitesComponents: Component[] = [];
    
    try {
      const userSites = await getUserWordPressSites();
      console.log(`🔗 ${userSites.length} sites conectados encontrados`);

      if (userSites.length > 0) {
        const siteComponentPromises = userSites.map(site =>
          getWordPressSiteComponents(site.id, site.site_url, site.api_key, site.site_name || site.site_url)
        );

        const siteComponentsArrays = await Promise.all(siteComponentPromises);
        connectedSitesComponents = siteComponentsArrays.flat();
        console.log(`📊 ${connectedSitesComponents.length} componentes de sites conectados`);
      }
    } catch (authError) {
      console.log('Usuário não autenticado ou sem sites conectados');
    }

    console.log(`🎉 Total de ${connectedSitesComponents.length} componentes carregados`);
    
    return connectedSitesComponents;

  } catch (error) {
    console.error('💥 Erro ao buscar componentes:', error);
    return [];
  }
};

// Função para buscar componente específico por ID
export const getComponentById = async (id: string): Promise<Component | null> => {
  try {
    // Buscar nos sites do usuário
    const userSites = await getUserWordPressSites();
    const siteId = id.split('-')[0];
    const postId = id.split('-').slice(1).join('-');
    const site = userSites.find(s => s.id === siteId);

    if (!site) {
      throw new Error('Site não encontrado');
    }

    const cleanUrl = site.site_url.replace(/\/$/, '');
    
    let authHeader;
    if (site.api_key.includes(':')) {
      const [username, password] = site.api_key.split(':');
      const basicAuthToken = btoa(`${username}:${password}`);
      authHeader = `Basic ${basicAuthToken}`;
    } else {
      authHeader = `Bearer ${site.api_key}`;
    }

    const response = await fetch(
      `${cleanUrl}/wp-json/wp/v2/posts/${postId}?_embed=1`,
      {
        headers: {
          'Authorization': authHeader,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Post não encontrado: ${response.status}`);
    }

    const post: WordPressPost = await response.json();
    
    const elementorData = extractElementorData(post);
    const featuredImage = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || '';
    const categories = post._embedded?.['wp:term']?.[0] || [];
    const mappedCategory = mapWordPressCategory(categories);
    const tags = extractTags(post.title.rendered, post.content.rendered);
    const description = `Componente de ${site.site_name || site.site_url}: ${post.title.rendered}`;

    return {
      id: `${siteId}-${post.id}`,
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
      created_by: siteId,
      source: 'wordpress' as const,
      source_site: site.site_name || site.site_url,
      slug: post.slug,
      wordpress_site_id: siteId
    };
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
