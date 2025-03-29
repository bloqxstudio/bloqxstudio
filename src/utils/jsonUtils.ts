
export const validateJson = (jsonString: string): boolean => {
  try {
    JSON.parse(jsonString);
    return true;
  } catch (e) {
    return false;
  }
};

export const validateElementorJson = (jsonObj: any): boolean => {
  // Validação básica da estrutura
  if (!jsonObj || typeof jsonObj !== 'object') return false;
  
  // Verificar o formato 1: estrutura com "type": "elementor"
  if (jsonObj.type === "elementor" && Array.isArray(jsonObj.elements)) {
    return true;
  }
  
  // Verificar o formato 2: estrutura com "content" contendo elementos
  if (jsonObj.content && Array.isArray(jsonObj.content)) {
    return true;
  }
  
  // Verificar o formato 3: estrutura direta de elementos
  if (Array.isArray(jsonObj) && jsonObj.length > 0 && jsonObj[0].elType) {
    return true;
  }
  
  // Verificar se é uma exportação de página do Elementor
  if (jsonObj.content && jsonObj.page_settings) {
    return true;
  }
  
  return false;
};

export const cleanElementorJson = (jsonString: string, removeStyles = false, wrapInContainer = true): string => {
  try {
    // Validar primeiro
    if (!validateJson(jsonString)) {
      throw new Error('Formato JSON inválido');
    }

    // Analisar o JSON
    const jsonObj = JSON.parse(jsonString);
    let elements = [];
    
    // Determinar onde estão os elementos com base na estrutura
    if (jsonObj.type === "elementor" && Array.isArray(jsonObj.elements)) {
      // Formato 1: estrutura com type: "elementor"
      elements = jsonObj.elements;
    } else if (jsonObj.content && Array.isArray(jsonObj.content)) {
      // Formato 2: estrutura com "content" contendo elementos
      elements = jsonObj.content;
    } else if (Array.isArray(jsonObj) && jsonObj.length > 0 && jsonObj[0].elType) {
      // Formato 3: estrutura direta de elementos
      elements = jsonObj;
    } else if (jsonObj.content && jsonObj.page_settings) {
      // Exportação de página completa
      elements = [jsonObj.content];
    } else {
      // Tente encontrar elementos aninhados de alguma forma
      if (Array.isArray(jsonObj) && jsonObj.length > 0) {
        // Pode ser um array de elementos
        elements = jsonObj;
      } else {
        throw new Error('Estrutura JSON incompatível');
      }
    }

    // Sempre transformar elementos para container
    elements = transformElementsToContainer(elements);

    // Formato básico
    const cleaned = {
      type: "elementor",
      siteurl: jsonObj.siteurl || "https://example.com/",
      elements: elements || []
    };

    return JSON.stringify(cleaned, null, 2);
  } catch (e) {
    console.error("Erro ao limpar JSON:", e);
    return jsonString; // Retornar o original em caso de erro
  }
};

// Função para transformar todos os elType para "container"
const transformElementsToContainer = (elements: any[]): any[] => {
  if (!elements || elements.length === 0) return [];
  
  return elements.map(element => {
    // Clonar o elemento para não modificar o original
    const newElement = { ...element };
    
    // Se o elemento for uma seção ou coluna, transformar em container
    if (newElement.elType === "section" || newElement.elType === "column") {
      newElement.elType = "container";
      
      // Ajustar configurações para container
      if (newElement.settings) {
        // Configurações específicas de container
        newElement.settings = {
          ...newElement.settings,
          content_width: newElement.settings.content_width || {
            unit: "px",
            size: 1140,
            sizes: []
          },
          flex_gap: newElement.settings.flex_gap || {
            unit: "px",
            size: 10,
            sizes: []
          },
          flex_direction: newElement.settings.flex_direction || "row",
          flex_wrap: newElement.settings.flex_wrap || "wrap",
          content_position: newElement.settings.content_position || "center"
        };
      }
    }
    
    // Processar elementos filhos recursivamente
    if (newElement.elements && Array.isArray(newElement.elements)) {
      newElement.elements = transformElementsToContainer(newElement.elements);
    }
    
    return newElement;
  });
};

