import { supabase, isSupabaseAvailable } from './supabase';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
}

// Criar perfil do usuário (função auxiliar interna)
async function createUserProfile(userId: string, email: string, fullName?: string) {
  if (!isSupabaseAvailable || !supabase) {
    throw new Error('Supabase não configurado');
  }

  const { data, error } = await supabase
    .from('profiles')
    .insert([
      {
        id: userId,
        email,
        full_name: fullName || '',
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Registrar novo usuário - SEM CONFIRMAÇÃO DE EMAIL
export async function signUp(email: string, password: string, fullName?: string) {
  if (!isSupabaseAvailable || !supabase) {
    throw new Error('Supabase não configurado');
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
      data: {
        full_name: fullName,
      },
      // DESATIVA CONFIRMAÇÃO DE EMAIL - permite login imediato
      emailConfirmation: false,
    },
  });

  if (error) throw error;

  // Criar perfil do usuário
  if (data.user) {
    try {
      await createUserProfile(data.user.id, email, fullName);
    } catch (profileError: any) {
      // Se o perfil já existe (pode acontecer com trigger automático), ignora o erro
      if (profileError?.code !== '23505') {
        console.error('Erro ao criar perfil:', profileError);
      }
    }
  }

  return data;
}

// Login
export async function signIn(email: string, password: string) {
  if (!isSupabaseAvailable || !supabase) {
    throw new Error('Supabase não configurado');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

// Logout
export async function signOut() {
  if (!isSupabaseAvailable || !supabase) {
    throw new Error('Supabase não configurado');
  }

  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Obter usuário atual - VERSÃO SEGURA SEM CHAMADAS DE REDE
export async function getCurrentUser() {
  if (!isSupabaseAvailable || !supabase) {
    return null;
  }

  try {
    // Primeiro tenta obter a sessão do cache local (não faz requisição de rede)
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return null;
    }
    
    // Retorna o usuário da sessão em cache (sem fazer nova requisição)
    return session.user;
  } catch (error: any) {
    // Retorna null silenciosamente para qualquer erro
    console.warn('Erro ao obter usuário (modo offline):', error.message);
    return null;
  }
}

// Obter perfil do usuário
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (!isSupabaseAvailable || !supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      return null;
    }
    return data;
  } catch (error) {
    return null;
  }
}

// Atualizar perfil do usuário
export async function updateUserProfile(userId: string, updates: Partial<UserProfile>) {
  if (!isSupabaseAvailable || !supabase) {
    throw new Error('Supabase não configurado');
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Verificar se usuário está autenticado
export async function isAuthenticated(): Promise<boolean> {
  if (!isSupabaseAvailable || !supabase) {
    return false;
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  } catch (error) {
    // Se houver erro, considera como não autenticado
    return false;
  }
}

// Listener para mudanças de autenticação
export function onAuthStateChange(callback: (user: any) => void) {
  if (!isSupabaseAvailable || !supabase) {
    return { data: { subscription: { unsubscribe: () => {} } } };
  }

  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user ?? null);
  });
}
