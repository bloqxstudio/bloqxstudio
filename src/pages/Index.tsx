import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import { ArrowRight, Check, Bot, MousePointer, PlayCircle, Globe } from 'lucide-react';
import { toast } from 'sonner';

const Index = () => {
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');
  
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);
  
  const toggleLanguage = () => {
    setLanguage(prevLang => prevLang === 'en' ? 'pt' : 'en');
  };
  
  const getTranslation = (en: string, pt: string) => {
    return language === 'pt' ? pt : en;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
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
        <section className="py-16 md:py-24 px-4 bg-gradient-to-br from-blue-600 to-blue-700 text-white overflow-hidden relative">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-[20%] left-[10%] w-64 h-64 rounded-full bg-yellow-300 filter blur-3xl"></div>
            <div className="absolute bottom-[30%] right-[5%] w-80 h-80 rounded-full bg-green-400 filter blur-3xl"></div>
          </div>
          
          <div className="container px-4 md:px-6 relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="flex flex-col space-y-8 animate-fade-up">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full flex items-center gap-2">
                    <Bot className="h-4 w-4 text-yellow-300" />
                    <span className="text-sm font-medium">
                      {getTranslation('BETA - 100% FREE', 'BETA - 100% GRÁTIS')}
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
                  <div className="absolute inset-0 bg-[url('/elementor-interface.jpg')] bg-cover bg-center opacity-90"></div>
                  
                  <div className="absolute top-4 left-4 flex space-x-3">
                    <div className="bg-blue-600 rounded-full p-2 w-8 h-8 flex items-center justify-center">
                      <img src="/wordpress-logo.png" alt="WordPress" className="w-5 h-5" />
                    </div>
                    <div className="bg-pink-600 rounded-full p-2 w-8 h-8 flex items-center justify-center">
                      <img src="/elementor-logo.png" alt="Elementor" className="w-5 h-5" />
                    </div>
                  </div>
                  
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button 
                      variant="default" 
                      size="lg" 
                      className="rounded-full p-8 bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/30"
                      onClick={() => {
                        toast.info(getTranslation(
                          'Video presentation coming soon!',
                          'Apresentação em vídeo em breve!'
                        ));
                      }}
                    >
                      <PlayCircle className="h-12 w-12 text-white" />
                    </Button>
                  </div>
                  
                  <div className="absolute bottom-6 right-6 animate-pulse">
                    <div className="p-2 bg-green-500 text-white rounded-md shadow-lg font-bold flex items-center gap-2 shadow-green-500/30">
                      {getTranslation('PUBLISH', 'PUBLICAR')}
                    </div>
                    <div className="absolute inset-0 bg-green-400 filter blur-md opacity-60 animate-pulse"></div>
                  </div>
                </div>
              </div>
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
