'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Calculator, History, AlertCircle, LogOut, User, Crown, Clock, Lock, CreditCard, X, CheckCircle, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CameraCapture } from '@/components/custom/camera-capture';
import { CalculatorComponent } from '@/components/custom/calculator';
import { SolutionDisplay } from '@/components/custom/solution-display';
import { HistoryPanel } from '@/components/custom/history-panel';
import { SubscriptionBanner } from '@/components/custom/subscription-banner';
import { CountdownModal } from '@/components/custom/countdown-modal';
import { saveProblem, isSupabaseAvailable } from '@/lib/supabase';
import { getCurrentUser, signOut } from '@/lib/auth';
import { 
  loadSubscriptionData, 
  saveSubscriptionData, 
  canTakePhoto, 
  recordPhotoUsage,
  getEffectivePlan,
  SUBSCRIPTION_PLANS,
} from '@/lib/subscription';
import type { ChemProblemAnalysis } from '@/lib/openai';
import type { UserSubscription } from '@/lib/subscription';

type View = 'home' | 'camera' | 'calculator' | 'history' | 'checkout';

// Limites separados para usuários free
const FREE_CALCULATOR_LIMIT = 3; // 3 perguntas na calculadora
const FREE_PHOTO_LIMIT = 3; // 3 fotos (upload/câmera)
const COUNTDOWN_SECONDS = 30;

interface UsageData {
  calculatorCount: number;
  photoCount: number;
  lastReset: string;
}

function loadUsageData(userId: string): UsageData {
  if (typeof window === 'undefined') {
    return { calculatorCount: 0, photoCount: 0, lastReset: new Date().toISOString() };
  }
  
  const stored = localStorage.getItem(`usage_data_${userId}`);
  if (!stored) {
    return { calculatorCount: 0, photoCount: 0, lastReset: new Date().toISOString() };
  }
  
  const usage: UsageData = JSON.parse(stored);
  
  // Resetar contador diariamente à meia-noite
  const lastReset = new Date(usage.lastReset);
  const now = new Date();
  if (now.getDate() !== lastReset.getDate() || 
      now.getMonth() !== lastReset.getMonth() || 
      now.getFullYear() !== lastReset.getFullYear()) {
    return { calculatorCount: 0, photoCount: 0, lastReset: now.toISOString() };
  }
  
  return usage;
}

function saveUsageData(userId: string, usage: UsageData) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`usage_data_${userId}`, JSON.stringify(usage));
}

