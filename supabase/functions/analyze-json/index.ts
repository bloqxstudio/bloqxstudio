
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Cabeçalhos CORS para permitir requisições do frontend
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Tratamento de requisições OPTIONS para CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Obter a chave API do Claude das variáveis de ambiente
    const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY');
    
    if (!CLAUDE_API_KEY) {
      throw new Error('Chave API do Claude não configurada');
    }

    // Extrair dados da requisição
    const { jsonCode, instructions } = await req.json();
    
    if (!jsonCode) {
      throw new Error('Nenhum código JSON fornecido');
    }

    // Checar se estamos extraindo metadados
    const isExtractingMetadata = instructions.includes("extract metadata");
    
    // Engenharia de prompt baseada no tipo de operação
    const systemPrompt = isExtractingMetadata ? 
      `You are an expert Elementor component analyzer who extracts metadata from component JSON. You analyze components and identify:

1. A descriptive title based on the component's purpose and structure
2. Relevant tags/keywords (comma separated)
3. The layout alignment (left, center, right, full)
4. Number of columns (1, 2, 3+)
5. Types of elements present (image, heading, button, list, video)

You ONLY return a JSON object with these fields, wrapped in markdown code blocks. Example:
\`\`\`json
{
  "title": "Product Feature Showcase",
  "tags": "features, product, comparison",
  "alignment": "center",
  "columns": "3+",
  "elements": ["heading", "image", "button"]
}
\`\`\`

Be accurate and concise. If you cannot determine a value with confidence, use null or an empty array.` 
      : 
      `You are an expert Elementor component optimizer who exclusively transforms JSON code into modern, optimized container components. 

REQUIREMENTS:
1. You will ONLY return the optimized JSON code, wrapped in \`\`\`json and \`\`\` tags
2. You will NEVER include explanations, analysis, or comments about the code
3. You will PRESERVE all layout structures, container directions, spacing values, padding, and margins exactly as defined in the original code
4. You will convert all section/column elements to modern container elements with appropriate flex settings
5. You will remove only unnecessary styling properties while maintaining exact visual appearance
6. You will ensure the component remains fully responsive by using relative units where appropriate
7. You will optimize any custom CSS for modern browsers
8. You will provide a clean, properly structured JSON output that works directly in Elementor
9. CRITICAL: Preserve all direct color values in the original code - DO NOT convert to global color references. If a color is specified as a direct HEX or RGB value, keep exactly that same direct color value.
10. CRITICAL: For text elements, make sure to use font family "DMSANS" wherever possible.

CRITICAL: The JSON structure must follow the pattern seen in our examples with an outer container that has proper content_width, flex_direction and other layout properties. The component must render visually identical to the original.`;
    
    const userPrompt = isExtractingMetadata ?
      `Analyze this Elementor component JSON and extract the metadata as specified in your instructions:
\`\`\`json
${jsonCode}
\`\`\`
IMPORTANT: Return ONLY the metadata JSON wrapped in \`\`\`json and \`\`\` tags with no explanations before or after.` 
      : 
      `INSTRUCTIONS: ${instructions || "Transform this Elementor component into a modern responsive container. Preserve ALL spacing, padding, layout structures, and DIRECT COLOR VALUES exactly as in the original. Do not use global color references - keep all colors as direct hex/rgb values if they are specified directly in the original. Use font-family 'DMSANS' for all text elements."} 

JSON CODE TO OPTIMIZE:
\`\`\`json
${jsonCode}
\`\`\`

IMPORTANT: Return ONLY the optimized JSON code wrapped in \`\`\`json and \`\`\` tags. Do not include any explanations or comments. Your response must be copy-pastable JSON that can immediately be used in Elementor. PRESERVE ALL DIRECT COLOR VALUES from the original code.`;

    // Fazer a requisição para a API do Claude com o formato atualizado
    console.log("Enviando requisição para a API do Claude...");
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 4000,
        system: systemPrompt,
        messages: [
          { role: "user", content: userPrompt }
        ]
      })
    });

    // Verificar se a resposta da API foi bem-sucedida
    if (!response.ok) {
      const errorData = await response.text();
      console.error("Erro na API do Claude:", errorData);
      throw new Error(`Erro na API do Claude: ${response.status} ${response.statusText}`);
    }

    // Processar a resposta da API
    const claudeResponse = await response.json();
    console.log("Resposta recebida do Claude");

    // Retornar a análise para o frontend
    return new Response(
      JSON.stringify({
        analysis: claudeResponse.content[0].text,
        success: true
      }),
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      }
    );
  } catch (error) {
    console.error("Erro na função analyze-json:", error);
    
    // Retornar erro para o frontend
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
