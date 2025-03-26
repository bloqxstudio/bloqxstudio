import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import ComponentCard from '@/components/ComponentCard';
import { getSampleComponents, getSampleCategories } from '@/lib/data';
import { Component } from '@/lib/database.types';
import { ArrowRight, Layers, Code, Copy, Zap } from 'lucide-react';
const Index = () => {
  const featuredComponents = getSampleComponents().slice(0, 3);
  const categories = getSampleCategories();

  // Create a mapping function to convert ElementorComponent to Component
  const mapToComponent = (component: any): Component => ({
    id: component.id,
    title: component.title,
    description: component.description,
    preview_image: component.previewImage,
    category: component.category,
    code: component.jsonCode,
    json_code: component.jsonCode,
    tags: component.tags,
    type: component.type || 'elementor',
    visibility: 'public',
    created_at: component.dateCreated || new Date().toISOString(),
    updated_at: component.dateUpdated || new Date().toISOString(),
    created_by: 'system'
  });
  return <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-12 md:py-24 lg:py-32 xl:py-40 px-4">
          <div className="container px-4 md:px-6 flex flex-col items-center text-center space-y-8 animate-fade-up">
            <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
              Documentação simplificada para Elementor
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter max-w-3xl mx-auto lg:text-7xl">Crie sites no Elementor até 5x mais rápido.

          </h1>
            <p className="text-muted-foreground text-base sm:text-lg md:text-xl max-w-[800px] mx-auto">
              Organize, compartilhe e reutilize seus blocos de código JSON para Elementor. Uma biblioteca centralizada para todos os seus componentes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="hover-lift">
                <Link to="/components">
                  Ver Componentes
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="hover-lift">
                <Link to="/components/new">
                  Adicionar Componente
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter">
                Recursos poderosos para seus projetos Elementor
              </h2>
              <p className="text-muted-foreground mt-4 max-w-[700px] mx-auto">
                Ferramentas que simplificam seu fluxo de trabalho e aumentam sua produtividade
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="bg-card border-0 shadow-sm hover:shadow-md transition-all duration-300">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="h-12 w-12 flex items-center justify-center rounded-full bg-primary/10 mb-4">
                    <Layers className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Biblioteca Organizada</h3>
                  <p className="text-muted-foreground">
                    Mantenha seus componentes agrupados por categorias e facilmente pesquisáveis.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-0 shadow-sm hover:shadow-md transition-all duration-300">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="h-12 w-12 flex items-center justify-center rounded-full bg-primary/10 mb-4">
                    <Code className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Visualização de Código</h3>
                  <p className="text-muted-foreground">
                    Edite e visualize o código JSON com highlight de sintaxe em tempo real.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-0 shadow-sm hover:shadow-md transition-all duration-300">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="h-12 w-12 flex items-center justify-center rounded-full bg-primary/10 mb-4">
                    <Copy className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Copiar e Colar</h3>
                  <p className="text-muted-foreground">
                    Copie o código com um clique e cole diretamente no Elementor.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Featured Components */}
        <section className="py-16">
          <div className="container px-4 md:px-6">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold tracking-tighter">Componentes em Destaque</h2>
              <Button asChild variant="ghost" className="hover-lift">
                <Link to="/components" className="flex items-center">
                  Ver todos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredComponents.map(component => <ComponentCard key={component.id} component={mapToComponent(component)} />)}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-16 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter">
                Explore por Categoria
              </h2>
              <p className="text-muted-foreground mt-4 max-w-[700px] mx-auto">
                Encontre rapidamente os componentes que você precisa
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {categories.map(category => <Link to={`/components?category=${category.slug}`} key={category.id}>
                  <Card className="hover:shadow-md transition-all duration-300 hover:border-primary cursor-pointer h-full">
                    <CardContent className="p-6 flex flex-col">
                      <h3 className="text-xl font-medium mb-2">{category.name}</h3>
                      <p className="text-muted-foreground flex-grow mb-4">{category.description}</p>
                      <Button variant="ghost" className="self-start group">
                        Explorar
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>)}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="container px-4 md:px-6 max-w-4xl mx-auto">
            <div className="rounded-2xl bg-gradient-to-r from-primary/90 to-primary p-8 md:p-12 shadow-lg">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-4 max-w-xl text-primary-foreground">
                  <h2 className="text-2xl md:text-3xl font-bold">Pronto para começar?</h2>
                  <p className="opacity-90">
                    Adicione seu primeiro componente Elementor e comece a construir sua biblioteca personalizada.
                  </p>
                </div>
                <Button asChild size="lg" variant="secondary" className="hover-lift">
                  <Link to="/components/new" className="flex items-center">
                    <Zap className="mr-2 h-4 w-4" />
                    Criar Componente
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="border-t py-6 md:py-8">
        <div className="container px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Bloqx Studio. Todos os direitos reservados.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground">
              Termos
            </Link>
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
              Privacidade
            </Link>
          </div>
        </div>
      </footer>
    </div>;
};
export default Index;