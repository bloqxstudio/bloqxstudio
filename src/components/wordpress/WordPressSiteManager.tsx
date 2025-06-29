
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { AlertCircle, Check, ExternalLink, Trash2, TestTube, Plus, Info } from 'lucide-react';
import { toast } from 'sonner';
import { 
  getUserWordPressSites, 
  createWordPressSite, 
  deleteWordPressSite,
  testWordPressSiteConnection,
  type WordPressSiteCreateRequest 
} from '@/core/api/wordpress-sites';

const WordPressSiteManager = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<WordPressSiteCreateRequest>({
    site_url: '',
    api_key: '',
    site_name: '',
    username: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const queryClient = useQueryClient();

  const { data: sites = [], isLoading } = useQuery({
    queryKey: ['wordpress-sites'],
    queryFn: getUserWordPressSites,
  });

  const createSiteMutation = useMutation({
    mutationFn: createWordPressSite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wordpress-sites'] });
      setShowAddForm(false);
      setFormData({ site_url: '', api_key: '', site_name: '', username: '' });
      toast.success('Site WordPress conectado com sucesso!');
    },
    onError: (error) => {
      toast.error(`Erro ao conectar: ${error.message}`);
    },
  });

  const deleteSiteMutation = useMutation({
    mutationFn: deleteWordPressSite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wordpress-sites'] });
      toast.success('Site WordPress removido!');
    },
    onError: (error) => {
      toast.error(`Erro ao remover: ${error.message}`);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.site_url || !formData.api_key) {
      toast.error('URL e Application Password são obrigatórios');
      return;
    }

    setIsSubmitting(true);
    try {
      await createSiteMutation.mutateAsync(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestConnection = async (siteId: string) => {
    try {
      const result = await testWordPressSiteConnection(siteId);
      if (result.is_valid) {
        toast.success(`Conexão testada com sucesso! Método: ${result.auth_method}`);
      } else {
        toast.error(`Falha na conexão: ${result.error}`);
      }
    } catch (error) {
      toast.error('Erro ao testar conexão');
    }
  };

  const handleDelete = (siteId: string) => {
    if (confirm('Tem certeza que deseja remover esta conexão?')) {
      deleteSiteMutation.mutate(siteId);
    }
  };

  if (isLoading) {
    return <div>Carregando sites WordPress...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Sites WordPress Conectados</h2>
        <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Adicionar Site
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Conectar Novo Site WordPress</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="site_url">URL do WordPress *</Label>
                <Input
                  id="site_url"
                  value={formData.site_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, site_url: e.target.value }))}
                  placeholder="https://seusite.com.br"
                  required
                />
              </div>

              <div>
                <Label htmlFor="username">Nome de Usuário do WordPress *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="Seu nome de usuário WordPress"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  O nome de usuário que você usa para fazer login no WordPress
                </p>
              </div>
              
              <div>
                <Label htmlFor="api_key">Application Password *</Label>
                <Input
                  id="api_key"
                  type="password"
                  value={formData.api_key}
                  onChange={(e) => setFormData(prev => ({ ...prev, api_key: e.target.value }))}
                  placeholder="xxxx xxxx xxxx xxxx xxxx xxxx"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  A Application Password gerada no WordPress (formato: xxxx xxxx xxxx xxxx)
                </p>
              </div>

              <div>
                <Label htmlFor="site_name">Nome do Site (opcional)</Label>
                <Input
                  id="site_name"
                  value={formData.site_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, site_name: e.target.value }))}
                  placeholder="Nome personalizado para identificar o site"
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg text-sm">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-2">Como obter a Application Password:</h4>
                    <ol className="list-decimal list-inside space-y-1 text-blue-800">
                      <li>Acesse seu WordPress Admin → Usuários → Perfil</li>
                      <li>Role até a seção "Application Passwords"</li>
                      <li>Digite "Superelements" no campo de nome</li>
                      <li>Clique em "Add New Application Password"</li>
                      <li>Copie a senha gerada (formato: xxxx xxxx xxxx xxxx)</li>
                      <li>Cole a senha no campo acima</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 p-4 rounded-lg text-sm">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-amber-900 mb-1">Problemas de Conexão?</h4>
                    <ul className="list-disc list-inside space-y-1 text-amber-800">
                      <li>Verifique se a REST API está habilitada</li>
                      <li>Confirme se o usuário tem permissões de administrador</li>
                      <li>Desative plugins de segurança temporariamente</li>
                      <li>Certifique-se de que o WordPress é versão 5.6 ou superior</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Conectando...' : 'Conectar Site'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddForm(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {sites.length === 0 && !showAddForm ? (
        <Card>
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum site conectado</h3>
            <p className="text-gray-600 mb-4">
              Conecte seu primeiro site WordPress para começar a sincronizar componentes.
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              Conectar Primeiro Site
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sites.map((site) => (
            <Card key={site.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium">{site.site_name || 'WordPress Site'}</h3>
                      {site.is_active ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <Check className="h-3 w-3 mr-1" />
                          Ativo
                        </Badge>
                      ) : (
                        <Badge variant="destructive">Inativo</Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{site.site_url}</p>
                    
                    <div className="flex flex-wrap gap-2 text-xs">
                      {site.wordpress_version && (
                        <Badge variant="outline">WordPress {site.wordpress_version}</Badge>
                      )}
                      {site.elementor_active ? (
                        <Badge variant="outline" className="text-green-600">
                          Elementor Ativo
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-orange-600">
                          Elementor Inativo
                        </Badge>
                      )}
                    </div>

                    {site.last_sync_at && (
                      <p className="text-xs text-gray-500 mt-2">
                        Última sincronização: {new Date(site.last_sync_at).toLocaleString('pt-BR')}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTestConnection(site.id)}
                      title="Testar Conexão"
                    >
                      <TestTube className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                      title="Abrir Site"
                    >
                      <a href={site.site_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(site.id)}
                      className="text-red-600 hover:text-red-700"
                      title="Remover Site"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default WordPressSiteManager;
