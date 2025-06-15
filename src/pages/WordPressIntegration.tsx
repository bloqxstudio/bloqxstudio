
import React from 'react';
import { Settings } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import WordPressSiteManager from '@/components/wordpress/WordPressSiteManager';

const WordPressIntegration = () => {
  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Integração WordPress</h1>
          <p className="text-muted-foreground text-lg">
            Conecte seu WordPress ao Superelements e importe componentes diretamente
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-6">
            <Settings className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Sites WordPress</h2>
          </div>
          
          <WordPressSiteManager />
        </div>
      </div>
    </PageWrapper>
  );
};

export default WordPressIntegration;
