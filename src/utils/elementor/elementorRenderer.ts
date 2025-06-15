
import { Component } from '@/core/types';

export interface ElementorElement {
  id?: string;
  elType?: string;
  widgetType?: string;
  settings?: Record<string, any>;
  elements?: ElementorElement[];
}

export interface RenderedComponent {
  html: string;
  css: string;
  metadata: {
    hasImages: boolean;
    hasButtons: boolean;
    hasHeadings: boolean;
    columnCount: number;
    backgroundColor?: string;
    primaryColor?: string;
  };
}

export class ElementorRenderer {
  private baseCSS = `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f8f9fa;
    }
    
    .elementor-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .elementor-section {
      margin-bottom: 20px;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .elementor-column {
      padding: 20px;
    }
    
    .elementor-row {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
    }
    
    .elementor-col-100 { width: 100%; }
    .elementor-col-50 { width: calc(50% - 10px); }
    .elementor-col-33 { width: calc(33.333% - 14px); }
    .elementor-col-25 { width: calc(25% - 15px); }
    
    .elementor-heading {
      margin-bottom: 15px;
      font-weight: bold;
    }
    
    .elementor-heading h1 { font-size: 2.5rem; color: #1a1a1a; }
    .elementor-heading h2 { font-size: 2rem; color: #2a2a2a; }
    .elementor-heading h3 { font-size: 1.5rem; color: #3a3a3a; }
    .elementor-heading h4 { font-size: 1.25rem; color: #4a4a4a; }
    .elementor-heading h5 { font-size: 1.1rem; color: #5a5a5a; }
    .elementor-heading h6 { font-size: 1rem; color: #6a6a6a; }
    
    .elementor-text {
      margin-bottom: 15px;
      line-height: 1.7;
    }
    
    .elementor-button {
      display: inline-block;
      padding: 12px 24px;
      background: #007cba;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      font-weight: 500;
      transition: background 0.3s ease;
      border: none;
      cursor: pointer;
    }
    
    .elementor-button:hover {
      background: #005a87;
    }
    
    .elementor-image {
      max-width: 100%;
      height: auto;
      border-radius: 4px;
      margin-bottom: 15px;
    }
    
    .elementor-spacer {
      height: 20px;
    }
    
    @media (max-width: 768px) {
      .elementor-col-50,
      .elementor-col-33,
      .elementor-col-25 {
        width: 100%;
      }
      
      .elementor-row {
        flex-direction: column;
      }
    }
  `;

  parseElementorJson(jsonString: string): ElementorElement[] {
    try {
      // Tentar parsear JSON normalmente
      return JSON.parse(jsonString);
    } catch (error) {
      console.warn('Erro ao parsear JSON, tentando correção automática:', error);
      
      try {
        // Tentar corrigir JSON malformado
        let correctedJson = jsonString;
        
        // Remover trailing commas
        correctedJson = correctedJson.replace(/,(\s*[}\]])/g, '$1');
        
        // Corrigir aspas não fechadas
        correctedJson = correctedJson.replace(/("[^"]*)"([^"]*")/g, '$1\\"$2');
        
