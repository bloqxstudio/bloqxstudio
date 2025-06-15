
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { componentId, title, jsonCode, category, tags } = await req.json();
    
    if (!componentId || !jsonCode) {
      throw new Error('componentId e jsonCode são obrigatórios');
    }

    console.log(`🎨 Gerando preview para componente: ${title} (${componentId})`);

    // Analisar JSON para extrair metadados visuais
    let parsedJson: any = {};
    let isValidJson = true;
    
    try {
      parsedJson = JSON.parse(jsonCode);
      console.log('✅ JSON válido parseado com sucesso');
    } catch (error) {
      console.warn('⚠️ Erro ao parsear JSON, tentando correção automática:', error.message);
      isValidJson = false;
      
      try {
        // Tentar corrigir JSON malformado
        let correctedJson = jsonCode;
        
        // Remover trailing commas
        correctedJson = correctedJson.replace(/,(\s*[}\]])/g, '$1');
        
        // Corrigir aspas não fechadas básicas
        correctedJson = correctedJson.replace(/([{,]\s*\w+):/g, '"$1":');
        
        parsedJson = JSON.parse(correctedJson);
        console.log('✅ JSON corrigido e parseado com sucesso');
      } catch (secondError) {
        console.error('❌ Não foi possível corrigir o JSON:', secondError.message);
        parsedJson = [];
      }
    }

    // Extrair informações do componente
    const componentInfo = analyzeComponent(parsedJson, title, category, tags);
    console.log('📊 Análise do componente:', componentInfo);
    
    // Gerar HTML renderizado do componente
    const renderedHTML = generateComponentHTML(parsedJson, title, componentInfo);
    console.log('🏗️ HTML gerado com', renderedHTML.length, 'caracteres');
    
    // Tentar capturar screenshot com Puppeteer
    let previewUrl: string | null = null;
    
    try {
      previewUrl = await captureScreenshot(renderedHTML, componentId);
      console.log('📸 Screenshot capturado com sucesso:', previewUrl ? 'SIM' : 'NÃO');
    } catch (screenshotError) {
      console.warn('⚠️ Erro ao capturar screenshot:', screenshotError.message);
      console.log('🔄 Fallback para SVG avançado');
      
      // Fallback para SVG avançado
      const svgContent = generateAdvancedSVGPreview(componentInfo, title);
      const svgBase64 = btoa(svgContent);
      previewUrl = `data:image/svg+xml;base64,${svgBase64}`;
    }

    // Salvar no storage do Supabase para cache
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (previewUrl && !previewUrl.startsWith('data:')) {
      // Só fazer cache de URLs reais, não de data URLs
      const fileName = `previews/${componentId}.png`;
      
      try {
        const imageResponse = await fetch(previewUrl);
        const imageBlob = await imageResponse.blob();
        
        const { error: uploadError } = await supabase.storage
          .from('component-previews')
          .upload(fileName, imageBlob, {
            upsert: true,
            contentType: 'image/png'
          });

        if (uploadError) {
          console.warn('⚠️ Erro ao salvar preview no storage:', uploadError);
        } else {
          console.log('💾 Preview salvo no storage com sucesso');
        }
      } catch (uploadError) {
        console.warn('⚠️ Erro ao fazer upload do preview:', uploadError);
      }
    }

    return new Response(
      JSON.stringify({ 
        previewUrl,
        cached: false,
        componentInfo,
        method: previewUrl?.startsWith('data:') ? 'svg' : 'screenshot',
        isValidJson
      }),
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      }
    );
  } catch (error) {
    console.error("❌ Erro na função generate-preview:", error);
    
    return new Response(
      JSON.stringify({
        error: error.message,
        success: false
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      }
    );
  }
});

