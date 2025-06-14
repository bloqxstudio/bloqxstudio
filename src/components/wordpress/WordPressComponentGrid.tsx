
import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Copy, Download, Upload, Code, Check, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { getWordPressComponents } from '@/core/api/wordpress';
import { getUserWordPressSites, importComponentToWordPress } from '@/core/api/wordpress-sites';
import { cleanElementorJsonWithStyles } from '@/utils/json/preserveStyles';

interface WordPressComponentGridProps {
  selectedCategory?: string;
  searchTerm?: string;
}

const WordPressComponentGrid: React.FC<WordPressComponentGridProps> = ({
  selectedCategory,
  searchTerm,
}) => {
  const [selectedSiteId, setSelectedSiteId] = useState<string>('');
  const [page, setPage] = useState(1);
  const [applyStructure, setApplyStructure] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: componentsResponse, isLoading: isLoadingComponents } = useQuery({
    queryKey: ['wordpress-components', selectedCategory, searchTerm, page],
    queryFn: () => getWordPressComponents({
      category: selectedCategory || undefined,
      search: searchTerm || undefined,
      page,
      limit: 12,
    }),
  });

  const { data: sites = [] } = useQuery({
    queryKey: ['wordpress-sites'],
    queryFn: getUserWordPressSites,
  });

  const importMutation = useMutation({
    mutationFn: ({ siteId, componentId }: { siteId: string; componentId: string }) =>
      importComponentToWordPress(siteId, componentId),
    onSuccess: () => {
      toast.success('Componente importado com sucesso para o WordPress!');
    },
    onError: (error) => {
      toast.error(`Erro ao importar: ${error.message}`);
    },
  });

  const components = componentsResponse?.data || [];
  const pagination = componentsResponse?.pagination;

  const handleCopyCode = async (component: any) => {
    try {
      let jsonToCopy = component.elementor_json || component.copy_code;
      
      // Apply JsonTransformer-style cleaning and standardization
      if (jsonToCopy) {
        const cleanedJson = cleanElementorJsonWithStyles(
          jsonToCopy,
          component.content || component.code, // Use code as fallback if content not available
          false, // Don't remove styles
          true,  // Wrap in container
          applyStructure // Apply standard structure if enabled
        );
        jsonToCopy = cleanedJson;
      }

      await navigator.clipboard.writeText(jsonToCopy);
      setCopiedId(component.id);
      
      toast.success(applyStructure ? 
        `JSON do ${component.title} copiado e padronizado com estrutura!` :
        `JSON do ${component.title} copiado e padronizado!`
      );
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Erro ao copiar e tratar JSON:', error);
      toast.error('Erro ao copiar JSON. Tente novamente.');
    }
  };

  const handleDownload = async (component: any) => {
    try {
      let jsonToDownload = component.elementor_json || component.copy_code;
      
      // Apply JsonTransformer-style cleaning
      if (jsonToDownload) {
        const cleanedJson = cleanElementorJsonWithStyles(
          jsonToDownload,
          component.content || component.code, // Use code as fallback
          false,
          true,
          applyStructure
        );
        jsonToDownload = cleanedJson;
      }

      const filename = `${component.title.toLowerCase().replace(/\s+/g, '-')}.json`;
      const blob = new Blob([jsonToDownload], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success(`${filename} baixado com tratamento aplicado!`);
    } catch (error) {
      console.error('Erro ao baixar JSON:', error);
      toast.error('Erro ao baixar JSON. Tente novamente.');
    }
  };

  const handleImport = (componentId: string) => {
    if (!selectedSiteId) {
      toast.error('Selecione um site WordPress primeiro');
      return;
    }

    importMutation.mutate({ siteId: selectedSiteId, componentId });
  };

  if (isLoadingComponents) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded-t-lg"></div>
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Processing Options */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Settings className="h-5 w-5 text-muted-foreground" />
              <Label className="font-medium">Opções de Processamento JSON:</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="apply-structure"
                  checked={applyStructure}
                  onCheckedChange={setApplyStructure}
                />
                <Label htmlFor="apply-structure" className="text-sm">
                  Aplicar Estrutura Padrão
                </Label>
              </div>
            </div>
            {applyStructure && (
              <Badge variant="outline" className="text-blue-600">
                Estrutura: Seção → Padding → Linha → Coluna
              </Badge>
            )}
          </div>
          {applyStructure && (
            <p className="text-xs text-muted-foreground mt-2">
              O JSON será processado com a estrutura padrão do JsonTransformer, mantendo todos os estilos.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Site Selection */}
      {sites.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Site de destino:</label>
              <Select value={selectedSiteId} onValueChange={setSelectedSiteId}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Selecione um site WordPress" />
                </SelectTrigger>
                <SelectContent>
                  {sites.map((site) => (
                    <SelectItem key={site.id} value={site.id}>
                      {site.site_name || site.site_url}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedSiteId && (
                <Badge variant="outline" className="text-green-600">
                  Site selecionado
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Components Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {components.map((component) => (
          <Card key={component.id} className="overflow-hidden">
            <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
              {component.preview_image ? (
                <img
                  src={component.preview_image}
                  alt={component.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Code className="h-12 w-12 text-gray-400" />
              )}
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">{component.title}</h3>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {component.description}
              </p>
              <div className="flex flex-wrap gap-1 mb-3">
                {component.tags?.slice(0, 3).map((tag, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopyCode(component)}
                    disabled={copiedId === component.id}
                    className="flex-1"
                  >
                    {copiedId === component.id ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-1" />
                        Copiar JSON
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownload(component)}
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
                
                {sites.length > 0 && selectedSiteId && (
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => handleImport(component.id)}
                    disabled={importMutation.isPending}
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    {importMutation.isPending ? 'Importando...' : 'Importar para WordPress'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Anterior
          </Button>
          <span className="flex items-center px-4">
            Página {page} de {Math.ceil(pagination.total / pagination.limit)}
          </span>
          <Button
            variant="outline"
            disabled={!pagination.hasNext}
            onClick={() => setPage(page + 1)}
          >
            Próxima
          </Button>
        </div>
      )}
    </div>
  );
};

export default WordPressComponentGrid;
