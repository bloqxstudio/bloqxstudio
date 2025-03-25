export interface ElementorComponent {
  id: string;
  title: string;
  description: string;
  previewImage?: string;
  type: string;
  dateCreated: string;
  dateUpdated: string;
  tags: string[];
  jsonCode: string;
  category: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
}

// Sample data
export const categories: Category[] = [
  {
    id: "bloqx-kit",
    name: "Bloqx Kit",
    description: "Collection of core components for building websites",
    slug: "bloqx-kit"
  },
  {
    id: "componentes",
    name: "Componentes",
    description: "Componentes e sessões reutilizáveis",
    slug: "componentes"
  }
];

// Make sure the components array is exported so we can modify it
export const components: ElementorComponent[] = [
  {
    id: "hero-lancamento",
    title: "Hero Lançamento",
    description: "Componente hero para páginas de lançamento de produtos",
    previewImage: "/lovable-uploads/0dd1baf9-ccc5-47a7-a335-c34bd39e4106.png",
    type: "elementor",
    dateCreated: "2023-04-12",
    dateUpdated: "2023-06-15",
    tags: ["hero", "lançamento", "produto"],
    category: "componentes",
    jsonCode: `{
  "type": "elementor",
  "siteurl": "https://bloqxkit.com/",
  "elements": [
    {
      "elType": "container",
      "_title": "01_Hero_Wireframe_Base",
      "settings": {
        "container_type": "flex",
        "content_width": "boxed",
        "flex_direction": "row",
        "gap": {"unit": "px", "size": 40},
        "padding": {"unit": "px", "top": 60, "bottom": 60, "left": 20, "right": 20},
        "background_background": "classic",
        "background_color": "#000000"
      },
      "elements": [
        {
          "elType": "container",
          "settings": {
            "width": {"unit": "%", "size": 60},
            "flex_direction": "column",
            "align_self": "center",
            "padding": {"unit": "px", "right": 20}
          },
          "elements": [
            {
              "elType": "widget",
              "widgetType": "heading",
              "settings": {
                "title": "Isto é uma headline - o que você mais quer vender",
                "align": "left",
                "title_color": "#ffffff",
                "typography_typography": "custom",
                "typography_font_size": {"unit": "px", "size": 42},
                "typography_font_weight": "600",
                "typography_line_height": {"unit": "em", "size": 1.2}
              }
            },
            {
              "elType": "widget",
              "widgetType": "text-editor",
              "settings": {
                "editor": "<p>Esta é a sua subheadline que complementa a headline principal e explica mais sobre o seu produto ou serviço.</p>",
                "align": "left",
                "text_color": "#ffffff",
                "typography_typography": "custom",
                "typography_font_size": {"unit": "px", "size": 18},
                "typography_line_height": {"unit": "em", "size": 1.6}
              }
            },
            {
              "elType": "widget",
              "widgetType": "button",
              "settings": {
                "text": "CLIQUE AQUI",
                "align": "left",
                "background_color": "#FFB800",
                "button_text_color": "#000000",
                "hover_color": "#000000",
                "button_background_hover_color": "#FFFFFF",
                "border_radius": {"unit": "px", "top": 5, "right": 5, "bottom": 5, "left": 5},
                "text_padding": {"unit": "px", "top": 15, "right": 30, "bottom": 15, "left": 30},
                "typography_typography": "custom",
                "typography_font_size": {"unit": "px", "size": 16},
                "typography_font_weight": "700"
              }
            }
          ]
        },
        {
          "elType": "container",
          "settings": {
            "width": {"unit": "%", "size": 40},
            "content_position": "center",
            "background_background": "classic",
            "border_radius": {"unit": "px", "top": 8, "right": 8, "bottom": 8, "left": 8},
            "overflow": "hidden"
          },
          "elements": [
            {
              "elType": "widget",
              "widgetType": "image",
              "settings": {
                "image": {"url": "https://via.placeholder.com/500x400/f0f0f0/cccccc", "id": 123},
                "image_size": "full"
              }
            }
          ]
        }
      ]
    }
  ]
}`
  },
  {
    id: "formulario-fechado",
    title: "Formulário Fechado",
    description: "Formulário para captura de leads",
    previewImage: "/placeholder.svg",
    type: "elementor",
    dateCreated: "2023-05-10",
    dateUpdated: "2023-06-02",
    tags: ["formulário", "leads", "captura"],
    category: "componentes",
    jsonCode: `{
  "type": "elementor",
  "siteurl": "https://bloqxkit.com/",
  "elements": [
    {
      "elType": "container",
      "_title": "02_Form_Lead_Capture",
      "settings": {
        "background_background": "classic",
        "background_color": "#f5f5f5",
        "border_radius": {"unit": "px", "top": 12, "right": 12, "bottom": 12, "left": 12},
        "box_shadow_box_shadow_type": "yes",
        "box_shadow_box_shadow": {"horizontal": 0, "vertical": 4, "blur": 20, "spread": 0, "color": "rgba(0,0,0,0.1)"},
        "padding": {"unit": "px", "top": 40, "right": 40, "bottom": 40, "left": 40},
        "content_width": "boxed"
      },
      "elements": [
        {
          "elType": "widget",
          "widgetType": "heading",
          "settings": {
            "title": "Receba nosso conteúdo exclusivo",
            "align": "center",
            "title_color": "#333333",
            "typography_typography": "custom",
            "typography_font_size": {"unit": "px", "size": 28},
            "typography_font_weight": "600",
            "typography_line_height": {"unit": "em", "size": 1.3}
          }
        },
        {
          "elType": "widget",
          "widgetType": "text-editor",
          "settings": {
            "editor": "<p>Preencha o formulário abaixo para receber nossas dicas e novidades diretamente no seu email.</p>",
            "align": "center",
            "text_color": "#666666",
            "typography_typography": "custom",
            "typography_font_size": {"unit": "px", "size": 16},
            "typography_line_height": {"unit": "em", "size": 1.5}
          }
        },
        {
          "elType": "widget",
          "widgetType": "form",
          "settings": {
            "form_name": "Lead Capture Form",
            "form_fields": [
              {
                "field_type": "text",
                "field_label": "Nome",
                "field_placeholder": "Seu nome completo",
                "field_required": "yes",
                "width": "100",
                "_id": "name"
              },
              {
                "field_type": "email",
                "field_label": "Email",
                "field_placeholder": "seu@email.com",
                "field_required": "yes",
                "width": "100",
                "_id": "email"
              }
            ],
            "button_text": "QUERO RECEBER",
            "button_size": "md",
            "button_width": "100",
            "button_align": "center",
            "button_background_color": "#4CAF50",
            "button_text_color": "#ffffff",
            "button_hover_background_color": "#3d8b40",
            "button_hover_color": "#ffffff",
            "button_border_radius": {"unit": "px", "top": 5, "right": 5, "bottom": 5, "left": 5},
            "button_text_padding": {"unit": "px", "top": 15, "right": 30, "bottom": 15, "left": 30},
            "button_typography_typography": "custom",
            "button_typography_font_size": {"unit": "px", "size": 16},
            "button_typography_font_weight": "700"
          }
        }
      ]
    }
  ]
}`
  },
  {
    id: "icone-girando",
    title: "Ícone Girando + Css",
    description: "Ícone com animação de rotação e estilos CSS",
    previewImage: "/placeholder.svg",
    type: "elementor",
    dateCreated: "2023-03-20",
    dateUpdated: "2023-04-05",
    tags: ["ícone", "animação", "css"],
    category: "bloqx-kit",
    jsonCode: `{
  "type": "elementor",
  "siteurl": "https://bloqxkit.com/",
  "elements": [
    {
      "elType": "container",
      "_title": "03_Rotating_Icon",
      "settings": {
        "background_background": "classic",
        "background_color": "#f9f9f9",
        "border_radius": {"unit": "px", "top": 100, "right": 100, "bottom": 100, "left": 100},
        "content_position": "center",
        "padding": {"unit": "px", "top": 40, "right": 40, "bottom": 40, "left": 40},
        "animation": "float",
        "animation_duration": "slow",
        "content_width": "full",
        "width": {"unit": "px", "size": 200},
        "height": {"unit": "px", "size": 200},
        "overflow": "hidden"
      },
      "elements": [
        {
          "elType": "widget",
          "widgetType": "icon",
          "settings": {
            "icon": "fas fa-star",
            "align": "center",
            "primary_color": "#f5a623",
            "size": {"unit": "px", "size": 80},
            "_animation": "rotateIn",
            "animation_duration": "slow",
            "hover_animation": "pulse",
            "_css_classes": "rotating-icon",
            "_element_custom_width": {"unit": "px", "size": 120},
            "custom_css": ".rotating-icon {animation: spin 6s linear infinite;} @keyframes spin {0% {transform: rotate(0deg);} 100% {transform: rotate(360deg);}}"
          }
        }
      ]
    }
  ]
}`
  }
];

export const getSampleComponents = () => {
  return components;
};

export const getSampleComponentById = (id: string) => {
  return components.find(component => component.id === id);
};

export const getSampleCategories = () => {
  return categories;
};

export const getSampleComponentsByCategory = (categoryId: string) => {
  return components.filter(component => component.category === categoryId);
};
