
/**
 * Pre-built form template for Elementor
 */

export const getFormTemplate = () => {
  return {
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
};