// Função para remover propriedades de estilo recursivamente
const removeStyleProperties = (elements: any[]): any[] => {
  if (!elements || !Array.isArray(elements)) return [];
  
  return elements.map(element => {
    // Clonar o elemento
    const newElement = { ...element };
    
    // Processar configurações
    if (newElement.settings && typeof newElement.settings === 'object') {
      // Manter apenas propriedades essenciais e remover estilos
      const cleanSettings: any = {};
      
      // Lista de propriedades a manter mesmo
      const essentialProps = [
        'content_width', 'structure', '_title', 'html_tag',
        'title', 'editor', 'text', 'link', 'url', 'selected_icon',
        'css_classes', 'image', 'form_fields', 'form_name', 'email_to',
        'button_text'
      ];
      
      // Propriedades de layout a preservar
      const layoutProps = [
        'width', 'height', '_element_width', '_element_custom_width', 
        'content_position', 'flex_', 'gap', 'padding', 'margin',
        '_margin', '_padding', 'size', 'flex_direction', 'flex_wrap',
        'space', 'align', 'object-fit'
      ];
      
      // Copiar apenas propriedades essenciais
      Object.keys(newElement.settings).forEach(key => {
        const isEssential = essentialProps.some(prop => key.includes(prop));
        const isLayout = layoutProps.some(prop => key.includes(prop));
        
        // Remover propriedades começando com '__globals__' e certos prefixos
        const isGlobal = key.startsWith('__globals__');
        const isUnwanted = ['_motion_fx', 'animation', 'motion_fx', 'background_overlay', 'custom_css'].some(
          prefix => key.includes(prefix)
        );
        
        if ((isEssential || isLayout) && !isGlobal && !isUnwanted) {
          cleanSettings[key] = newElement.settings[key];
        }
      });
      
      newElement.settings = cleanSettings;
    }
    
    // Process child elements recursively
    if (newElement.elements && Array.isArray(newElement.elements)) {
      newElement.elements = removeStyleProperties(newElement.elements);
    }
    
    return newElement;
  });
};

