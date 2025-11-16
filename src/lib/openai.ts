// Cliente para chamar a API route server-side
export interface ChemProblemAnalysis {
  problem_text: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  solution: {
    steps: Array<{
      step_number: number;
      title: string;
      description: string;
      formula?: string;
      calculation?: string;
    }>;
    methods: Array<{
      method_name: string;
      steps: Array<{
        step_number: number;
        title: string;
        description: string;
        formula?: string;
        calculation?: string;
      }>;
      difficulty: 'easy' | 'medium' | 'hard';
    }>;
    final_answer: string;
    explanation: string;
  };
}

export async function analyzeChemProblemFromImage(imageUrl: string): Promise<ChemProblemAnalysis> {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'image',
      imageUrl,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao analisar imagem');
  }

  return response.json();
}

export async function analyzeChemProblemFromText(problemText: string): Promise<ChemProblemAnalysis> {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'text',
      problemText,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao analisar problema');
  }

  return response.json();
}
