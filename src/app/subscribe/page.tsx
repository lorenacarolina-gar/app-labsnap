'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Crown, 
  Check, 
  X, 
  Camera, 
  BookOpen, 
  History, 
  Zap,
  Calculator,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSubscriptionPrice } from '@/lib/subscription';

export default function SubscribePage() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [pricing, setPricing] = useState({ formatted: 'R$ 14,90', currency: 'BRL' });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setPricing(getSubscriptionPrice());
  }, []);

  const handleSubscribe = async () => {
    setIsProcessing(true);
    
    // Simula processamento de pagamento
    // Em produção, integrar com Stripe, Mercado Pago, etc.
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Redireciona para página de sucesso
    router.push('/subscribe/success');
  };

  const features = {
    pro: [
      { icon: Camera, text: 'Fotos ilimitadas por dia', highlight: true },
      { icon: BookOpen, text: 'Explicações passo a passo completas', highlight: true },
      { icon: Calculator, text: 'Calculadora química avançada', highlight: true },
      { icon: History, text: 'Histórico de exercícios salvos', highlight: true },
      { icon: Zap, text: 'Prioridade no processamento', highlight: true },
      { icon: Check, text: 'Sem intervalos entre fotos', highlight: true },
    ],
    free: [
      { icon: Camera, text: 'Apenas 3 fotos por dia', highlight: false },
      { icon: X, text: 'Explicações básicas', highlight: false },
      { icon: X, text: 'Calculadora limitada', highlight: false },
      { icon: X, text: 'Sem histórico', highlight: false },
      { icon: X, text: 'Processamento padrão', highlight: false },
      { icon: X, text: 'Intervalo de 30s entre fotos', highlight: false },
    ],
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-yellow-600 rounded-xl flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
                Química PRO
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
            <Crown className="w-4 h-4" />
            Oferta Especial
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
            Desbloqueie todo o potencial do{' '}
            <span className="bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
              ChemSnap
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Resolva exercícios ilimitados com explicações detalhadas e ferramentas avançadas
          </p>
        </div>

        {/* Comparison Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
          {/* Free Plan */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Plano Gratuito</h3>
              <div className="text-3xl font-bold text-gray-600">
                R$ 0
                <span className="text-lg font-normal text-gray-500">/mês</span>
              </div>
            </div>

            <ul className="space-y-4">
              {features.free.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="w-3 h-3 text-gray-500" />
                    </div>
                    <span className="text-gray-600">{feature.text}</span>
                  </li>
                );
              })}
            </ul>

            <Button
              variant="outline"
              className="w-full border-gray-300 hover:bg-gray-50"
              onClick={() => router.back()}
            >
              Continuar Gratuito
            </Button>
          </div>

          {/* Pro Plan */}
          <div className="bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl border-2 border-orange-400 p-8 space-y-6 shadow-2xl relative overflow-hidden">
            {/* Badge */}
            <div className="absolute top-4 right-4">
              <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-bold">
                MAIS POPULAR
              </div>
            </div>

            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }} />
            </div>

            <div className="relative z-10 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-6 h-6 text-yellow-200" />
                  <h3 className="text-2xl font-bold text-white">Química PRO</h3>
                </div>
                <div className="text-4xl font-bold text-white">
                  {pricing.formatted}
                  <span className="text-lg font-normal text-white/80">/mês</span>
                </div>
                <p className="text-white/80 text-sm mt-1">
                  {pricing.currency === 'BRL' ? 'Para usuários do Brasil' : 'Para usuários internacionais'}
                </p>
              </div>

              <ul className="space-y-4">
                {features.pro.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-white font-medium">{feature.text}</span>
                    </li>
                  );
                })}
              </ul>

              <Button
                onClick={handleSubscribe}
                disabled={isProcessing}
                className="w-full bg-white text-orange-600 hover:bg-gray-100 font-bold text-lg py-6 shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-orange-600 border-t-transparent rounded-full animate-spin mr-2" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Crown className="w-5 h-5 mr-2" />
                    Assinar Química PRO
                  </>
                )}
              </Button>

              <p className="text-white/80 text-xs text-center">
                Cancele a qualquer momento. Sem compromisso.
              </p>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Por que escolher o Química PRO?
          </h3>
          
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {
                icon: Camera,
                title: 'Sem Limites',
                description: 'Tire quantas fotos quiser, sem restrições diárias ou intervalos forçados.',
              },
              {
                icon: BookOpen,
                title: 'Explicações Completas',
                description: 'Entenda cada passo da resolução com explicações detalhadas e didáticas.',
              },
              {
                icon: Calculator,
                title: 'Ferramentas Avançadas',
                description: 'Acesso à calculadora química avançada com todas as funcionalidades.',
              },
              {
                icon: History,
                title: 'Histórico Completo',
                description: 'Salve e revise todos os seus exercícios resolvidos a qualquer momento.',
              },
            ].map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-xl flex items-center justify-center">
                    <Icon className="w-6 h-6 text-orange-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">{benefit.title}</h4>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
