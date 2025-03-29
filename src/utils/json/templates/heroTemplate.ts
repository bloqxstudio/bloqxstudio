
/**
 * Pre-built hero section template for Elementor
 */

export const getHeroTemplate = () => {
  return {
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
};
