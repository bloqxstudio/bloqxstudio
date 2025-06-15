
/**
 * Structure processing utilities for Elementor components
 */
import { flattenElements } from './elementProcessor';

// Função para aplicar a estrutura padrão com containers aninhados
export const applyStandardStructure = (elements: any[]): any[] => {
  if (!elements || elements.length === 0) return [];

  // Recolher todos os elementos originais
  const allElements = flattenElements(elements);
  
  // Criar a estrutura padrão
  const structuredComponent = [
    {
      elType: "container", // Section
      settings: {
        content_width: "full",
        flex_direction: "row",
        width: { unit: "%", size: 100 },
        margin: { top: "0", bottom: "0", left: "0", right: "0", unit: "px" },
        padding: { top: "0", bottom: "0", left: "0", right: "0", unit: "px" },
      },
      elements: [
        {
          elType: "container", // Padding
          settings: {
            content_width: "boxed",
            flex_direction: "column",
            padding: {
              top: { unit: "rem", size: 6, sizes: [] },
              bottom: { unit: "rem", size: 6, sizes: [] },
              left: { unit: "rem", size: 1, sizes: [] },
              right: { unit: "rem", size: 1, sizes: [] }
            },
            responsive_padding: {
              tablet: {
                top: { unit: "rem", size: 5, sizes: [] },
                bottom: { unit: "rem", size: 5, sizes: [] },
                left: { unit: "rem", size: 2, sizes: [] },
                right: { unit: "rem", size: 2, sizes: [] }
              },
              mobile: {
                top: { unit: "rem", size: 4, sizes: [] },
                bottom: { unit: "rem", size: 4, sizes: [] },
                left: { unit: "rem", size: 1, sizes: [] },
                right: { unit: "rem", size: 1, sizes: [] }
              }
            }
          },
          elements: [
            {
              elType: "container", // Row
              settings: {
                content_width: "full",
                flex_direction: "row",
                width: { unit: "%", size: 100 },
                padding: { top: "0", bottom: "0", left: "0", right: "0", unit: "px" },
                margin: { top: "0", bottom: "0", left: "auto", right: "auto", unit: "px" }
              },
              elements: [
                {
                  elType: "container", // Column
                  settings: {
                    content_width: "full",
                    flex_direction: "column",
                    flex_gap: {
                      unit: "px",
                      size: 24, // Gap padrão (múltiplo de 8)
                      sizes: []
                    },
                    content_position: "center"
                  },
                  elements: organizeWidgetsInContentGroups(allElements)
                }
              ]
            }
          ]
        }
      ]
    }
  ];
  
  return structuredComponent;
};

// Função para organizar widgets em grupos de conteúdo quando necessário
const organizeWidgetsInContentGroups = (widgets: any[]): any[] => {
  // Simplificação: colocar tudo em um único grupo de conteúdo
  // Em uma implementação mais completa, analisaríamos os tipos de widgets
  // e os agruparíamos de forma mais inteligente
  
  if (widgets.length <= 1) {
    return widgets;
  }
  
  // Para esta implementação básica, vamos agrupar todos os widgets em um content group
  return [{
    elType: "container", // Content Group
    settings: {
      content_width: "full",
      flex_direction: "column",
      flex_gap: {
        unit: "px",
        size: 16,
        sizes: []
      },
      content_position: "center",
      text_align: "center" // Centralizar texto por padrão
    },
    elements: widgets
  }];
};
