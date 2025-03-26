
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PlaceholderImage } from '@/components/ui/placeholder-image';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const WireframeExample = () => {
  return (
    <Card className="overflow-hidden shadow-md">
      <CardContent className="p-0">
        <div className="bg-gray-100 p-8 space-y-8">
          {/* Hero Section */}
          <section className="hero_wrapper bg-white rounded-lg p-8 md:p-12 shadow-sm">
            <div className="container mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="hero_conteudo space-y-6">
                  <h1 className="hero_titulo text-4xl font-semibold text-gray-800">
                    Título Principal
                  </h1>
                  <p className="hero_texto text-gray-600">
                    Texto de descrição aqui. Este é um texto genérico que serve como placeholder para o conteúdo real que será exibido neste componente.
                  </p>
                  <Button className="hero_botao flex items-center gap-2 bg-black text-white hover:bg-gray-800">
                    Botão Principal <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
                <div className="hero_imagem-wrapper">
                  <PlaceholderImage aspectRatio="video" text="Imagem Destaque" />
                </div>
              </div>
            </div>
          </section>
          
          {/* Features Section */}
          <section className="recursos_wrapper bg-gray-50 rounded-lg p-8 md:p-12 shadow-sm">
            <div className="container mx-auto">
              <div className="text-center mb-12">
                <h2 className="recursos_titulo text-3xl font-semibold text-gray-800 mb-4">
                  Seção de Recursos
                </h2>
                <p className="recursos_subtitulo text-gray-600 max-w-2xl mx-auto">
                  Texto de apoio para explicar os recursos. Descrição geral sobre os itens abaixo.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className={`recurso${i}_container bg-white p-6 rounded-lg shadow-sm`}>
                    <div className={`recurso${i}_icone-wrapper mb-4 bg-gray-200 w-12 h-12 rounded-full flex items-center justify-center`}>
                      <span className="text-gray-600">{i}</span>
                    </div>
                    <h3 className={`recurso${i}_titulo text-xl font-medium text-gray-800 mb-2`}>
                      Item da Lista
                    </h3>
                    <p className={`recurso${i}_texto text-gray-600`}>
                      Descrição do item. Este é um texto genérico usado como placeholder.
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
          
          {/* Testimonial Section */}
          <section className="depoimento_wrapper bg-white rounded-lg p-8 md:p-12 shadow-sm">
            <div className="container mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="depoimento_imagem-wrapper">
                  <PlaceholderImage aspectRatio="square" text="Imagem Depoimento" />
                </div>
                <div className="depoimento_conteudo space-y-6">
                  <div className="depoimento_citacao text-gray-800 text-lg italic">
                    "Este é um texto de depoimento genérico. Ele serve como placeholder para uma citação real que seria exibida neste componente."
                  </div>
                  <div className="depoimento_autor text-gray-700 font-medium">
                    Nome da Pessoa, Cargo, Empresa
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </CardContent>
    </Card>
  );
};

export default WireframeExample;
