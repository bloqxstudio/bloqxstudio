
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

    // Analisar JSON para extrair metadados visuais
    let parsedJson: any = {};
    try {
      parsedJson = JSON.parse(jsonCode);
    } catch (error) {
      console.warn('Erro ao parsear JSON:', error);
      parsedJson = [];
    }

    // Extrair informações do componente
    const componentInfo = analyzeComponent(parsedJson, title, category, tags);
    
    // Gerar SVG baseado nas informações extraídas
    const svgContent = generateSVGPreview(componentInfo);
    
    // Converter SVG para base64
    const svgBase64 = btoa(svgContent);
    const previewUrl = `data:image/svg+xml;base64,${svgBase64}`;

    // Opcionalmente, salvar no storage do Supabase para cache
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Cache do preview gerado
    const fileName = `previews/${componentId}.svg`;
    const { error: uploadError } = await supabase.storage
      .from('component-previews')
      .upload(fileName, new Blob([svgContent], { type: 'image/svg+xml' }), {
        upsert: true
      });

    if (uploadError) {
      console.warn('Erro ao salvar preview no storage:', uploadError);
    }

    return new Response(
      JSON.stringify({ 
        previewUrl,
        cached: !uploadError,
        componentInfo 
      }),
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      }
    );
  } catch (error) {
    console.error("Erro na função generate-preview:", error);
    
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
    hasColumns: jsonString.includes('column')
  };

  // Detectar cores (procurar por códigos de cor hex)
  const colorMatches = jsonString.match(/#[0-9a-fA-F]{6}/g) || [];
  const primaryColor = colorMatches[0] || getCategoryColor(category);

  // Detectar layout
  const layout = {
    type: elements.hasColumns ? 'grid' : jsonString.includes('section') ? 'sections' : 'simple',
    columnCount: elements.hasColumns ? 2 : 1
  };

  return {
    title,
    category,
    tags,
    elements,
    primaryColor,
    layout,
    elementCount: Object.values(elements).filter(Boolean).length
  };
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

function generateSVGPreview(info: any): string {
  const { title, elements, primaryColor, layout } = info;
  
  return `
    <svg width="400" height="240" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${primaryColor}"/>
          <stop offset="100%" style="stop-color:${adjustColorBrightness(primaryColor, -30)}"/>
        </linearGradient>
        <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="1" fill="white" opacity="0.1"/>
        </pattern>
      </defs>
      
      <!-- Background -->
      <rect width="400" height="240" fill="url(#bg)"/>
      <rect width="400" height="240" fill="url(#dots)"/>
      
      <!-- Content area -->
      <rect x="20" y="20" width="360" height="200" rx="8" fill="white" opacity="0.1"/>
      
      <!-- Title -->
      <text x="40" y="50" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="white" opacity="0.9">
        ${title.length > 30 ? title.substring(0, 30) + '...' : title}
      </text>
      
      <!-- Layout representation -->
      ${generateLayoutElements(elements, layout)}
      
      <!-- Element indicators -->
      ${generateElementIndicators(elements)}
      
      <!-- Generated badge -->
      <circle cx="370" cy="30" r="4" fill="white" opacity="0.6"/>
    </svg>
  `;
}

function adjustColorBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

function generateLayoutElements(elements: any, layout: any): string {
  if (layout.type === 'grid') {
    return `
      <rect x="40" y="70" width="80" height="40" rx="4" fill="white" opacity="0.2"/>
      <rect x="140" y="70" width="80" height="40" rx="4" fill="white" opacity="0.2"/>
      <rect x="40" y="120" width="180" height="20" rx="4" fill="white" opacity="0.3"/>
    `;
  } else if (layout.type === 'sections') {
    return `
      <rect x="40" y="70" width="200" height="15" rx="4" fill="white" opacity="0.3"/>
      <rect x="40" y="95" width="160" height="40" rx="4" fill="white" opacity="0.2"/>
      <rect x="40" y="145" width="180" height="10" rx="4" fill="white" opacity="0.2"/>
    `;
  } else {
    return `
      <rect x="40" y="70" width="150" height="20" rx="4" fill="white" opacity="0.3"/>
      <rect x="40" y="100" width="120" height="60" rx="4" fill="white" opacity="0.2"/>
    `;
  }
}

function generateElementIndicators(elements: any): string {
  const indicators: string[] = [];
  let x = 40;
  
  if (elements.hasHeading) {
    indicators.push(`<rect x="${x}" y="190" width="12" height="8" rx="2" fill="white" opacity="0.7"/>`);
    x += 20;
  }
  if (elements.hasImage) {
    indicators.push(`<circle cx="${x + 6}" cy="194" r="4" fill="white" opacity="0.7"/>`);
    x += 20;
  }
  if (elements.hasButton) {
    indicators.push(`<rect x="${x}" y="190" width="12" height="8" rx="4" fill="white" opacity="0.7"/>`);
    x += 20;
  }
  
  return indicators.join('\n');
}
