// Sistema de gerenciamento de assinaturas Química PRO

export type SubscriptionPlan = 'free' | 'pro';

export interface SubscriptionLimits {
  dailyPhotoLimit: number;
  photoInterval: number; // em segundos
  hasAdvancedCalculator: boolean;
  hasStepByStepExplanations: boolean;
  hasHistory: boolean;
  hasPriorityProcessing: boolean;
}

export interface UserSubscription {
  plan: SubscriptionPlan;
  expiresAt?: Date;
  photosUsedToday: number;
  lastPhotoAt?: Date;
}

// Definição dos planos
export const SUBSCRIPTION_PLANS: Record<SubscriptionPlan, SubscriptionLimits> = {
  free: {
    dailyPhotoLimit: 3,
    photoInterval: 30, // 30 segundos entre fotos
    hasAdvancedCalculator: false,
    hasStepByStepExplanations: false,
    hasHistory: false,
    hasPriorityProcessing: false,
  },
  pro: {
    dailyPhotoLimit: Infinity,
    photoInterval: 0,
    hasAdvancedCalculator: true,
    hasStepByStepExplanations: true,
    hasHistory: true,
    hasPriorityProcessing: true,
  },
};

// Preços por região
export const SUBSCRIPTION_PRICES = {
  brazil: {
    currency: 'BRL',
    symbol: 'R$',
    price: 14.90,
    formatted: 'R$ 14,90',
  },
  international: {
    currency: 'USD',
    symbol: '$',
    price: 2.99,
    formatted: '$2.99',
  },
};

// Detecta região do usuário (simplificado - pode usar geolocalização real)
export function getUserRegion(): 'brazil' | 'international' {
  // Detecta pelo idioma do navegador
  const language = typeof navigator !== 'undefined' ? navigator.language : 'en';
  return language.startsWith('pt') ? 'brazil' : 'international';
}

// Obtém preço baseado na região
export function getSubscriptionPrice() {
  const region = getUserRegion();
  return SUBSCRIPTION_PRICES[region];
}

// Verifica se usuário pode tirar foto
export function canTakePhoto(subscription: UserSubscription): {
  allowed: boolean;
  reason?: string;
  waitTime?: number;
} {
  const limits = SUBSCRIPTION_PLANS[subscription.plan];

  // PRO tem acesso ilimitado
  if (subscription.plan === 'pro') {
    return { allowed: true };
  }

  // Verifica limite diário
  if (subscription.photosUsedToday >= limits.dailyPhotoLimit) {
    return {
      allowed: false,
      reason: `Você atingiu o limite de ${limits.dailyPhotoLimit} fotos por dia. Assine o Química PRO para fotos ilimitadas!`,
    };
  }

  // Verifica intervalo entre fotos
  if (subscription.lastPhotoAt) {
    const now = new Date();
    const timeSinceLastPhoto = (now.getTime() - subscription.lastPhotoAt.getTime()) / 1000;
    
    if (timeSinceLastPhoto < limits.photoInterval) {
      const waitTime = Math.ceil(limits.photoInterval - timeSinceLastPhoto);
      return {
        allowed: false,
        reason: `Aguarde ${waitTime} segundos antes de tirar outra foto.`,
        waitTime,
      };
    }
  }

  return { allowed: true };
}

// Registra uso de foto
export function recordPhotoUsage(subscription: UserSubscription): UserSubscription {
  const now = new Date();
  const today = now.toDateString();
  const lastPhotoDay = subscription.lastPhotoAt?.toDateString();

  // Reset contador se for um novo dia
  const photosUsedToday = today === lastPhotoDay ? subscription.photosUsedToday + 1 : 1;

  return {
    ...subscription,
    photosUsedToday,
    lastPhotoAt: now,
  };
}

// Salva dados de assinatura no localStorage
export function saveSubscriptionData(userId: string, data: UserSubscription) {
  if (typeof window === 'undefined') return;
  
  const key = `subscription_${userId}`;
  localStorage.setItem(key, JSON.stringify({
    ...data,
    lastPhotoAt: data.lastPhotoAt?.toISOString(),
    expiresAt: data.expiresAt?.toISOString(),
  }));
}

// Carrega dados de assinatura do localStorage
export function loadSubscriptionData(userId: string): UserSubscription {
  if (typeof window === 'undefined') {
    return {
      plan: 'free',
      photosUsedToday: 0,
    };
  }

  const key = `subscription_${userId}`;
  const stored = localStorage.getItem(key);
  
  if (!stored) {
    return {
      plan: 'free',
      photosUsedToday: 0,
    };
  }

  try {
    const parsed = JSON.parse(stored);
    return {
      ...parsed,
      lastPhotoAt: parsed.lastPhotoAt ? new Date(parsed.lastPhotoAt) : undefined,
      expiresAt: parsed.expiresAt ? new Date(parsed.expiresAt) : undefined,
    };
  } catch {
    return {
      plan: 'free',
      photosUsedToday: 0,
    };
  }
}

// Verifica se assinatura PRO está ativa
export function isProActive(subscription: UserSubscription): boolean {
  if (subscription.plan !== 'pro') return false;
  if (!subscription.expiresAt) return false;
  
  return new Date() < subscription.expiresAt;
}

// Obtém plano efetivo (considera expiração)
export function getEffectivePlan(subscription: UserSubscription): SubscriptionPlan {
  if (subscription.plan === 'pro' && isProActive(subscription)) {
    return 'pro';
  }
  return 'free';
}