export default function Home() {
  const router = useRouter();
  const [currentView, setCurrentView] = useState<View>('home');
  const [solution, setSolution] = useState<ChemProblemAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [subscription, setSubscription] = useState<UserSubscription>({
    plan: 'free',
    photosUsedToday: 0,
  });
  const [waitTime, setWaitTime] = useState<number>(0);
  
  // Estados para controle de uso separado
  const [usageData, setUsageData] = useState<UsageData>({ 
    calculatorCount: 0, 
    photoCount: 0, 
    lastReset: new Date().toISOString() 
  });
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdownTime, setCountdownTime] = useState(COUNTDOWN_SECONDS);

  // Estados do checkout
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [checkoutData, setCheckoutData] = useState({
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Brasil'
  });

  useEffect(() => {
    checkAuth();
  }, []);

  // Timer para contagem regressiva de fotos
  useEffect(() => {
    if (waitTime > 0) {
      const timer = setInterval(() => {
        setWaitTime(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [waitTime]);

  // Timer para countdown modal
  useEffect(() => {
    if (showCountdown && countdownTime > 0) {
      const timer = setInterval(() => {
        setCountdownTime(prev => {
          if (prev <= 1) {
            setShowCountdown(false);
            return COUNTDOWN_SECONDS;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showCountdown, countdownTime]);

  // Redirecionar após sucesso do pagamento
  useEffect(() => {
    if (paymentSuccess) {
      const timer = setTimeout(() => {
        setPaymentSuccess(false);
        setCurrentView('home');
        setCheckoutData({
          cardName: '',
          cardNumber: '',
          expiryDate: '',
          cvv: '',
          address: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'Brasil'
        });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [paymentSuccess]);

  const checkAuth = async () => {
    try {
      if (isSupabaseAvailable) {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          // Carrega dados de assinatura
          const subData = loadSubscriptionData(currentUser.id);
          setSubscription(subData);
          // Carrega dados de uso
          const usage = loadUsageData(currentUser.id);
          setUsageData(usage);
        } else {
          // Modo demo sem autenticação
          const subData = loadSubscriptionData('demo_user');
          setSubscription(subData);
          const usage = loadUsageData('demo_user');
          setUsageData(usage);
        }
      } else {
        // Modo demo sem Supabase
        const subData = loadSubscriptionData('demo_user');
        setSubscription(subData);
        const usage = loadUsageData('demo_user');
        setUsageData(usage);
      }
    } catch (error: any) {
      // Silenciosamente trata erro e usa modo demo
      const subData = loadSubscriptionData('demo_user');
      setSubscription(subData);
      const usage = loadUsageData('demo_user');
      setUsageData(usage);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  // Verificar se usuário free pode usar calculadora
  const canUseCalculator = (): { allowed: boolean; reason?: string } => {
    const effectivePlan = getEffectivePlan(subscription);
    
    // Usuários PRO não têm limite
    if (effectivePlan === 'pro') {
      return { allowed: true };
    }
    
    // Verificar se atingiu limite de 3 perguntas na calculadora
    if (usageData.calculatorCount >= FREE_CALCULATOR_LIMIT) {
      return { 
        allowed: false, 
        reason: `Você atingiu o limite de ${FREE_CALCULATOR_LIMIT} perguntas na calculadora hoje. Assine o plano PRO para perguntas ilimitadas!` 
      };
    }
    
    return { allowed: true };
  };

  // Verificar se usuário free pode tirar foto
  const canUseCamera = (): { allowed: boolean; reason?: string } => {
    const effectivePlan = getEffectivePlan(subscription);
    
    // Usuários PRO não têm limite
    if (effectivePlan === 'pro') {
      return { allowed: true };
    }
    
    // Verificar se atingiu limite de 3 fotos
    if (usageData.photoCount >= FREE_PHOTO_LIMIT) {
      return { 
        allowed: false, 
        reason: `Você atingiu o limite de ${FREE_PHOTO_LIMIT} fotos hoje. Assine o plano PRO para fotos ilimitadas!` 
      };
    }
    
    // Verificar tempo de espera entre fotos
    const photoCheck = canTakePhoto(subscription);
    if (!photoCheck.allowed) {
      return {
        allowed: false,
        reason: photoCheck.reason || 'Aguarde antes de tirar outra foto'
      };
    }
    
    return { allowed: true };
  };

  // Registrar uso da calculadora
  const recordCalculatorUsage = () => {
    const userId = user?.id || 'demo_user';
    const effectivePlan = getEffectivePlan(subscription);
    
    // Apenas para usuários free
    if (effectivePlan === 'free') {
      const newUsage: UsageData = {
        ...usageData,
        calculatorCount: usageData.calculatorCount + 1,
      };
      setUsageData(newUsage);
      saveUsageData(userId, newUsage);
      
      // Mostrar countdown se não for a última pergunta
      if (newUsage.calculatorCount < FREE_CALCULATOR_LIMIT) {
        setCountdownTime(COUNTDOWN_SECONDS);
        setShowCountdown(true);
      }
    }
  };

  // Registrar uso de foto
  const recordPhotoUsageAction = () => {
    const userId = user?.id || 'demo_user';
    const effectivePlan = getEffectivePlan(subscription);
    
    // Apenas para usuários free
    if (effectivePlan === 'free') {
      const newUsage: UsageData = {
        ...usageData,
        photoCount: usageData.photoCount + 1,
      };
      setUsageData(newUsage);
      saveUsageData(userId, newUsage);
      
      // Registra também no sistema de subscription (para tempo de espera)
      const updatedSubscription = recordPhotoUsage(subscription);
      setSubscription(updatedSubscription);
      saveSubscriptionData(userId, updatedSubscription);
      
      // Mostrar countdown se não for a última foto
      if (newUsage.photoCount < FREE_PHOTO_LIMIT) {
        setCountdownTime(COUNTDOWN_SECONDS);
        setShowCountdown(true);
      }
    }
  };

  const handleImageCapture = async (imageUrl: string) => {
    const userId = user?.id || 'demo_user';
    const effectivePlan = getEffectivePlan(subscription);

    // Verificar limite de fotos para free
    const cameraCheck = canUseCamera();
    if (!cameraCheck.allowed) {
      setError(cameraCheck.reason || 'Não é possível tirar foto no momento');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'image',
          imageUrl,
          plan: effectivePlan,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao analisar a imagem');
      }

      const analysis = await response.json();
      setSolution(analysis);
      
      // Registra uso da foto e inicia countdown
      recordPhotoUsageAction();

      // Salva no histórico apenas se PRO e Supabase disponível
      if (effectivePlan === 'pro' && isSupabaseAvailable && user?.id) {
        try {
          await saveProblem({
            problem_text: analysis.problem_text,
            solution: analysis.solution,
            is_favorite: false,
            user_id: user.id,
          });
        } catch (saveError) {
          // Silenciosamente ignora erro de salvamento
        }
      }
      
      setCurrentView('home');
    } catch (err: any) {
      console.error('Erro ao analisar imagem:', err);
      setError(err.message || 'Erro ao analisar a imagem. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCalculatorSubmit = async (expression: string) => {
    const userId = user?.id || 'demo_user';
    const effectivePlan = getEffectivePlan(subscription);

    // Verificar limite de calculadora para free
    const calculatorCheck = canUseCalculator();
    if (!calculatorCheck.allowed) {
      setError(calculatorCheck.reason || 'Limite de perguntas atingido');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'text',
          problemText: expression,
          plan: effectivePlan,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao analisar o problema');
      }

      const analysis = await response.json();
      setSolution(analysis);
      
      // Registra uso da calculadora e inicia countdown
      recordCalculatorUsage();

      // Salva no histórico apenas se PRO e Supabase disponível
      if (effectivePlan === 'pro' && isSupabaseAvailable && user?.id) {
        try {
          await saveProblem({
            problem_text: analysis.problem_text,
            solution: analysis.solution,
            is_favorite: false,
            user_id: user.id,
          });
        } catch (saveError) {
          // Silenciosamente ignora erro de salvamento
        }
      }
      
      setCurrentView('home');
    } catch (err: any) {
      console.error('Erro ao analisar problema:', err);
      setError(err.message || 'Erro ao analisar o problema. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleHistorySelect = (problem: any) => {
    setSolution({
      problem_text: problem.problem_text,
      topic: problem.topic || 'Química Geral',
      difficulty: 'medium',
      solution: problem.solution,
    });
    setCurrentView('home');
  };

  const handleCheckoutInputChange = (field: string, value: string) => {
    setCheckoutData(prev => ({ ...prev, [field]: value }));
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.slice(0, 19); // 16 dígitos + 3 espaços
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const handleProcessPayment = async () => {
    // Validações básicas
    if (!checkoutData.cardName || !checkoutData.cardNumber || !checkoutData.expiryDate || 
        !checkoutData.cvv || !checkoutData.address || !checkoutData.city || 
        !checkoutData.state || !checkoutData.zipCode) {
      setError('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setIsProcessingPayment(true);
    setError(null);

    try {
      // Simula processamento de pagamento (2 segundos)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Atualiza assinatura para PRO
      const userId = user?.id || 'demo_user';
      const newSubscription: UserSubscription = {
        plan: 'pro',
        photosUsedToday: 0,
        lastPhotoTime: undefined,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
      };
      
      setSubscription(newSubscription);
      saveSubscriptionData(userId, newSubscription);

      // Mostra sucesso (o redirecionamento é feito pelo useEffect)
      setPaymentSuccess(true);

    } catch (err: any) {
      setError('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const effectivePlan = getEffectivePlan(subscription);
  const limits = SUBSCRIPTION_PLANS[effectivePlan];
  
  // Contadores separados
  const photosRemaining = effectivePlan === 'pro' 
    ? Infinity 
    : Math.max(0, FREE_PHOTO_LIMIT - usageData.photoCount);
  const calculatorRemaining = effectivePlan === 'pro' 
    ? Infinity 
    : Math.max(0, FREE_CALCULATOR_LIMIT - usageData.calculatorCount);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-100 to-yellow-200 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-yellow-900 font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-100 to-yellow-200">
      {/* Countdown Modal */}
      <CountdownModal 
        isOpen={showCountdown} 
        countdown={countdownTime}
        onUpgrade={() => setCurrentView('checkout')}
      />

      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-yellow-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {/* Erlenmeyer com bordas brancas e meio vazio */}
                  <path d="M9 2h6v7l4 9c0 2.5-2 4-7 4s-7-1.5-7-4l4-9V2z" fill="none" />
                  <line x1="9" y1="2" x2="15" y2="2" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                LabSnap
              </h1>
              {effectivePlan === 'pro' && (
                <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg shadow-md">
                  <Crown className="w-4 h-4 text-white" />
                  <span className="text-xs font-bold text-white">PRO</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {effectivePlan === 'free' && (
                <Button
                  onClick={() => setCurrentView('checkout')}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Assinar PRO
                </Button>
              )}
              {effectivePlan === 'pro' && isSupabaseAvailable && (
                <Button
                  variant="ghost"
                  onClick={() => setCurrentView(currentView === 'history' ? 'home' : 'history')}
                  className="hover:bg-yellow-100 flex flex-col items-center gap-1 h-auto py-2 px-3"
                >
                  <History className="w-7 h-7 text-yellow-600" />
                  <span className="text-xs font-medium text-yellow-700">Histórico</span>
                </Button>
              )}
              {user && (
                <>
                  <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 rounded-lg border border-yellow-200">
                    <User className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm text-yellow-800 font-medium">{user?.email}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="hover:bg-yellow-100 hover:text-yellow-600"
                    title="Sair"
                  >
                    <LogOut className="w-5 h-5 text-yellow-600" />
                  </Button>
                </>
              )}
              {!user && isSupabaseAvailable && (
                <Button
                  variant="outline"
                  onClick={() => router.push('/login')}
                  className="border-yellow-300 hover:bg-yellow-50 text-yellow-700 font-medium"
                >
                  Entrar
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Subscription Banner for Free Users */}
        {effectivePlan === 'free' && (photosRemaining < 2 || calculatorRemaining < 2) && (photosRemaining > 0 || calculatorRemaining > 0) && currentView !== 'checkout' && (
          <div className="mb-6">
            <SubscriptionBanner 
              onUpgrade={() => setCurrentView('checkout')}
              photosRemaining={photosRemaining}
            />
          </div>
        )}

        {/* Photos Limit Alert for Free Users */}
        {effectivePlan === 'free' && photosRemaining <= 1 && photosRemaining > 0 && currentView !== 'checkout' && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-300 rounded-xl flex items-start gap-3 shadow-sm">
            <Camera className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-yellow-900 font-semibold">
                Você tem apenas {photosRemaining} foto restante hoje
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                Assine o plano PRO para fotos ilimitadas e sem tempo de espera
              </p>
            </div>
            <Button
              onClick={() => setCurrentView('checkout')}
              size="sm"
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-md"
            >
              <Crown className="w-3 h-3 mr-1" />
              Ver PRO
            </Button>
          </div>
        )}

        {/* Calculator Limit Alert for Free Users */}
        {effectivePlan === 'free' && calculatorRemaining <= 1 && calculatorRemaining > 0 && currentView !== 'checkout' && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-300 rounded-xl flex items-start gap-3 shadow-sm">
            <Calculator className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-yellow-900 font-semibold">
                Você tem apenas {calculatorRemaining} pergunta restante na calculadora hoje
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                Assine o plano PRO para perguntas ilimitadas
              </p>
            </div>
            <Button
              onClick={() => setCurrentView('checkout')}
              size="sm"
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-md"
            >
              <Crown className="w-3 h-3 mr-1" />
              Ver PRO
            </Button>
          </div>
        )}

        {/* Photos Exhausted Alert */}
        {effectivePlan === 'free' && photosRemaining === 0 && currentView !== 'checkout' && (
          <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 rounded-xl flex items-start gap-3 shadow-sm">
            <Lock className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-yellow-900 font-semibold">
                Você atingiu o limite de {FREE_PHOTO_LIMIT} fotos diárias
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                Volte amanhã ou assine o plano PRO para fotos ilimitadas
              </p>
            </div>
            <Button
              onClick={() => setCurrentView('checkout')}
              size="sm"
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-md"
            >
              <Crown className="w-3 h-3 mr-1" />
              Assinar PRO
            </Button>
          </div>
        )}

        {/* Calculator Exhausted Alert */}
        {effectivePlan === 'free' && calculatorRemaining === 0 && currentView !== 'checkout' && (
          <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 rounded-xl flex items-start gap-3 shadow-sm">
            <Lock className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-yellow-900 font-semibold">
                Você atingiu o limite de {FREE_CALCULATOR_LIMIT} perguntas na calculadora hoje
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                Volte amanhã ou assine o plano PRO para perguntas ilimitadas
              </p>
            </div>
            <Button
              onClick={() => setCurrentView('checkout')}
              size="sm"
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-md"
            >
              <Crown className="w-3 h-3 mr-1" />
              Assinar PRO
            </Button>
          </div>
        )}

        {/* Wait Time Alert */}
        {waitTime > 0 && currentView !== 'checkout' && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-300 rounded-xl flex items-start gap-3 shadow-sm">
            <Clock className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-yellow-900 font-semibold">
                Aguarde {waitTime} segundo{waitTime !== 1 ? 's' : ''} antes de tirar outra foto
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                Usuários PRO não têm intervalo de espera
              </p>
            </div>
          </div>
        )}

        {error && currentView !== 'checkout' && (
          <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 rounded-xl flex items-start gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-yellow-900 font-medium">{error}</p>
              {effectivePlan === 'free' && error.includes('limite') && (
                <Button
                  onClick={() => setCurrentView('checkout')}
                  variant="link"
                  className="text-yellow-700 hover:text-yellow-800 p-0 h-auto mt-2 font-semibold"
                >
                  Ver Plano PRO →
                </Button>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setError(null)}
              className="flex-shrink-0 h-6 w-6 hover:bg-yellow-200"
            >
              <span className="sr-only">Fechar</span>
            </Button>
          </div>
        )}

        {/* Checkout View */}
        {currentView === 'checkout' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl border border-yellow-200 overflow-hidden">
              {/* Header do Checkout */}
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Crown className="w-8 h-8" />
                    <div>
                      <h2 className="text-2xl font-bold">Química PRO</h2>
                      <p className="text-yellow-100 text-sm">Assinatura Mensal</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCurrentView('home')}
                    className="text-white hover:bg-white/20"
                  >
                    <X className="w-6 h-6" />
                  </Button>
                </div>
                <div className="text-3xl font-bold">R$ 14,99<span className="text-lg font-normal">/mês</span></div>
              </div>

              {/* Benefícios */}
              <div className="p-6 bg-yellow-50 border-b border-yellow-200">
                <h3 className="font-semibold text-yellow-900 mb-3">Benefícios inclusos:</h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-yellow-800">
                    <CheckCircle className="w-4 h-4 text-yellow-600" />
                    Fotos ilimitadas por dia
                  </li>
                  <li className="flex items-center gap-2 text-sm text-yellow-800">
                    <CheckCircle className="w-4 h-4 text-yellow-600" />
                    Perguntas ilimitadas na calculadora
                  </li>
                  <li className="flex items-center gap-2 text-sm text-yellow-800">
                    <CheckCircle className="w-4 h-4 text-yellow-600" />
                    Sem tempo de espera entre fotos
                  </li>
                  <li className="flex items-center gap-2 text-sm text-yellow-800">
                    <CheckCircle className="w-4 h-4 text-yellow-600" />
                    Histórico completo de problemas
                  </li>
                  <li className="flex items-center gap-2 text-sm text-yellow-800">
                    <CheckCircle className="w-4 h-4 text-yellow-600" />
                    Soluções detalhadas e passo a passo
                  </li>
                </ul>
              </div>

              {/* Formulário de Pagamento */}
              {!paymentSuccess ? (
                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="font-semibold text-yellow-900 mb-4 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-yellow-600" />
                      Dados do Cartão
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="cardName" className="text-yellow-900">Nome no Cartão *</Label>
                        <Input
                          id="cardName"
                          placeholder="João Silva"
                          value={checkoutData.cardName}
                          onChange={(e) => handleCheckoutInputChange('cardName', e.target.value)}
                          className="mt-1 border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500"
                        />
                      </div>

                      <div>
                        <Label htmlFor="cardNumber" className="text-yellow-900">Número do Cartão *</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={checkoutData.cardNumber}
                          onChange={(e) => handleCheckoutInputChange('cardNumber', formatCardNumber(e.target.value))}
                          maxLength={19}
                          className="mt-1 border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiryDate" className="text-yellow-900">Validade *</Label>
                          <Input
                            id="expiryDate"
                            placeholder="MM/AA"
                            value={checkoutData.expiryDate}
                            onChange={(e) => handleCheckoutInputChange('expiryDate', formatExpiryDate(e.target.value))}
                            maxLength={5}
                            className="mt-1 border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500"
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv" className="text-yellow-900">CVV *</Label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            value={checkoutData.cvv}
                            onChange={(e) => handleCheckoutInputChange('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                            maxLength={4}
                            className="mt-1 border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-yellow-900 mb-4">Endereço de Cobrança</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="address" className="text-yellow-900">Endereço *</Label>
                        <Input
                          id="address"
                          placeholder="Rua, número, complemento"
                          value={checkoutData.address}
                          onChange={(e) => handleCheckoutInputChange('address', e.target.value)}
                          className="mt-1 border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="city" className="text-yellow-900">Cidade *</Label>
                          <Input
                            id="city"
                            placeholder="São Paulo"
                            value={checkoutData.city}
                            onChange={(e) => handleCheckoutInputChange('city', e.target.value)}
                            className="mt-1 border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500"
                          />
                        </div>
                        <div>
                          <Label htmlFor="state" className="text-yellow-900">Estado *</Label>
                          <Input
                            id="state"
                            placeholder="SP"
                            value={checkoutData.state}
                            onChange={(e) => handleCheckoutInputChange('state', e.target.value.toUpperCase().slice(0, 2))}
                            maxLength={2}
                            className="mt-1 border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="zipCode" className="text-yellow-900">CEP *</Label>
                          <Input
                            id="zipCode"
                            placeholder="12345-678"
                            value={checkoutData.zipCode}
                            onChange={(e) => handleCheckoutInputChange('zipCode', e.target.value)}
                            className="mt-1 border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500"
                          />
                        </div>
                        <div>
                          <Label htmlFor="country" className="text-yellow-900">País *</Label>
                          <Input
                            id="country"
                            value={checkoutData.country}
                            disabled
                            className="mt-1 bg-yellow-50 border-yellow-300"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-yellow-100 border border-yellow-400 rounded-lg flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-yellow-900">{error}</p>
                    </div>
                  )}

                  <Button
                    onClick={handleProcessPayment}
                    disabled={isProcessingPayment}
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-6 text-lg shadow-lg hover:shadow-xl transition-all"
                  >
                    {isProcessingPayment ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5 mr-2" />
                        Confirmar Pagamento - R$ 14,99
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-yellow-700 text-center">
                    Pagamento seguro e criptografado. Você pode cancelar a qualquer momento.
                  </p>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-12 h-12 text-yellow-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-yellow-900 mb-2">Pagamento Aprovado!</h3>
                  <p className="text-yellow-700 mb-4">Sua assinatura PRO foi ativada com sucesso</p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg text-white font-semibold">
                    <Crown className="w-5 h-5" />
                    Bem-vindo ao Química PRO!
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {currentView === 'home' && (
          <div className="space-y-8">
            {/* Hero Section */}
            {!solution && (
              <div className="text-center space-y-6 py-12">
                <h2 className="text-4xl sm:text-5xl font-bold text-yellow-900">
                  Resolva problemas de{' '}
                  <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                    Química
                  </span>
                </h2>
                <p className="text-xl text-yellow-800 max-w-2xl mx-auto">
                  Digitalize problemas impressos ou manuscritos, ou use nossa calculadora científica
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {effectivePlan === 'free' && (
                    <>
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 rounded-full text-sm font-bold border border-yellow-300 shadow-sm">
                        <Camera className="w-4 h-4" />
                        {photosRemaining} {photosRemaining === 1 ? 'foto restante' : 'fotos restantes'}
                      </div>
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 rounded-full text-sm font-bold border border-yellow-300 shadow-sm">
                        <Calculator className="w-4 h-4" />
                        {calculatorRemaining} {calculatorRemaining === 1 ? 'pergunta restante' : 'perguntas restantes'} na calculadora
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {!solution && (
              <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
                <Button
                  onClick={() => setCurrentView('camera')}
                  disabled={waitTime > 0 || (effectivePlan === 'free' && photosRemaining === 0) || showCountdown}
                  className="h-32 bg-gradient-to-br from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <div className="flex flex-col items-center gap-3">
                    <Camera className="w-8 h-8" />
                    <div>
                      <div className="font-semibold text-lg">Capturar Foto</div>
                      <div className="text-sm text-yellow-100">
                        {effectivePlan === 'free' && photosRemaining === 0 
                          ? 'Limite de fotos atingido' 
                          : waitTime > 0 
                          ? `Aguarde ${waitTime}s`
                          : showCountdown
                          ? 'Aguarde...'
                          : 'Tire uma foto do problema'}
                      </div>
                    </div>
                  </div>
                </Button>

                <Button
                  onClick={() => setCurrentView('calculator')}
                  disabled={(effectivePlan === 'free' && calculatorRemaining === 0) || showCountdown}
                  className="h-32 bg-gradient-to-br from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <div className="flex flex-col items-center gap-3">
                    <Calculator className="w-8 h-8" />
                    <div>
                      <div className="font-semibold text-lg">Calculadora</div>
                      <div className="text-sm text-white">
                        {effectivePlan === 'free' && calculatorRemaining === 0
                          ? 'Limite de perguntas atingido'
                          : showCountdown
                          ? 'Aguarde...'
                          : effectivePlan === 'pro' 
                          ? 'Modo Avançado' 
                          : 'Digite o problema químico'}
                      </div>
                    </div>
                  </div>
                </Button>
              </div>
            )}

            {/* Solution Display */}
            {solution && (
              <div className="space-y-6">
                <div className="flex items-center justify-between bg-orange-400 px-6 py-4 rounded-lg">
                  <h3 className="text-2xl font-bold text-yellow-900">Solução</h3>
                  <Button
                    onClick={() => setSolution(null)}
                    variant="outline"
                    className="border-yellow-300 hover:bg-yellow-50 text-yellow-700 font-medium"
                  >
                    Nova Análise
                  </Button>
                </div>
                <SolutionDisplay solution={solution} isPro={effectivePlan === 'pro'} />
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-yellow-800 font-medium">
                  {effectivePlan === 'pro' ? 'Processamento prioritário...' : 'Analisando problema químico...'}
                </p>
              </div>
            )}
          </div>
        )}

        {currentView === 'camera' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-yellow-900">Capturar Problema</h3>
              <Button
                onClick={() => setCurrentView('home')}
                variant="outline"
                className="border-yellow-300 hover:bg-yellow-50 text-yellow-700 font-medium"
              >
                Voltar
              </Button>
            </div>
            <CameraCapture onCapture={handleImageCapture} />
          </div>
        )}

        {currentView === 'calculator' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-yellow-900">
                Calculadora {effectivePlan === 'pro' && 'Avançada'}
              </h3>
              <Button
                onClick={() => setCurrentView('home')}
                variant="outline"
                className="border-yellow-300 hover:bg-yellow-50 text-yellow-700 font-medium"
              >
                Voltar
              </Button>
            </div>
            <CalculatorComponent onSubmit={handleCalculatorSubmit} isLoading={isLoading} />
          </div>
        )}

        {currentView === 'history' && effectivePlan === 'pro' && isSupabaseAvailable && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-yellow-900">Histórico</h3>
              <Button
                onClick={() => setCurrentView('home')}
                variant="outline"
                className="border-yellow-300 hover:bg-yellow-50 text-yellow-700 font-medium"
              >
                Voltar
              </Button>
            </div>
            <HistoryPanel onSelect={handleHistorySelect} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/90 backdrop-blur-sm border-t border-yellow-200 mt-16 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-yellow-800 text-sm font-medium">
            LabSnap - Seu assistente pessoal de Química
          </p>
        </div>
      </footer>
    </div>
  );
}