async function captureScreenshot(html: string, componentId: string): Promise<string | null> {
  // Simular captura de screenshot (Puppeteer não está disponível no Deno por padrão)
  // Em produção, isso seria implementado com uma API externa ou serviço de screenshot
  console.log('📸 Iniciando captura de screenshot...');
  
  // Por enquanto, retornar null para usar fallback SVG
  // TODO: Implementar serviço de screenshot externo (ex: htmlcsstoimage.com, puppeteer service)
  return null;
}

function analyzeComponent(jsonData: any, title: string, category: string, tags: string[]) {
  const jsonString = JSON.stringify(jsonData);
  
  // Detectar elementos presentes
  const elements = {
    hasHeading: jsonString.includes('heading') || jsonString.includes('title'),
    hasImage: jsonString.includes('image') || jsonString.includes('img'),
    hasButton: jsonString.includes('button'),
    hasVideo: jsonString.includes('video'),
    hasList: jsonString.includes('list'),
    hasForm: jsonString.includes('form'),
    hasColumns: jsonString.includes('column'),
    hasText: jsonString.includes('text-editor') || jsonString.includes('text'),
    hasIcon: jsonString.includes('icon'),
    hasSpacer: jsonString.includes('spacer')
  };

  // Detectar cores (procurar por códigos de cor hex e rgb)
  const colorMatches = jsonString.match(/#[0-9a-fA-F]{6}/g) || [];
  const rgbMatches = jsonString.match(/rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/g) || [];
  const primaryColor = colorMatches[0] || rgbMatches[0] || getCategoryColor(category);

  // Detectar layout e estrutura
  const columnMatches = jsonString.match(/"elType":"column"/g) || [];
  const sectionMatches = jsonString.match(/"elType":"section"/g) || [];
  
  const layout = {
    type: elements.hasColumns ? 'grid' : jsonString.includes('section') ? 'sections' : 'simple',
    columnCount: columnMatches.length,
    sectionCount: sectionMatches.length,
    complexity: Object.values(elements).filter(Boolean).length
  };

  // Detectar tamanhos e dimensões
  const widthMatches = jsonString.match(/"width":\s*(\d+)/g) || [];
  const heightMatches = jsonString.match(/"height":\s*(\d+)/g) || [];

  return {
    title,
    category,
    tags,
    elements,
    primaryColor,
    layout,
    elementCount: Object.values(elements).filter(Boolean).length,
    colors: [...colorMatches, ...rgbMatches].slice(0, 5),
    dimensions: {
      maxWidth: widthMatches.length > 0 ? Math.max(...widthMatches.map(w => parseInt(w.match(/\d+/)?.[0] || '0'))) : 400,
      maxHeight: heightMatches.length > 0 ? Math.max(...heightMatches.map(h => parseInt(h.match(/\d+/)?.[0] || '0'))) : 240
    }
  };
}

function generateComponentHTML(jsonData: any, title: string, componentInfo: any): string {
  // Gerar HTML mais realista baseado no JSON do Elementor
  const { elements, primaryColor, layout } = componentInfo;
  
  const baseCSS = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      line-height: 1.6; 
      color: #333; 
      background: #f8f9fa;
    }
    .container { 
      max-width: 1200px; 
      margin: 0 auto; 
      padding: 20px; 
      background: white;
      min-height: 400px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .section { 
      margin-bottom: 30px; 
      padding: 20px;
      border-radius: 6px;
    }
    .columns { 
      display: flex; 
      gap: 20px; 
      flex-wrap: wrap; 
    }
    .column { 
      flex: 1; 
      min-width: 250px; 
      padding: 15px;
    }
    h1, h2, h3, h4, h5, h6 { 
      margin-bottom: 15px; 
      color: ${primaryColor}; 
      font-weight: 600;
    }
    h1 { font-size: 2.5rem; }
    h2 { font-size: 2rem; }
    h3 { font-size: 1.5rem; }
    .text { 
      margin-bottom: 15px; 
      line-height: 1.7; 
    }
    .button { 
      display: inline-block; 
      padding: 12px 24px; 
      background: ${primaryColor}; 
      color: white; 
      text-decoration: none; 
      border-radius: 5px; 
      font-weight: 500;
      margin: 10px 5px;
      transition: all 0.3s ease;
    }
    .button:hover { 
      transform: translateY(-2px); 
      box-shadow: 0 4px 8px rgba(0,0,0,0.2); 
    }
    .image { 
      max-width: 100%; 
      height: auto; 
      border-radius: 8px; 
      margin-bottom: 15px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .icon { 
      width: 48px; 
      height: 48px; 
      background: ${primaryColor}; 
      border-radius: 50%; 
      display: inline-flex; 
      align-items: center; 
      justify-content: center; 
      color: white; 
      margin: 10px;
    }
    .spacer { 
      height: 20px; 
    }
    @media (max-width: 768px) {
      .columns { flex-direction: column; }
      .container { padding: 15px; }
      h1 { font-size: 2rem; }
      h2 { font-size: 1.5rem; }
    }
  `;
  
  let content = '';
  
  // Gerar conteúdo baseado nos elementos detectados
  if (layout.type === 'grid' && elements.hasColumns) {
    content += '<div class="columns">';
    for (let i = 0; i < Math.min(layout.columnCount, 4); i++) {
      content += '<div class="column">';
      if (elements.hasHeading) {
        content += `<h3>Título ${i + 1}</h3>`;
      }
      if (elements.hasText) {
        content += '<div class="text">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.</div>';
      }
      if (elements.hasImage) {
        content += '<img src="https://via.placeholder.com/300x200/e0e0e0/666?text=Imagem" alt="Placeholder" class="image">';
      }
      if (elements.hasButton) {
        content += '<a href="#" class="button">Saiba Mais</a>';
      }
      content += '</div>';
    }
    content += '</div>';
  } else {
    // Layout simples ou por seções
    if (elements.hasHeading) {
      content += '<h2>' + title + '</h2>';
    }
    
    if (elements.hasText) {
      content += '<div class="text">Este é um componente Elementor com conteúdo dinâmico. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</div>';
    }
    
    if (elements.hasImage) {
      content += '<img src="https://via.placeholder.com/600x300/e0e0e0/666?text=Imagem+Principal" alt="Imagem Principal" class="image">';
    }
    
    if (elements.hasButton) {
      content += '<a href="#" class="button">Botão Principal</a>';
      if (layout.complexity > 3) {
        content += '<a href="#" class="button" style="background: #6c757d;">Botão Secundário</a>';
      }
    }
    
    if (elements.hasIcon) {
      content += '<div class="icon">⭐</div>';
    }
    
    if (elements.hasSpacer) {
      content += '<div class="spacer"></div>';
    }
  }
  
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>${baseCSS}</style>
    </head>
    <body>
      <div class="container">
        <div class="section">
          ${content}
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateAdvancedSVGPreview(info: any, title: string): string {
  const { elements, primaryColor, layout } = info;
  
  return `
    <svg width="400" height="240" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${primaryColor}"/>
          <stop offset="100%" style="stop-color:${adjustColorBrightness(primaryColor, -20)}"/>
        </linearGradient>
        <pattern id="grid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="0.5" fill="white" opacity="0.3"/>
        </pattern>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <dropShadow dx="2" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.2)"/>
        </filter>
      </defs>
      
      <!-- Background -->
      <rect width="400" height="240" fill="url(#bg)"/>
      <rect width="400" height="240" fill="url(#grid)"/>
      
      <!-- Content container -->
      <rect x="15" y="15" width="370" height="210" rx="8" fill="white" opacity="0.95" filter="url(#shadow)"/>
      
      <!-- Title -->
      <text x="30" y="45" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#333">
        ${title.length > 35 ? title.substring(0, 35) + '...' : title}
      </text>
      
      <!-- Layout representation -->
      ${generateAdvancedLayoutElements(elements, layout)}
      
      <!-- Element indicators -->
      ${generateAdvancedElementIndicators(elements)}
      
      <!-- Category badge -->
      <rect x="320" y="20" width="60" height="20" rx="10" fill="${primaryColor}" opacity="0.8"/>
      <text x="350" y="32" font-family="Arial, sans-serif" font-size="9" fill="white" text-anchor="middle">
        ${info.category.split('-')[0]}
      </text>
      
      <!-- Auto-generated badge -->
      <circle cx="370" cy="220" r="6" fill="white" opacity="0.9"/>
      <circle cx="370" cy="220" r="3" fill="${primaryColor}"/>
    </svg>
  `;
}

function generateAdvancedLayoutElements(elements: any, layout: any): string {
  const { type, columnCount, complexity } = layout;
  
  if (type === 'grid' && columnCount > 1) {
    let gridElements = '';
    const colWidth = Math.min(80, 300 / columnCount);
    
    for (let i = 0; i < Math.min(columnCount, 4); i++) {
      const x = 30 + (i * (colWidth + 10));
      gridElements += `
        <rect x="${x}" y="60" width="${colWidth}" height="50" rx="4" fill="white" opacity="0.8" stroke="${elements.primaryColor || '#ddd'}" stroke-width="1"/>
        <rect x="${x + 5}" y="70" width="${colWidth - 10}" height="8" rx="2" fill="#f0f0f0"/>
        <rect x="${x + 5}" y="85" width="${colWidth - 20}" height="20" rx="2" fill="#e0e0e0"/>
      `;
    }
    return gridElements;
  } else if (type === 'sections') {
    return `
      <rect x="30" y="60" width="340" height="25" rx="4" fill="white" opacity="0.7"/>
      <rect x="30" y="95" width="280" height="40" rx="4" fill="white" opacity="0.8"/>
      <rect x="30" y="145" width="200" height="15" rx="4" fill="white" opacity="0.6"/>
      <rect x="30" y="170" width="320" height="30" rx="4" fill="white" opacity="0.7"/>
    `;
  } else {
    return `
      <rect x="30" y="60" width="250" height="20" rx="4" fill="white" opacity="0.8"/>
      <rect x="30" y="90" width="200" height="60" rx="4" fill="white" opacity="0.7"/>
      <rect x="30" y="160" width="150" height="15" rx="4" fill="white" opacity="0.6"/>
    `;
  }
}

function generateAdvancedElementIndicators(elements: any): string {
  const indicators: string[] = [];
  let x = 30;
  
  const addIndicator = (icon: string, tooltip: string) => {
    indicators.push(`
      <circle cx="${x + 6}" cy="206" r="8" fill="white" opacity="0.9"/>
      <text x="${x + 6}" y="210" font-family="Arial, sans-serif" font-size="8" fill="#666" text-anchor="middle">${icon}</text>
    `);
    x += 20;
  };
  
  if (elements.hasHeading) addIndicator('H', 'Heading');
  if (elements.hasImage) addIndicator('🖼', 'Image');
  if (elements.hasButton) addIndicator('🔘', 'Button');
  if (elements.hasText) addIndicator('T', 'Text');
  if (elements.hasIcon) addIndicator('⭐', 'Icon');
  if (elements.hasVideo) addIndicator('▶', 'Video');
  
  return indicators.join('\n');
}

function getCategoryColor(category: string): string {
  const categoryColors: Record<string, string> = {
    'cabecalho': '#3b82f6',
    'secoes-hero': '#8b5cf6',
    'destaques': '#10b981',
    'depoimentos': '#f59e0b',
    'rodape': '#6b7280',
    'contato': '#06b6d4',
    'precos': '#6366f1',
    'equipe': '#14b8a6',
    'default': '#64748b'
  };
  
  return categoryColors[category] || categoryColors.default;
}

function adjustColorBrightness(hex: string, percent: number): string {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Parse RGB values
  const num = parseInt(hex, 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  
  return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}
