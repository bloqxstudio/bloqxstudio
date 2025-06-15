
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, RefreshCw } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const SubscriptionCard = () => {
  const { 
    subscribed, 
    subscription_tier, 
    subscription_end, 
    isLoading, 
    createCheckout, 
    openCustomerPortal, 
    checkSubscription 
  } = useSubscription();

  const formatEndDate = (dateString: string) => {
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  if (subscribed) {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              <CardTitle className="text-primary">Assinatura Ativa</CardTitle>
            </div>
            <Badge variant="default" className="bg-green-100 text-green-800">
              {subscription_tier || 'Premium'}
            </Badge>
          </div>
          <CardDescription>
            Você tem acesso completo a todos os recursos premium
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {subscription_end && (
            <div className="text-sm text-muted-foreground">
              <strong>Próxima cobrança:</strong> {formatEndDate(subscription_end)}
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={openCustomerPortal} 
              disabled={isLoading}
              className="flex-1"
            >
              Gerenciar Assinatura
            </Button>
            <Button 
              onClick={checkSubscription} 
              disabled={isLoading}
              variant="outline"
              size="icon"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5" />
          Assinatura Premium
        </CardTitle>
        <CardDescription>
          Acesso completo a todos os recursos e componentes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-3xl font-bold text-primary">
          R$ 47<span className="text-base font-normal text-muted-foreground">/mês</span>
        </div>
        
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            <span>Acesso a todos os componentes</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            <span>Downloads ilimitados</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            <span>Suporte prioritário</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            <span>Novos componentes toda semana</span>
          </li>
        </ul>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={createCheckout} 
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? 'Carregando...' : 'Assinar Agora'}
          </Button>
          <Button 
            onClick={checkSubscription} 
            disabled={isLoading}
            variant="outline"
            size="icon"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionCard;
