
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

    // Criar o prompt para o Claude com instruções contextuais
    const systemPrompt = "Você é um especialista em otimização de componentes JSON do Elementor. Sua função é transformar o JSON fornecido em um componente de container moderno e limpo. RETORNE APENAS O JSON OTIMIZADO, sem explicações, análises ou comentários. O componente deve seguir as melhores práticas, ser responsivo e usar containers modernos. Use flexbox para layouts e mantenha a estrutura limpa.";
    
    const userPrompt = `
      INSTRUÇÕES: ${instructions || "Otimize este JSON do Elementor para um container moderno. Remova configurações desnecessárias, melhore a responsividade e simplifique a estrutura. Retorne APENAS o JSON otimizado."}
      
      CÓDIGO JSON:
      \`\`\`json
      ${jsonCode}
      \`\`\`
      
      IMPORTANTE: Retorne APENAS o JSON do componente otimizado, nenhuma explicação ou comentário. Apenas o código JSON bruto envolto em \`\`\`json e \`\`\`.
    `;

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
        system: systemPrompt,  // Sistema prompt como parâmetro de nível superior
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
