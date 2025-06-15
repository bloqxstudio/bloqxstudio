
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import FullscreenPageWrapper from '@/components/layout/FullscreenPageWrapper';

const SubscriptionSuccess = () => {
  const { checkSubscription } = useSubscription();

  useEffect(() => {
    // Check subscription status when page loads
    const timer = setTimeout(() => {
      checkSubscription();
    }, 2000);

    return () => clearTimeout(timer);
  }, [checkSubscription]);

  return (
    <FullscreenPageWrapper>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center space-y-8">
          <div className="flex justify-center">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-green-600">
                Assinatura Ativada com Sucesso! 🎉
              </CardTitle>
              <CardDescription className="text-lg">
                Bem-vindo ao plano Premium! Sua assinatura foi processada e você já tem acesso completo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">O que você ganhou:</h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>✅ Acesso a todos os componentes premium</li>
                  <li>✅ Downloads ilimitados</li>
                  <li>✅ Suporte prioritário</li>
                  <li>✅ Novos componentes toda semana</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild className="flex-1">
                  <Link to="/components">
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Explorar Componentes
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/">
                    Voltar ao Início
                  </Link>
                </Button>
              </div>

              <div className="text-sm text-muted-foreground">
                <p>
                  Você receberá um email de confirmação em breve. Se tiver alguma dúvida, 
                  entre em contato com nosso suporte.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </FullscreenPageWrapper>
  );
};

export default SubscriptionSuccess;
