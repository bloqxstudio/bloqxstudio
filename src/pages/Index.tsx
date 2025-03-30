
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import ComponentCard from '@/components/ComponentCard';
import { getSampleCategories } from '@/lib/data';
import { Component } from '@/lib/database.types';
import { ArrowRight, Download, Code, Copy, Zap, Globe, Check, Bot, Sparkles, MousePointer } from 'lucide-react';
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

  // Fetch featured components from Supabase
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
        {/* Hero Section with WordPress & Elementor Branding */}
        <section className="py-16 md:py-24 px-4 bg-gradient-to-br from-blue-600/90 to-purple-800 text-white overflow-hidden relative">
          {/* Abstract Background Elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-[20%] left-[10%] w-64 h-64 rounded-full bg-yellow-300 filter blur-3xl"></div>
            <div className="absolute bottom-[30%] right-[5%] w-80 h-80 rounded-full bg-green-400 filter blur-3xl"></div>
            <div className="absolute top-[60%] left-[40%] w-40 h-40 rounded-full bg-pink-400 filter blur-3xl"></div>
          </div>
          
          <div className="container px-4 md:px-6 relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="flex flex-col space-y-8 animate-fade-up">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-yellow-300" />
                    <span className="text-sm font-medium">
                      {getTranslation('Powered by AI', 'Impulsionado por IA')}
                    </span>
                  </div>
                </div>
                
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight lg:text-6xl">
                  {getTranslation(
                    'Copy to publish - in seconds',
                    'Copie para publicar - em segundos'
                  )}
                </h1>
                
                <p className="text-lg sm:text-xl md:text-2xl text-white/90 max-w-[600px]">
                  {getTranslation(
                    'Stop designing Elementor websites from scratch. Build your next site in few seconds with our perfectly designed components.',
                    'Pare de criar sites Elementor do zero. Construa seu próximo site em poucos segundos com nossos componentes perfeitamente desenhados.'
                  )}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button 
                    asChild 
                    size="lg" 
                    className="bg-white text-blue-700 hover:bg-white/90 font-semibold"
                  >
                    <Link to="/components">
                      <MousePointer className="mr-2 h-5 w-5" />
                      {getTranslation('Browse Components', 'Ver Componentes')}
                    </Link>
                  </Button>
                  
                  <Button 
                    asChild 
                    variant="outline" 
                    size="lg" 
                    className="bg-transparent border-white text-white hover:bg-white/20"
                  >
                    <Link to="/register">
                      {getTranslation('Create Free Account', 'Criar Conta Gratuita')}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-white/80">
                  <div className="flex items-center">
                    <Check className="h-4 w-4 mr-1 text-green-400" />
                    {getTranslation('One-click copy', 'Cópia com um clique')}
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 mr-1 text-green-400" />
                    {getTranslation('AI-optimized', 'Otimizado por IA')}
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 mr-1 text-green-400" />
                    {getTranslation('Ready to use', 'Pronto para usar')}
                  </div>
                </div>
              </div>
              
              <div className="relative flex justify-center lg:justify-end">
                <div className="relative w-full max-w-[500px] aspect-video bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-2xl overflow-hidden border border-gray-700/50">
                  {/* Elementor Interface Mockup */}
                  <div className="absolute inset-0 bg-[url('/elementor-interface.jpg')] bg-cover bg-center opacity-90"></div>
                  
                  {/* Glowing Publish Button Highlight */}
                  <div className="absolute bottom-6 right-6 animate-pulse">
                    <div className="p-2 bg-green-500 text-white rounded-md shadow-lg font-bold flex items-center gap-2 shadow-green-500/30">
                      <Zap className="h-4 w-4" />
                      {getTranslation('PUBLISH', 'PUBLICAR')}
                    </div>
                    <div className="absolute inset-0 bg-green-400 filter blur-md opacity-60 animate-pulse"></div>
                  </div>
                  
                  {/* WordPress & Elementor Logos */}
                  <div className="absolute top-4 left-4 flex space-x-3">
                    <div className="bg-blue-600 rounded-full p-2 w-8 h-8 flex items-center justify-center">
                      <img src="/wordpress-logo.png" alt="WordPress" className="w-5 h-5" />
                    </div>
                    <div className="bg-pink-600 rounded-full p-2 w-8 h-8 flex items-center justify-center">
                      <img src="/elementor-logo.png" alt="Elementor" className="w-5 h-5" />
                    </div>
                  </div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute -bottom-6 -left-10 bg-white rounded-lg shadow-xl p-3 transform rotate-6">
                  <div className="flex items-center gap-2">
                    <Copy className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">
                      {getTranslation('Copied to clipboard!', 'Copiado para área de transferência!')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* AI-Powered Features Section */}
        <section className="py-20 bg-white">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center p-2 bg-blue-50 rounded-full mb-4">
                <Bot className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                {getTranslation(
                  'AI-Powered Elementor Components',
                  'Componentes Elementor Potencializados por IA'
                )}
              </h2>
              <p className="text-xl text-gray-600 max-w-[800px] mx-auto">
                {getTranslation(
                  'Our components are automatically optimized by AI for maximum performance, responsiveness and clean code.',
                  'Nossos componentes são automaticamente otimizados por IA para máxima performance, responsividade e código limpo.'
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100">
                <CardContent className="p-8">
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                    <Sparkles className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">
                    {getTranslation('AI Optimization', 'Otimização por IA')}
                  </h3>
                  <p className="text-gray-600">
                    {getTranslation(
                      'Every component is automatically analyzed and optimized for clean code, fast loading, and responsive design.',
                      'Cada componente é automaticamente analisado e otimizado para código limpo, carregamento rápido e design responsivo.'
                    )}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-100">
                <CardContent className="p-8">
                  <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                    <Copy className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">
                    {getTranslation('One-Click Copy', 'Cópia com Um Clique')}
                  </h3>
                  <p className="text-gray-600">
                    {getTranslation(
                      'Just copy our pre-built components and paste directly into Elementor. No coding required.',
                      'Apenas copie nossos componentes pré-construídos e cole diretamente no Elementor. Sem necessidade de programação.'
                    )}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-white border-green-100">
                <CardContent className="p-8">
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                    <Download className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">
                    {getTranslation('Multi-Component Export', 'Exportação Multi-Componentes')}
                  </h3>
                  <p className="text-gray-600">
                    {getTranslation(
                      'Select multiple components and export them as a single merged file ready to use in your Elementor projects.',
                      'Selecione múltiplos componentes e exporte-os como um único arquivo mesclado pronto para usar em seus projetos Elementor.'
                    )}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                {getTranslation('How It Works', 'Como Funciona')}
              </h2>
              <p className="text-xl text-gray-600 max-w-[700px] mx-auto">
                {getTranslation(
                  'Three simple steps to revolutionize your Elementor workflow',
                  'Três passos simples para revolucionar seu fluxo de trabalho no Elementor'
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Connecting Line (desktop only) */}
              <div className="hidden md:block absolute top-32 left-[16%] right-[16%] h-0.5 bg-blue-200"></div>

              {/* Step 1 */}
              <div className="relative flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold mb-6 relative z-10">1</div>
                <h3 className="text-xl font-semibold mb-3">
                  {getTranslation('Browse & Select', 'Navegue e Selecione')}
                </h3>
                <p className="text-gray-600">
                  {getTranslation(
                    'Browse our library of professionally designed components and select the ones you need.',
                    'Navegue por nossa biblioteca de componentes projetados profissionalmente e selecione os que você precisa.'
                  )}
                </p>
              </div>

              {/* Step 2 */}
              <div className="relative flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold mb-6 relative z-10">2</div>
                <h3 className="text-xl font-semibold mb-3">
                  {getTranslation('Copy or Download', 'Copie ou Baixe')}
                </h3>
                <p className="text-gray-600">
                  {getTranslation(
                    'Copy components to clipboard or download them for immediate use in Elementor.',
                    'Copie os componentes para a área de transferência ou baixe-os para uso imediato no Elementor.'
                  )}
                </p>
              </div>

              {/* Step 3 */}
              <div className="relative flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold mb-6 relative z-10">3</div>
                <h3 className="text-xl font-semibold mb-3">
                  {getTranslation('Paste & Publish', 'Cole e Publique')}
                </h3>
                <p className="text-gray-600">
                  {getTranslation(
                    'Paste into Elementor, adjust if needed, and publish your professional website.',
                    'Cole no Elementor, ajuste se necessário e publique seu site profissional.'
                  )}
                </p>
              </div>
            </div>
            
            <div className="text-center mt-16">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Link to="/components">
                  {getTranslation('Start Building Now', 'Comece a Construir Agora')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-gradient-to-br from-blue-900 to-purple-900 text-white">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                {getTranslation('What Our Users Say', 'O Que Nossos Usuários Dizem')}
              </h2>
              <p className="text-xl text-white/80 max-w-[700px] mx-auto">
                {getTranslation(
                  'Join thousands of web designers who are building websites 10x faster',
                  'Junte-se a milhares de web designers que estão construindo sites 10x mais rápido'
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Testimonial 1 */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Sparkles key={star} className="h-4 w-4 text-yellow-300" />
                    ))}
                  </div>
                  <p className="italic mb-6">
                    {getTranslation(
                      '"This tool has cut my development time in half. The AI-optimized components are cleaner than what I was hand-coding."',
                      '"Esta ferramenta reduziu meu tempo de desenvolvimento pela metade. Os componentes otimizados por IA são mais limpos do que o que eu estava codificando manualmente."'
                    )}
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-600 mr-3"></div>
                    <div>
                      <p className="font-semibold">Michael T.</p>
                      <p className="text-sm text-white/70">Web Developer</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Testimonial 2 */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Sparkles key={star} className="h-4 w-4 text-yellow-300" />
                    ))}
                  </div>
                  <p className="italic mb-6">
                    {getTranslation(
                      '"The multi-component export feature saved our agency so much time. We can now build full landing pages in minutes instead of hours."',
                      '"O recurso de exportação de múltiplos componentes economizou muito tempo para nossa agência. Agora podemos criar páginas de destino completas em minutos em vez de horas."'
                    )}
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-purple-600 mr-3"></div>
                    <div>
                      <p className="font-semibold">Sarah K.</p>
                      <p className="text-sm text-white/70">Agency Owner</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Testimonial 3 */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Sparkles key={star} className="h-4 w-4 text-yellow-300" />
                    ))}
                  </div>
                  <p className="italic mb-6">
                    {getTranslation(
                      '"As a freelancer, this tool has been a game-changer. I can deliver high-quality websites much faster while maintaining quality."',
                      '"Como freelancer, esta ferramenta mudou o jogo. Posso entregar sites de alta qualidade muito mais rápido, mantendo a qualidade."'
                    )}
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-green-600 mr-3"></div>
                    <div>
                      <p className="font-semibold">Carlos L.</p>
                      <p className="text-sm text-white/70">Freelance Designer</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Featured Components */}
        <section className="py-16 bg-white">
          <div className="container px-4 md:px-6">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  {getTranslation('Featured Components', 'Componentes em Destaque')}
                </h2>
                <p className="text-gray-600 mt-1">
                  {getTranslation(
                    'Start with our most popular pre-built blocks',
                    'Comece com nossos blocos pré-construídos mais populares'
                  )}
                </p>
              </div>
              <Button asChild variant="outline">
                <Link to="/components" className="flex items-center">
                  {getTranslation('View all', 'Ver todos')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-40 bg-gray-200 rounded-t-lg"></div>
                    <CardContent className="p-4">
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : featuredComponents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredComponents.slice(0, 3).map(component => (
                  <ComponentCard key={component.id} component={component} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-600">
                  {getTranslation(
                    'No components found. Add some components to get started!',
                    'Nenhum componente encontrado. Adicione alguns componentes para começar!'
                  )}
                </p>
                <Button asChild className="mt-4">
                  <Link to="/components/new">
                    {getTranslation('Add Component', 'Adicionar Componente')}
                  </Link>
                </Button>
              </div>
            )}
            
            <div className="text-center mt-10">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Link to="/components">
                  {getTranslation('Browse All Components', 'Ver Todos os Componentes')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
        
        {/* Pricing Section */}
        <section className="py-20 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl font-bold tracking-tighter mb-4">
                {getTranslation('Simple, Transparent Pricing', 'Preços Simples e Transparentes')}
              </h2>
              <p className="text-gray-600 max-w-[700px] mx-auto text-lg">
                {getTranslation(
                  'Get started for free. No credit card required.',
                  'Comece gratuitamente. Sem necessidade de cartão de crédito.'
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
              {/* Free Plan */}
              <Card className="border-2 border-gray-200 hover:border-gray-300 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <p className="text-gray-500 mb-1">
                      {getTranslation('Free', 'Grátis')}
                    </p>
                    <div className="flex items-end gap-1">
                      <h3 className="text-4xl font-bold">$0</h3>
                      <span className="text-gray-500 mb-1">
                        {getTranslation('/forever', '/para sempre')}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-6">
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
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>{getTranslation('Access to 20+ free components', 'Acesso a mais de 20 componentes gratuitos')}</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>{getTranslation('Copy & paste to Elementor', 'Copiar e colar para o Elementor')}</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>{getTranslation('Basic component selection', 'Seleção básica de componentes')}</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              {/* Pro Plan - Highlighted */}
              <Card className="border-2 border-blue-500 relative lg:scale-105 shadow-lg">
                <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-sm font-medium rounded-bl-lg rounded-tr-lg">
                  {getTranslation('Popular', 'Popular')}
                </div>
                <CardContent className="p-6 pt-10">
                  <div className="mb-4">
                    <p className="text-gray-500 mb-1">
                      {getTranslation('Pro', 'Pro')}
                    </p>
                    <div className="flex items-end gap-1">
                      <h3 className="text-4xl font-bold">$29</h3>
                      <span className="text-gray-500 mb-1">
                        {getTranslation('/month', '/mês')}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-6">
                    {getTranslation(
                      'Best value for professionals and small agencies',
                      'Melhor valor para profissionais e pequenas agências'
                    )}
                  </p>
                  
                  <Button className="w-full mb-6 bg-blue-600 hover:bg-blue-700">
                    {getTranslation('Go Pro', 'Seja Pro')}
                  </Button>
                  
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>{getTranslation('Access to 100+ premium components', 'Acesso a mais de 100 componentes premium')}</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>{getTranslation('Full multi-component selection', 'Seleção completa de múltiplos componentes')}</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>{getTranslation('Priority support', 'Suporte prioritário')}</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>{getTranslation('Monthly new components', 'Novos componentes mensais')}</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>{getTranslation('Save components in personal library', 'Salve componentes em sua biblioteca pessoal')}</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              {/* Agency Plan */}
              <Card className="border-2 border-gray-200 hover:border-gray-300 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <p className="text-gray-500 mb-1">
                      {getTranslation('Agency', 'Agência')}
                    </p>
                    <div className="flex items-end gap-1">
                      <h3 className="text-4xl font-bold">$99</h3>
                      <span className="text-gray-500 mb-1">
                        {getTranslation('/month', '/mês')}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-6">
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
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>{getTranslation('Everything in Pro plan', 'Tudo no plano Pro')}</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>{getTranslation('Unlimited team members', 'Membros ilimitados da equipe')}</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>{getTranslation('Custom component requests', 'Solicitações de componentes personalizados')}</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>{getTranslation('White-label option', 'Opção white-label')}</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-gradient-to-br from-blue-600 to-purple-700 text-white">
          <div className="container px-4 md:px-6 max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center p-2 bg-white/10 rounded-full mb-6">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {getTranslation(
                'Ready to build websites faster?',
                'Pronto para construir sites mais rápido?'
              )}
            </h2>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
              {getTranslation(
                'Join thousands of web designers using our AI-powered Elementor components library',
                'Junte-se a milhares de web designers usando nossa biblioteca de componentes para Elementor potencializada por IA'
              )}
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-white/90 font-semibold">
                <Link to="/components">
                  {getTranslation('Browse Components', 'Ver Componentes')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                asChild 
                size="lg" 
                variant="outline" 
                className="bg-transparent border-white text-white hover:bg-white/20">
                <Link to="/register">
                  {getTranslation('Create Free Account', 'Criar Conta Gratuita')}
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="border-t py-8 bg-white">
        <div className="container px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <p className="text-gray-600">
              &copy; {new Date().getFullYear()} Bloqx Studio. 
              {getTranslation(
                ' All rights reserved.',
                ' Todos os direitos reservados.'
              )}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={toggleLanguage} className="text-gray-500 hover:text-gray-800">
              <Globe className="h-4 w-4 mr-1" />
              {language === 'en' ? 'PT-BR' : 'EN'}
            </Button>
            <Link to="/terms" className="text-sm text-gray-600 hover:text-gray-800">
              {getTranslation('Terms', 'Termos')}
            </Link>
            <Link to="/privacy" className="text-sm text-gray-600 hover:text-gray-800">
              {getTranslation('Privacy', 'Privacidade')}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

