
import React from 'react';
import FullscreenPageWrapper from '@/components/layout/FullscreenPageWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { ArrowRight, Code, Palette, Zap, Crown } from 'lucide-react';
import { useAuth } from '@/features/auth';
import SubscriptionCard from '@/components/subscription/SubscriptionCard';

const Index = () => {
  const { user, isSubscribed } = useAuth();

  return (
    <FullscreenPageWrapper>
      <div className="flex flex-col min-h-screen">
        {/* Hero Section */}
        <section className="py-20 px-4 text-center bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto max-w-4xl">
            <div className="mb-6 flex justify-center">
              <Badge variant="secondary" className="px-4 py-2">
                <Crown className="w-4 h-4 mr-2" />
                Biblioteca Premium de Componentes
              </Badge>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Componentes Prontos
              <br />
              para Elementor
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Acelere seu desenvolvimento com nossa coleção premium de componentes para Elementor. 
              Mais de 500+ componentes profissionais prontos para usar.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link to="/components">
                  <ArrowRight className="mr-2 h-5 w-5" />
                  Explorar Componentes
                </Link>
              </Button>
              {!user && (
                <Button asChild variant="outline" size="lg">
                  <Link to="/register">
                    Criar Conta Grátis
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Subscription Section for Logged Users */}
        {user && (
          <section className="py-12 px-4">
            <div className="container mx-auto max-w-2xl">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">
                  {isSubscribed ? 'Sua Assinatura' : 'Desbloqueie Todo o Potencial'}
                </h2>
                <p className="text-muted-foreground">
                  {isSubscribed 
                    ? 'Gerencie sua assinatura premium abaixo'
                    : 'Tenha acesso completo a todos os componentes premium'
                  }
                </p>
              </div>
              <SubscriptionCard />
            </div>
          </section>
        )}

        {/* Features Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Por que escolher nossos componentes?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Criados por designers e desenvolvedores experientes, nossos componentes 
                são otimizados para performance e conversão.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <Code className="h-10 w-10 text-primary mb-4" />
                  <CardTitle>Código Limpo</CardTitle>
                  <CardDescription>
                    Todos os componentes seguem as melhores práticas de desenvolvimento, 
                    garantindo código limpo e otimizado.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Palette className="h-10 w-10 text-primary mb-4" />
                  <CardTitle>Design Profissional</CardTitle>
                  <CardDescription>
                    Designs modernos e responsivos que se adaptam perfeitamente 
                    a qualquer projeto ou marca.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Zap className="h-10 w-10 text-primary mb-4" />
                  <CardTitle>Implementação Rápida</CardTitle>
                  <CardDescription>
                    Importe e customize em segundos. Economize horas de desenvolvimento 
                    com nossos templates prontos.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-primary/5">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Comece hoje mesmo
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Junte-se a milhares de desenvolvedores que já aceleram seus projetos 
              com nossos componentes premium.
            </p>
            <Button asChild size="lg">
              <Link to="/components">
                <ArrowRight className="mr-2 h-5 w-5" />
                Ver Todos os Componentes
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </FullscreenPageWrapper>
  );
};

export default Index;
