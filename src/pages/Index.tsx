
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import { ArrowRight, Check, MousePointer, Globe } from 'lucide-react';

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
        <section className="py-16 md:py-24 px-4 bg-background text-foreground overflow-hidden relative">
          <div className="container px-4 md:px-6 relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="flex flex-col space-y-8 animate-fade-up">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight lg:text-6xl">
                  {getTranslation(
                    'Copy to publish - in seconds',
                    'Copie para publicar - em segundos'
                  )}
                </h1>
                
                <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-[600px]">
                  {getTranslation(
                    'Stop designing Elementor websites from scratch. Build your next site in few seconds with our perfectly designed components.',
                    'Pare de criar sites Elementor do zero. Construa seu próximo site em poucos segundos com nossos componentes perfeitamente desenhados.'
                  )}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button 
                    asChild 
                    size="lg" 
                    className="font-semibold"
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
                  >
                    <Link to="/register">
                      {getTranslation('Create Free Account', 'Criar Conta Gratuita')}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Check className="h-4 w-4 mr-1 text-green-500" />
                    {getTranslation('One-click copy', 'Cópia com um clique')}
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 mr-1 text-green-500" />
                    {getTranslation('AI-optimized', 'Otimizado por IA')}
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 mr-1 text-green-500" />
                    {getTranslation('Ready to use', 'Pronto para usar')}
                  </div>
                </div>
              </div>
              
              <div className="relative flex justify-center lg:justify-end">
                <div className="w-full max-w-[600px] aspect-video rounded-lg shadow-lg overflow-hidden border">
                  <iframe
                      width="100%"
                      height="100%"
                      src="https://www.youtube.com/embed/D8EaSEQK0zw?autoplay=1&controls=0&showinfo=0&modestbranding=1&rel=0&mute=1&loop=1&playlist=D8EaSEQK0zw"
                      title="YouTube video player"
                      frameBorder="0"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="border-t py-8 bg-background">
        <div className="container px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <p className="text-muted-foreground">
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
