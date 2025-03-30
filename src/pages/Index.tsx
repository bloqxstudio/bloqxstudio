
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import ComponentCard from '@/components/ComponentCard';
import { getSampleCategories } from '@/lib/data';
import { Component } from '@/lib/database.types';
import { ArrowRight, Download, Code, Copy, Zap, Globe, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

const Index = () => {
  const categories = getSampleCategories();
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');
  
  // Save language preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);
  
  const toggleLanguage = () => {
    setLanguage(prevLang => prevLang === 'en' ? 'pt' : 'en');
  };
  
  const getTranslation = (en: string, pt: string) => {
    return language === 'pt' ? pt : en;
  };

  // Fetch featured components from Supabase with improved error handling
  const {
    data: featuredComponents = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['featuredComponents'],
    queryFn: async () => {
      try {
        const {
          data,
          error
        } = await supabase.from('components').select('*').eq('visibility', 'public').order('created_at', {
          ascending: false
        }).limit(6);

        if (error) {
          console.error('Error fetching featured components:', error);
          toast.error(getTranslation(
            'Could not load components.', 
            'Não foi possível carregar os componentes.'
          ));
          return [];
        }
        return data as Component[];
      } catch (e) {
        console.error('Unexpected error fetching components:', e);
        return [];
      }
    },
    staleTime: 2 * 60 * 1000,
    retry: 1,
    refetchOnMount: false
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      {/* Language Switcher */}
      <div className="fixed top-20 right-4 z-50">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={toggleLanguage}
          className="flex items-center gap-1"
        >
          <Globe className="h-4 w-4" />
          {language === 'en' ? 'PT-BR' : 'EN'}
        </Button>
      </div>
      
      <main className="flex-grow">
        {/* Hero Section - Sales Focused */}
        <section className="py-16 md:py-28 lg:py-32 xl:py-40 px-4 bg-gradient-to-br from-primary/90 to-primary text-primary-foreground">
          <div className="container px-4 md:px-6 flex flex-col items-center text-center space-y-6 md:space-y-8 animate-fade-up">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tighter max-w-3xl mx-auto lg:text-7xl">
              {getTranslation(
                'Copy to publish - in seconds',
                'Copie para publicar - em segundos'
              )}
            </h1>
            <p className="text-primary-foreground/90 text-base sm:text-xl md:text-2xl max-w-[800px] mx-auto">
              {getTranslation(
                'Stop designing Elementor websites from scratch. Build your next site in few seconds with our perfectly designed components.',
                'Pare de criar sites Elementor do zero. Construa seu próximo site em poucos segundos com nossos componentes perfeitamente desenhados.'
              )}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Button 
                asChild 
                size="lg" 
                variant="secondary" 
                className="hover-lift font-semibold text-primary"
              >
                <Link to="/components">
                  {getTranslation('Browse Components', 'Ver Componentes')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                size="lg" 
                className="hover-lift bg-transparent border-white text-white hover:bg-white/20"
              >
                <Link to="/register">
                  {getTranslation('Create Free Account', 'Criar Conta Gratuita')}
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl font-bold tracking-tighter mb-4">
                {getTranslation(
                  'Build websites 10x faster with Elementor templates',
                  'Construa sites 10x mais rápido com templates para Elementor'
                )}
              </h2>
              <p className="text-muted-foreground max-w-[800px] mx-auto text-lg">
                {getTranslation(
                  'Pre-designed, ready-to-use components you can copy and paste directly into Elementor',
                  'Componentes pré-desenhados e prontos para usar que você pode copiar e colar diretamente no Elementor'
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
              <Card className="border-2 border-primary/10 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                <div className="h-2 bg-primary"></div>
                <CardContent className="p-6 flex flex-col items-start">
                  <div className="h-12 w-12 flex items-center justify-center rounded-full bg-primary/10 mb-4">
                    <Copy className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">
                    {getTranslation('Copy & Paste', 'Copie & Cole')}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {getTranslation(
                      'Simply copy the code with one click and paste directly into Elementor',
                      'Simplesmente copie o código com um clique e cole diretamente no Elementor'
                    )}
                  </p>
                  <ul className="space-y-2 mt-auto">
                    <li className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-primary mr-2" />
                      {getTranslation('One-click copy', 'Cópia com um clique')}
                    </li>
                    <li className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-primary mr-2" />
                      {getTranslation('Paste into Elementor', 'Cole no Elementor')}
                    </li>
                    <li className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-primary mr-2" />
                      {getTranslation('Ready to use instantly', 'Pronto para usar instantaneamente')}
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary/10 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                <div className="h-2 bg-primary"></div>
                <CardContent className="p-6 flex flex-col items-start">
                  <div className="h-12 w-12 flex items-center justify-center rounded-full bg-primary/10 mb-4">
                    <Download className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">
                    {getTranslation('Download Templates', 'Baixe Templates')}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {getTranslation(
                      'Download components to use offline or share with your team',
                      'Baixe componentes para usar offline ou compartilhar com sua equipe'
                    )}
                  </p>
                  <ul className="space-y-2 mt-auto">
                    <li className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-primary mr-2" />
                      {getTranslation('JSON format for Elementor', 'Formato JSON para Elementor')}
                    </li>
                    <li className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-primary mr-2" />
                      {getTranslation('Offline access', 'Acesso offline')}
                    </li>
                    <li className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-primary mr-2" />
                      {getTranslation('Team collaboration', 'Colaboração em equipe')}
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary/10 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                <div className="h-2 bg-primary"></div>
                <CardContent className="p-6 flex flex-col items-start">
                  <div className="h-12 w-12 flex items-center justify-center rounded-full bg-primary/10 mb-4">
                    <Code className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">
                    {getTranslation('Multiple Components', 'Múltiplos Componentes')}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {getTranslation(
                      'Select multiple components and merge them into a single export',
                      'Selecione múltiplos componentes e mescle-os em uma única exportação'
                    )}
                  </p>
                  <ul className="space-y-2 mt-auto">
                    <li className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-primary mr-2" />
                      {getTranslation('Select any number of components', 'Selecione qualquer número de componentes')}
                    </li>
                    <li className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-primary mr-2" />
                      {getTranslation('Drag and drop to reorder', 'Arraste e solte para reordenar')}
                    </li>
                    <li className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-primary mr-2" />
                      {getTranslation('Export as a single file', 'Exporte como um único arquivo')}
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Featured Components - Always visible for all users */}
        <section className="py-16 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold tracking-tighter">
                {getTranslation('Featured Components', 'Componentes em Destaque')}
              </h2>
              <Button asChild variant="ghost" className="hover-lift">
                <Link to="/components" className="flex items-center">
                  {getTranslation('View all', 'Ver todos')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-40 bg-muted/50 rounded-t-lg"></div>
                    <CardContent className="p-4">
                      <div className="h-6 bg-muted/50 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-muted/50 rounded w-full mb-2"></div>
                      <div className="h-4 bg-muted/50 rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-500">
                  {getTranslation(
                    'Error loading components. Please try again later.',
                    'Erro ao carregar componentes. Tente novamente mais tarde.'
                  )}
                </p>
                <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                  {getTranslation('Reload', 'Recarregar')}
                </Button>
              </div>
            ) : featuredComponents.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {getTranslation(
                    'No components found. Add some components!',
                    'Nenhum componente encontrado. Adicione alguns componentes!'
                  )}
                </p>
                <Button asChild className="mt-4">
                  <Link to="/components/new">
                    {getTranslation('Add Component', 'Adicionar Componente')}
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredComponents.slice(0, 3).map(component => (
                  <ComponentCard key={component.id} component={component} />
                ))}
              </div>
            )}
            
            <div className="text-center mt-10">
              <Button asChild size="lg" className="hover-lift">
                <Link to="/components">
                  {getTranslation('Browse All Components', 'Ver Todos os Componentes')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 bg-background">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl font-bold tracking-tighter mb-4">
                {getTranslation('Simple, Transparent Pricing', 'Preços Simples e Transparentes')}
              </h2>
              <p className="text-muted-foreground max-w-[700px] mx-auto text-lg">
                {getTranslation(
                  'Get started for free. No credit card required.',
                  'Comece gratuitamente. Sem necessidade de cartão de crédito.'
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
              {/* Free Plan */}
              <Card className="border-2 border-muted hover:border-muted/80 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <p className="text-muted-foreground mb-1">
                      {getTranslation('Free', 'Grátis')}
                    </p>
                    <div className="flex items-end gap-1">
                      <h3 className="text-4xl font-bold">$0</h3>
                      <span className="text-muted-foreground mb-1">
                        {getTranslation('/forever', '/para sempre')}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground mb-6">
                    {getTranslation(
                      'Perfect for getting started with basic components',
                      'Perfeito para começar com componentes básicos'
                    )}
                  </p>
                  
                  <Button variant="outline" className="w-full mb-6">
                    {getTranslation('Get Started', 'Começar Agora')}
                  </Button>
                  
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                      <span>{getTranslation('Access to 20+ free components', 'Acesso a mais de 20 componentes gratuitos')}</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                      <span>{getTranslation('Copy & paste to Elementor', 'Copiar e colar para o Elementor')}</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                      <span>{getTranslation('Basic component selection', 'Seleção básica de componentes')}</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              {/* Pro Plan - Highlighted */}
              <Card className="border-2 border-primary relative lg:scale-105 shadow-lg">
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-sm font-medium rounded-bl-lg rounded-tr-lg">
                  {getTranslation('Popular', 'Popular')}
                </div>
                <CardContent className="p-6 pt-10">
                  <div className="mb-4">
                    <p className="text-muted-foreground mb-1">
                      {getTranslation('Pro', 'Pro')}
                    </p>
                    <div className="flex items-end gap-1">
                      <h3 className="text-4xl font-bold">$29</h3>
                      <span className="text-muted-foreground mb-1">
                        {getTranslation('/month', '/mês')}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground mb-6">
                    {getTranslation(
                      'Best value for professionals and small agencies',
                      'Melhor valor para profissionais e pequenas agências'
                    )}
                  </p>
                  
                  <Button className="w-full mb-6">
                    {getTranslation('Go Pro', 'Seja Pro')}
                  </Button>
                  
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                      <span>{getTranslation('Access to 100+ premium components', 'Acesso a mais de 100 componentes premium')}</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                      <span>{getTranslation('Full multi-component selection', 'Seleção completa de múltiplos componentes')}</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                      <span>{getTranslation('Priority support', 'Suporte prioritário')}</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                      <span>{getTranslation('Monthly new components', 'Novos componentes mensais')}</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                      <span>{getTranslation('Save components in personal library', 'Salve componentes em sua biblioteca pessoal')}</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              {/* Agency Plan */}
              <Card className="border-2 border-muted hover:border-muted/80 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <p className="text-muted-foreground mb-1">
                      {getTranslation('Agency', 'Agência')}
                    </p>
                    <div className="flex items-end gap-1">
                      <h3 className="text-4xl font-bold">$99</h3>
                      <span className="text-muted-foreground mb-1">
                        {getTranslation('/month', '/mês')}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground mb-6">
                    {getTranslation(
                      'Unlimited access for larger teams and agencies',
                      'Acesso ilimitado para equipes e agências maiores'
                    )}
                  </p>
                  
                  <Button variant="outline" className="w-full mb-6">
                    {getTranslation('Contact Sales', 'Fale com Vendas')}
                  </Button>
                  
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                      <span>{getTranslation('Everything in Pro plan', 'Tudo no plano Pro')}</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                      <span>{getTranslation('Unlimited team members', 'Membros ilimitados da equipe')}</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                      <span>{getTranslation('Custom component requests', 'Solicitações de componentes personalizados')}</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                      <span>{getTranslation('White-label option', 'Opção white-label')}</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-primary">
          <div className="container px-4 md:px-6 max-w-4xl mx-auto text-center text-primary-foreground">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {getTranslation(
                'Ready to build websites faster?',
                'Pronto para construir sites mais rápido?'
              )}
            </h2>
            <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              {getTranslation(
                'Join thousands of web designers using our Elementor components library',
                'Junte-se a milhares de web designers usando nossa biblioteca de componentes para Elementor'
              )}
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg" variant="secondary" className="hover-lift font-semibold text-primary">
                <Link to="/components">
                  {getTranslation('Browse Components', 'Ver Componentes')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                asChild 
                size="lg" 
                variant="outline" 
                className="hover-lift bg-transparent border-white text-white hover:bg-white/20">
                <Link to="/register">
                  {getTranslation('Create Free Account', 'Criar Conta Gratuita')}
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="border-t py-6 md:py-8">
        <div className="container px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Bloqx Studio. 
              {getTranslation(
                ' All rights reserved.',
                ' Todos os direitos reservados.'
              )}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={toggleLanguage} className="text-muted-foreground hover:text-foreground">
              <Globe className="h-4 w-4 mr-1" />
              {language === 'en' ? 'PT-BR' : 'EN'}
            </Button>
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground">
              {getTranslation('Terms', 'Termos')}
            </Link>
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
              {getTranslation('Privacy', 'Privacidade')}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
