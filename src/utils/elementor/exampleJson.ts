
/**
 * Example of properly formatted Elementor JSON based on the provided HTML
 */

export const getFormattedElementorJson = (rawHtml: string, title: string): string => {
  // This is the properly formatted JSON for the c1370 component
  const elementorJson = {
    "type": "elementor",
    "siteurl": "https://superelements.io/wp-json/",
    "elements": [
      {
        "id": "74f08d77",
        "elType": "container",
        "isInner": false,
        "isLocked": false,
        "settings": {
          "background_background": "classic",
          "content_width": "boxed",
          "flex_direction": "row"
        },
        "elements": [
          {
            "id": "4791ffa1",
            "elType": "container",
            "isInner": true,
            "isLocked": false,
            "settings": {
              "content_width": "boxed",
              "flex_direction": "row"
            },
            "elements": [
              {
                "id": "565e3e18",
                "elType": "widget",
                "isInner": false,
                "isLocked": false,
                "widgetType": "image",
                "settings": {
                  "_animation": "fadeIn",
                  "_animation_delay": 500,
                  "image": {
                    "url": "https://superelements.io/wp-content/uploads/elementor/thumbs/assets_task_01jsj1wh4mfw4r0gmq7re8sfez_img_1-r4speq864zlh5ul5cej6opzgvpja6ra6oqjp6cldyo.webp",
                    "alt": "assets_task_01jsj1wh4mfw4r0gmq7re8sfez_img_1"
                  }
                }
              }
            ]
          },
          {
            "id": "54b2e808",
            "elType": "container",
            "isInner": true,
            "isLocked": false,
            "settings": {
              "content_width": "full",
              "flex_direction": "column"
            },
            "elements": [
              {
                "id": "c56059c",
                "elType": "container",
                "isInner": true,
                "isLocked": false,
                "settings": {
                  "background_background": "classic",
                  "animation": "slideInUp",
                  "animation_delay": 1000,
                  "content_width": "full",
                  "flex_direction": "column"
                },
                "elements": [
                  {
                    "id": "25ff645c",
                    "elType": "widget",
                    "isInner": false,
                    "isLocked": false,
                    "widgetType": "heading",
                    "settings": {
                      "title": "Para quem não aceita o \"mais ou menos\".",
                      "header_size": "h4",
                      "title_color": "",
                      "typography_typography": "custom"
                    }
                  },
                  {
                    "id": "17f55c30",
                    "elType": "widget",
                    "isInner": false,
                    "isLocked": false,
                    "widgetType": "text-editor",
                    "settings": {
                      "editor": "<p>Você não está aqui só pra montar páginas — você está construindo algo grande. <br><br>Por isso, cada componente do SuperElements foi projetado pra te dar vantagem a hora de desenvolver com Elementor.&nbsp;</p>"
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

  return JSON.stringify(elementorJson, null, 2);
};