// Função para gerar um template padrão de JSON Elementor conforme padrão Bloqxkit
export const generateBloqxkitElementorTemplate = (templateType = 'hero'): string => {
  let template;
  
  switch (templateType.toLowerCase()) {
    case 'hero':
      template = {
        type: "elementor",
        siteurl: "https://bloqxkit.com/",
        elements: [
          {
            elType: "container",
            _title: "01_Hero_Wireframe_Base",
            settings: {
              container_type: "flex",
              content_width: "boxed",
              flex_direction: "row",
              gap: { unit: "px", size: 40 },
              padding: { unit: "px", top: 80, bottom: 80, left: 20, right: 20 },
              background_background: "classic",
              background_color: "#ffffff"
            },
            elements: [
              {
                elType: "container",
                settings: {
                  width: { unit: "%", size: 60 },
                  flex_direction: "column",
                  align_self: "center",
                  padding: { unit: "px", right: 20 }
                },
                elements: [
                  {
                    elType: "widget",
                    widgetType: "heading",
                    settings: {
                      title: "Isto é uma headline - o que você mais quer vender",
                      align: "left",
                      title_color: "#222222",
                      typography_typography: "custom",
                      typography_font_family: "Poppins",
                      typography_font_size: { unit: "px", size: 42 },
                      typography_font_weight: "600",
                      typography_line_height: { unit: "em", size: 1.2 }
                    }
                  },
                  {
                    elType: "widget",
                    widgetType: "text-editor",
                    settings: {
                      editor: "<p>Esta é a sua subheadline que complementa a headline principal e explica mais sobre o seu produto ou serviço.</p>",
                      align: "left",
                      text_color: "#666666",
                      typography_typography: "custom",
                      typography_font_family: "Inter",
                      typography_font_size: { unit: "px", size: 18 },
                      typography_line_height: { unit: "em", size: 1.6 }
                    }
                  },
                  {
                    elType: "widget",
                    widgetType: "button",
                    settings: {
                      text: "CLIQUE AQUI",
                      align: "left",
                      background_color: "#4361EE",
                      button_text_color: "#FFFFFF",
                      hover_color: "#FFFFFF",
                      button_background_hover_color: "#3046C0",
                      border_radius: { unit: "px", top: 5, right: 5, bottom: 5, left: 5 },
                      text_padding: { unit: "px", top: 15, right: 30, bottom: 15, left: 30 },
                      typography_typography: "custom",
                      typography_font_family: "Poppins",
                      typography_font_size: { unit: "px", size: 16 },
                      typography_font_weight: "700"
                    }
                  }
                ]
              },
              {
                elType: "container",
                settings: {
                  width: { unit: "%", size: 40 },
                  content_position: "center",
                  background_background: "classic",
                  border_radius: { unit: "px", top: 8, right: 8, bottom: 8, left: 8 },
                  overflow: "hidden"
                },
                elements: [
                  {
                    elType: "widget",
                    widgetType: "image",
                    settings: {
                      image: { url: "https://via.placeholder.com/500x400/f0f0f0/cccccc", id: 123 },
                      image_size: "full"
                    }
                  }
                ]
              }
            ]
          }
        ]
      };
      break;
      
    case 'form':
      template = {
        type: "elementor",
        siteurl: "https://bloqxkit.com/",
        elements: [
          {
            elType: "container",
            _title: "02_Formulario_Lead",
            settings: {
              background_background: "classic",
              background_color: "#f8f9fa",
              border_radius: { unit: "px", top: 12, right: 12, bottom: 12, left: 12 },
              box_shadow_box_shadow_type: "yes",
              box_shadow_box_shadow: { horizontal: 0, vertical: 4, blur: 20, spread: 0, color: "rgba(0,0,0,0.1)" },
              padding: { unit: "px", top: 40, right: 40, bottom: 40, left: 40 },
              content_width: "boxed",
              flex_direction: "column",
              align_items: "center"
            },
            elements: [
              {
                elType: "widget",
                widgetType: "heading",
                settings: {
                  title: "Receba nosso conteúdo exclusivo",
                  align: "center",
                  title_color: "#333333",
                  typography_typography: "custom",
                  typography_font_family: "Poppins",
                  typography_font_size: { unit: "px", size: 28 },
                  typography_font_weight: "600",
                  typography_line_height: { unit: "em", size: 1.3 }
                }
              },
              {
                elType: "widget",
                widgetType: "text-editor",
                settings: {
                  editor: "<p>Preencha o formulário abaixo para receber nossas dicas e novidades diretamente no seu email.</p>",
                  align: "center",
                  text_color: "#666666",
                  typography_typography: "custom",
                  typography_font_family: "Inter",
                  typography_font_size: { unit: "px", size: 16 },
                  typography_line_height: { unit: "em", size: 1.5 }
                }
              },
              {
                elType: "widget",
                widgetType: "form",
                settings: {
                  form_name: "Lead Capture Form",
                  form_fields: [
                    {
                      field_type: "text",
                      field_label: "Nome",
                      field_placeholder: "Seu nome completo",
                      field_required: "yes",
                      width: "100",
                      _id: "name"
                    },
                    {
                      field_type: "email",
                      field_label: "Email",
                      field_placeholder: "seu@email.com",
                      field_required: "yes",
                      width: "100",
                      _id: "email"
                    }
                  ],
                  button_text: "QUERO RECEBER",
                  button_size: "md",
                  button_width: "100",
                  button_align: "center",
                  button_background_color: "#4361EE",
                  button_text_color: "#ffffff",
                  button_hover_background_color: "#3046C0",
                  button_hover_color: "#ffffff",
                  button_border_radius: { unit: "px", top: 5, right: 5, bottom: 5, left: 5 },
                  button_text_padding: { unit: "px", top: 15, right: 30, bottom: 15, left: 30 },
                  button_typography_typography: "custom",
                  button_typography_font_family: "Poppins",
                  button_typography_font_size: { unit: "px", size: 16 },
                  button_typography_font_weight: "700"
                }
              }
            ]
          }
        ]
      };
      break;
      
    case 'features':
      template = {
        type: "elementor",
        siteurl: "https://bloqxkit.com/",
        elements: [
          {
            elType: "container",
            _title: "03_Features_Grid",
            settings: {
              content_width: "boxed",
              flex_direction: "column",
              padding: { unit: "px", top: 80, bottom: 80, left: 20, right: 20 },
              background_background: "classic",
              background_color: "#ffffff",
              gap: { unit: "px", size: 50 }
            },
            elements: [
              {
                elType: "container",
                settings: {
                  flex_direction: "column",
                  align_items: "center",
                  max_width: { unit: "px", size: 700 },
                  margin: { unit: "px", top: "0", right: "auto", bottom: "0", left: "auto" },
                  gap: { unit: "px", size: 20 }
                },
                elements: [
                  {
                    elType: "widget",
                    widgetType: "heading",
                    settings: {
                      title: "Recursos Principais",
                      align: "center",
                      title_color: "#222222",
                      typography_typography: "custom",
                      typography_font_family: "Poppins",
                      typography_font_size: { unit: "px", size: 36 },
                      typography_font_weight: "600",
                      typography_line_height: { unit: "em", size: 1.2 }
                    }
                  },
                  {
                    elType: "widget",
                    widgetType: "text-editor",
                    settings: {
                      editor: "<p>Conheça os principais recursos da nossa plataforma projetados para garantir a melhor experiência.</p>",
                      align: "center",
                      text_color: "#666666",
                      typography_typography: "custom",
                      typography_font_family: "Inter",
                      typography_font_size: { unit: "px", size: 18 },
                      typography_line_height: { unit: "em", size: 1.6 }
                    }
                  }
                ]
              },
              {
                elType: "container",
                settings: {
                  flex_direction: "row",
                  flex_wrap: "wrap",
                  gap: { unit: "px", size: 30 },
                  margin: { unit: "px", top: 30, right: 0, bottom: 0, left: 0 }
                },
                elements: [
                  {
                    elType: "container",
                    settings: {
                      width: { unit: "%", size: 30 },
                      flex_direction: "column",
                      background_background: "classic",
                      background_color: "#f8f9fa",
                      border_radius: { unit: "px", top: 8, right: 8, bottom: 8, left: 8 },
                      padding: { unit: "px", top: 30, right: 30, bottom: 30, left: 30 },
                      gap: { unit: "px", size: 15 },
                    },
                    elements: [
                      {
                        elType: "widget",
                        widgetType: "icon",
                        settings: {
                          icon: "fas fa-bolt",
                          primary_color: "#4361EE",
                          size: { unit: "px", size: 40 }
                        }
                      },
                      {
                        elType: "widget",
                        widgetType: "heading",
                        settings: {
                          title: "Rápido & Fácil",
                          header_size: "h3",
                          title_color: "#222222",
                          typography_typography: "custom",
                          typography_font_family: "Poppins",
                          typography_font_size: { unit: "px", size: 20 },
                          typography_font_weight: "600"
                        }
                      },
                      {
                        elType: "widget",
                        widgetType: "text-editor",
                        settings: {
                          editor: "<p>Interface intuitiva e rápida que permite configurar tudo em minutos, sem complicações.</p>",
                          text_color: "#666666",
                          typography_typography: "custom",
                          typography_font_family: "Inter",
                          typography_font_size: { unit: "px", size: 16 },
                          typography_line_height: { unit: "em", size: 1.6 }
                        }
                      }
                    ]
                  },
                  {
                    elType: "container",
                    settings: {
                      width: { unit: "%", size: 30 },
                      flex_direction: "column",
                      background_background: "classic",
                      background_color: "#f8f9fa",
                      border_radius: { unit: "px", top: 8, right: 8, bottom: 8, left: 8 },
                      padding: { unit: "px", top: 30, right: 30, bottom: 30, left: 30 },
                      gap: { unit: "px", size: 15 }
                    },
                    elements: [
                      {
                        elType: "widget",
                        widgetType: "icon",
                        settings: {
                          icon: "fas fa-shield-alt",
                          primary_color: "#4361EE",
                          size: { unit: "px", size: 40 }
                        }
                      },
                      {
                        elType: "widget",
                        widgetType: "heading",
                        settings: {
                          title: "Segurança Total",
                          header_size: "h3",
                          title_color: "#222222",
                          typography_typography: "custom",
                          typography_font_family: "Poppins",
                          typography_font_size: { unit: "px", size: 20 },
                          typography_font_weight: "600"
                        }
                      },
                      {
                        elType: "widget",
                        widgetType: "text-editor",
                        settings: {
                          editor: "<p>Seus dados estão seguros conosco com criptografia de ponta e certificações de segurança.</p>",
                          text_color: "#666666",
                          typography_typography: "custom",
                          typography_font_family: "Inter",
                          typography_font_size: { unit: "px", size: 16 },
                          typography_line_height: { unit: "em", size: 1.6 }
                        }
                      }
                    ]
                  },
                  {
                    elType: "container",
                    settings: {
                      width: { unit: "%", size: 30 },
                      flex_direction: "column",
                      background_background: "classic",
                      background_color: "#f8f9fa",
                      border_radius: { unit: "px", top: 8, right: 8, bottom: 8, left: 8 },
                      padding: { unit: "px", top: 30, right: 30, bottom: 30, left: 30 },
                      gap: { unit: "px", size: 15 }
                    },
                    elements: [
                      {
                        elType: "widget",
                        widgetType: "icon",
                        settings: {
                          icon: "fas fa-sync",
                          primary_color: "#4361EE",
                          size: { unit: "px", size: 40 }
                        }
                      },
                      {
                        elType: "widget",
                        widgetType: "heading",
                        settings: {
                          title: "Atualizações Constantes",
                          header_size: "h3",
                          title_color: "#222222",
                          typography_typography: "custom",
                          typography_font_family: "Poppins",
                          typography_font_size: { unit: "px", size: 20 },
                          typography_font_weight: "600"
                        }
                      },
                      {
                        elType: "widget",
                        widgetType: "text-editor",
                        settings: {
                          editor: "<p>Nossa plataforma evolui constantemente com novas funcionalidades e melhorias a cada mês.</p>",
                          text_color: "#666666",
                          typography_typography: "custom",
                          typography_font_family: "Inter",
                          typography_font_size: { unit: "px", size: 16 },
                          typography_line_height: { unit: "em", size: 1.6 }
                        }
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      };
      break;
      
    default:
      // Default é hero
      return generateBloqxkitElementorTemplate('hero');
  }
  
  return JSON.stringify(template, null, 2);
};
