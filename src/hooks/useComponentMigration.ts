
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { createComponent } from '@/lib/api/components';
import { extractAdvancedStyles } from '@/utils/elementor/advancedStyleExtractor';
import { convertHtmlToElementorJson } from '@/utils/elementor/htmlToJson';
import { toast } from 'sonner';

interface WordPressPost {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  date: string;
  link: string;
  featured_image_url?: string;
  category_names?: string[];
  tag_names?: string[];
}

interface MigrationStats {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  progress: number;
}

export const useComponentMigration = () => {
  const [stats, setStats] = useState<MigrationStats>({
    total: 0,
    processed: 0,
    successful: 0,
    failed: 0,
    progress: 0
  });

  const mapWordPressCategory = (categoryNames: string[]): string => {
    if (!categoryNames || categoryNames.length === 0) return 'geral';
    
    const categoryMap: { [key: string]: string } = {
      'header': 'cabecalho',
      'headers': 'cabecalho',
      'cabeçalho': 'cabecalho',
      'hero': 'secoes-hero',
      'heros': 'secoes-hero',
      'banner': 'secoes-hero',
      'feature': 'destaques',
      'features': 'destaques',
      'destaque': 'destaques',
      'testimonial': 'depoimentos',
      'testimonials': 'depoimentos',
      'depoimento': 'depoimentos',
      'footer': 'rodape',
      'footers': 'rodape',
      'rodapé': 'rodape',
      'contact': 'contato',
      'contato': 'contato',
      'pricing': 'precos',
      'preço': 'precos',
      'price': 'precos',
      'faq': 'perguntas-frequentes',
      'team': 'equipe',
      'sobre': 'equipe',
      'about': 'equipe',
      'video': 'video',
      'vídeo': 'video',
      'blog': 'blog',
      'post': 'post-individual',
      'maintenance': 'manutencao',
      'manutenção': 'manutencao',
      '404': 'pagina-404',
      'error': 'pagina-404'
    };

    for (const category of categoryNames) {
      const lowerCategory = category.toLowerCase();
      if (categoryMap[lowerCategory]) {
        return categoryMap[lowerCategory];
      }
    }

    return 'geral';
  };

  const migrateSinglePost = async (post: WordPressPost): Promise<boolean> => {
    try {
      console.log(`🔄 Migrando: ${post.title.rendered}`);

      // Extrair estilos avançados
      let advancedStyles = null;
      try {
        advancedStyles = extractAdvancedStyles(post.content.rendered);
      } catch (styleError) {
        console.warn('⚠️ Erro na extração de estilos:', styleError);
      }

      // Converter para JSON Elementor
      const elementorJson = convertHtmlToElementorJson(
        post.content.rendered,
        post.title.rendered
      );

      // Determinar categoria
      const category = mapWordPressCategory(post.category_names);

      // Criar tags
      const tags = [
        ...(post.tag_names || []),
        ...(post.category_names || []),
        'superelements',
        'migrado'
      ].filter(Boolean).slice(0, 10); // Limitar tags

      // Criar componente no Supabase
      await createComponent({
        title: post.title.rendered,
        description: `Componente migrado do Superelements (ID: ${post.id})`,
        category,
        code: elementorJson,
        json_code: elementorJson,
        preview_image: post.featured_image_url,
        tags,
        type: 'elementor',
        visibility: 'public',
        created_by: '', // Será preenchido automaticamente
      });

      console.log(`✅ Migrado com sucesso: ${post.title.rendered}`);
      return true;

    } catch (error) {
      console.error(`❌ Erro ao migrar ${post.title.rendered}:`, error);
      return false;
    }
  };

  const migrationMutation = useMutation({
    mutationFn: async (posts: WordPressPost[]) => {
      // Reset stats
      setStats({
        total: posts.length,
        processed: 0,
        successful: 0,
        failed: 0,
        progress: 0
      });

      let successful = 0;
      let failed = 0;

      for (let i = 0; i < posts.length; i++) {
        const post = posts[i];
        const success = await migrateSinglePost(post);
        
        if (success) {
          successful++;
        } else {
          failed++;
        }

        const processed = i + 1;
        const progress = (processed / posts.length) * 100;

        setStats({
          total: posts.length,
          processed,
          successful,
          failed,
          progress
        });

        // Delay para não sobrecarregar
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      return { successful, failed, total: posts.length };
    },
    onSuccess: (result) => {
      toast.success(
        `Migração concluída! ${result.successful} componentes migrados com sucesso. ${result.failed} falharam.`,
        { duration: 5000 }
      );
    },
    onError: (error) => {
      console.error('❌ Erro na migração:', error);
      toast.error('Erro durante a migração. Verifique o console para mais detalhes.');
    },
  });

  return {
    stats,
    migrationMutation,
    isRunning: migrationMutation.isPending
  };
};
