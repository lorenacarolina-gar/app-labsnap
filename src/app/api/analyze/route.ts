import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, imageUrl, problemText } = body;

    // Validação básica
    if (!type || (type === 'image' && !imageUrl) || (type === 'text' && !problemText)) {
      return NextResponse.json(
        { error: 'Dados inválidos. Forneça type e imageUrl ou problemText.' },
        { status: 400 }
      );
    }

    // Verificar se a chave da OpenAI está configurada
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return NextResponse.json(
        { error: 'Chave da API OpenAI não configurada. Configure OPENAI_API_KEY nas variáveis de ambiente.' },
        { status: 500 }
      );
    }

    let messages: any[] = [];

    const systemPrompt = `Você é um assistente especializado em resolver problemas de Química.
Analise o problema e forneça uma solução completa e estruturada.

Responda SEMPRE em formato JSON válido com esta estrutura EXATA:
{
  "problem_text": "texto do problema identificado",
  "topic": "tópico de química (ex: Estequiometria, Termoquímica, Cinética Química, etc)",
  "difficulty": "easy" ou "medium" ou "hard",
  "solution": {
    "steps": [
      {
        "step_number": 1,
        "title": "Título do passo",
        "description": "Descrição detalhada do que fazer",
        "formula": "Fórmula química ou equação (opcional)",
        "calculation": "Cálculo matemático (opcional)"
      }
    ],
    "final_answer": "Resposta final completa com unidades",
    "explanation": "Explicação conceitual do problema e da solução",
    "methods": [
      {
        "method_name": "Nome do método alternativo",
        "difficulty": "easy" ou "medium" ou "hard",
        "steps": [
          {
            "step_number": 1,
            "title": "Título",
            "description": "Descrição",
            "formula": "Fórmula (opcional)",
            "calculation": "Cálculo (opcional)"
          }
        ]
      }
    ]
  }
}

IMPORTANTE:
- Sempre inclua pelo menos 3 passos na solução principal
- Forneça fórmulas químicas quando relevante
- Mostre cálculos detalhados
- Explique os conceitos de forma clara
- Inclua pelo menos 1 método alternativo quando possível`;

    if (type === 'image') {
      // Análise de imagem
      messages = [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analise este problema de química e forneça a solução completa estruturada:'
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl
              }
            }
          ]
        }
      ];
    } else {
      // Análise de texto
      messages = [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `Resolva este problema de química: ${problemText}`
        }
      ];
    }

    // Chamar a API da OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages,
        response_format: { type: 'json_object' },
        max_tokens: 3000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erro da OpenAI:', errorData);
      return NextResponse.json(
        { error: `Erro ao processar com OpenAI: ${errorData.error?.message || 'Erro desconhecido'}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('Resposta da OpenAI:', content);
    
    const analysis = JSON.parse(content);

    // Validar estrutura da resposta
    if (!analysis.solution || !analysis.solution.steps || !Array.isArray(analysis.solution.steps)) {
      console.error('Estrutura inválida recebida da OpenAI:', analysis);
      return NextResponse.json(
        { error: 'Formato de resposta inválido da IA. Tente novamente.' },
        { status: 500 }
      );
    }

    return NextResponse.json(analysis);

  } catch (error: any) {
    console.error('Erro ao analisar problema:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao analisar o problema. Tente novamente.' },
      { status: 500 }
    );
  }
}
