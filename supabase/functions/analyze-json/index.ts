
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
    const systemPrompt = "Você é um assistente especializado em analisar e melhorar componentes JSON do Elementor. Sua tarefa é analisar o JSON fornecido e sugerir melhorias com base nas instruções do usuário.";
    
    const userPrompt = `
      INSTRUÇÕES: ${instructions || "Analise este JSON do Elementor e sugira melhorias para torná-lo mais eficiente, limpo e compatível."}
      
      CÓDIGO JSON:
      \`\`\`json
      ${jsonCode}
      \`\`\`
      
      Por favor, forneça:
      1. Uma análise do componente (estrutura, problemas potenciais)
      2. Sugestões de melhorias específicas
      3. Uma versão aprimorada do JSON, se aplicável
      4. Dicas para otimizar o componente
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