        // Tentar parsear novamente
        return JSON.parse(correctedJson);
      } catch (secondError) {
        console.error('Não foi possível corrigir o JSON:', secondError);
        return [];
      }
    }
  }

  renderComponent(component: Component): RenderedComponent {
    const elements = this.parseElementorJson(component.json_code || component.code || '[]');
    const metadata = this.analyzeElements(elements);
    
    const html = this.generateHTML(elements, component.title);
    const css = this.generateCSS(elements, metadata);
    
    return {
      html,
      css: this.baseCSS + css,
      metadata
    };
  }

  private analyzeElements(elements: ElementorElement[]) {
    let hasImages = false;
    let hasButtons = false;
    let hasHeadings = false;
    let columnCount = 0;
    let backgroundColor: string | undefined;
    let primaryColor: string | undefined;

    const analyze = (element: ElementorElement) => {
      if (element.widgetType === 'image') hasImages = true;
      if (element.widgetType === 'button') hasButtons = true;
      if (element.widgetType === 'heading') hasHeadings = true;
      if (element.elType === 'column') columnCount++;
      
      if (element.settings?.background_color) {
        backgroundColor = element.settings.background_color;
      }
      
      if (element.settings?.color || element.settings?.text_color) {
        primaryColor = element.settings.color || element.settings.text_color;
      }

      if (element.elements) {
        element.elements.forEach(analyze);
      }
    };

    elements.forEach(analyze);

    return {
      hasImages,
      hasButtons,
      hasHeadings,
      columnCount,
      backgroundColor,
      primaryColor
    };
  }

  private generateHTML(elements: ElementorElement[], title: string): string {
    const renderElement = (element: ElementorElement): string => {
      const settings = element.settings || {};
      
      switch (element.elType) {
        case 'section':
          return `
            <div class="elementor-section" style="${this.getSectionStyles(settings)}">
              ${element.elements?.map(renderElement).join('') || ''}
            </div>
          `;
          
        case 'column':
          const columnWidth = this.getColumnWidth(settings);
          return `
            <div class="elementor-column ${columnWidth}" style="${this.getColumnStyles(settings)}">
              ${element.elements?.map(renderElement).join('') || ''}
            </div>
          `;
          
        case 'widget':
          return this.renderWidget(element);
          
        default:
          if (element.elements) {
            return `<div class="elementor-row">${element.elements.map(renderElement).join('')}</div>`;
          }
          return '';
      }
    };

    const body = elements.map(renderElement).join('');
    
    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
      </head>
      <body>
        <div class="elementor-container">
          ${body}
        </div>
      </body>
      </html>
    `;
  }

  private renderWidget(element: ElementorElement): string {
    const settings = element.settings || {};
    
    switch (element.widgetType) {
      case 'heading':
        const tag = settings.header_size || 'h2';
        const text = settings.title || 'Título do Componente';
        return `
          <div class="elementor-heading">
            <${tag} style="${this.getTextStyles(settings)}">${text}</${tag}>
          </div>
        `;
        
      case 'text-editor':
        const content = settings.editor || 'Texto do componente aqui...';
        return `
          <div class="elementor-text" style="${this.getTextStyles(settings)}">
            ${content}
          </div>
        `;
        
      case 'button':
        const buttonText = settings.text || 'Clique Aqui';
        const buttonLink = settings.link?.url || '#';
        return `
          <a href="${buttonLink}" class="elementor-button" style="${this.getButtonStyles(settings)}">
            ${buttonText}
          </a>
        `;
        
      case 'image':
        const imageUrl = settings.image?.url || 'https://via.placeholder.com/400x200/e0e0e0/666?text=Imagem';
        const imageAlt = settings.image?.alt || 'Imagem do componente';
        return `
          <img src="${imageUrl}" alt="${imageAlt}" class="elementor-image" style="${this.getImageStyles(settings)}">
        `;
        
      case 'spacer':
        const height = settings.space?.size || 20;
        return `<div class="elementor-spacer" style="height: ${height}px;"></div>`;
        
      default:
        return `<div class="elementor-widget-placeholder" style="padding: 20px; background: #f5f5f5; border: 2px dashed #ddd; text-align: center; color: #999;">Widget: ${element.widgetType || 'unknown'}</div>`;
    }
  }

  private getSectionStyles(settings: any): string {
    const styles: string[] = [];
    
    if (settings.background_color) {
      styles.push(`background-color: ${settings.background_color}`);
    }
    
    if (settings.padding) {
      styles.push(`padding: ${settings.padding.top || 0}px ${settings.padding.right || 0}px ${settings.padding.bottom || 0}px ${settings.padding.left || 0}px`);
    }
    
    return styles.join('; ');
  }

  private getColumnStyles(settings: any): string {
    const styles: string[] = [];
    
    if (settings.background_color) {
      styles.push(`background-color: ${settings.background_color}`);
    }
    
    return styles.join('; ');
  }

  private getTextStyles(settings: any): string {
    const styles: string[] = [];
    
    if (settings.color) {
      styles.push(`color: ${settings.color}`);
    }
    
    if (settings.typography_font_size) {
      styles.push(`font-size: ${settings.typography_font_size}px`);
    }
    
    if (settings.typography_font_weight) {
      styles.push(`font-weight: ${settings.typography_font_weight}`);
    }
    
    return styles.join('; ');
  }

  private getButtonStyles(settings: any): string {
    const styles: string[] = [];
    
    if (settings.background_color) {
      styles.push(`background-color: ${settings.background_color}`);
    }
    
    if (settings.color) {
      styles.push(`color: ${settings.color}`);
    }
    
    return styles.join('; ');
  }

  private getImageStyles(settings: any): string {
    const styles: string[] = [];
    
    if (settings.width) {
      styles.push(`width: ${settings.width}px`);
    }
    
    if (settings.height) {
      styles.push(`height: ${settings.height}px`);
    }
    
    return styles.join('; ');
  }

  private getColumnWidth(settings: any): string {
    const width = settings._column_size || 100;
    
    if (width >= 100) return 'elementor-col-100';
    if (width >= 50) return 'elementor-col-50';
    if (width >= 33) return 'elementor-col-33';
    return 'elementor-col-25';
  }

  private generateCSS(elements: ElementorElement[], metadata: any): string {
    let customCSS = '';
    
    if (metadata.primaryColor) {
      customCSS += `
        .elementor-button {
          background-color: ${metadata.primaryColor} !important;
        }
      `;
    }
    
    if (metadata.backgroundColor) {
      customCSS += `
        .elementor-section {
          background-color: ${metadata.backgroundColor} !important;
        }
      `;
    }
    
    return customCSS;
  }
}

export const elementorRenderer = new ElementorRenderer();
