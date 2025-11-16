import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Validar configuração do Supabase
const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== '' && supabaseAnonKey !== '');

if (!isSupabaseConfigured) {
  console.warn('⚠️ Variáveis de ambiente do Supabase não configuradas. Funcionalidades de autenticação e histórico não estarão disponíveis.');
}

// Criar cliente Supabase apenas se configurado corretamente
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
      global: {
        headers: {
          'X-Client-Info': 'chemsnap-web',
        },
      },
    })
  : null;

// Flag para verificar se Supabase está disponível
export const isSupabaseAvailable = isSupabaseConfigured;

// Types para o banco de dados
export interface ChemProblem {
  id: string;
  user_id?: string;
  problem_text: string;
  problem_image_url?: string;
  solution: ChemSolution;
  created_at: string;
  is_favorite: boolean;
}

export interface ChemSolution {
  steps: SolutionStep[];
  methods: SolutionMethod[];
  final_answer: string;
  explanation: string;
}

export interface SolutionStep {
  step_number: number;
  title: string;
  description: string;
  formula?: string;
  calculation?: string;
}

export interface SolutionMethod {
  method_name: string;
  steps: SolutionStep[];
  difficulty: 'easy' | 'medium' | 'hard';
}

// Funções para interagir com o Supabase
export async function saveProblem(problem: Omit<ChemProblem, 'id' | 'created_at'>) {
  if (!isSupabaseConfigured || !supabase) {
    console.warn('Supabase não configurado - salvamento ignorado');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('chemical_problems')
      .insert([problem])
      .select()
      .single();

    if (error) {
      console.error('Erro ao salvar problema:', error);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Erro ao salvar problema:', err);
    return null;
  }
}

export async function getProblemHistory(userId?: string) {
  if (!isSupabaseConfigured || !supabase) {
    console.warn('Supabase não configurado - histórico vazio');
    return [];
  }

  try {
    let query = supabase
      .from('chemical_problems')
      .select('*')
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Erro ao buscar histórico:', error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('Erro ao buscar histórico:', err);
    return [];
  }
}

export async function toggleFavorite(problemId: string, isFavorite: boolean) {
  if (!isSupabaseConfigured || !supabase) {
    console.warn('Supabase não configurado - toggle favorito ignorado');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('chemical_problems')
      .update({ is_favorite: isFavorite })
      .eq('id', problemId)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar favorito:', error);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Erro ao atualizar favorito:', err);
    return null;
  }
}
