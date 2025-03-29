
/**
 * Pre-built features grid template for Elementor
 */

export const getFeaturesTemplate = () => {
  return {
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
};
