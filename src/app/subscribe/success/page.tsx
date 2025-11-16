'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Crown, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SubscribeSuccessPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Simula ativação da assinatura PRO
    // Em produção, isso seria feito no backend após confirmação do pagamento
    if (typeof window !== 'undefined') {
      const userId = 'demo_user'; // Substituir por ID real do usuário
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1); // 1 mês de assinatura

      localStorage.setItem(`subscription_${userId}`, JSON.stringify({
        plan: 'pro',
        photosUsedToday: 0,
        expiresAt: expiresAt.toISOString(),
      }));
    }

    // Countdown para redirecionamento
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Success Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-8 text-center relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }} />
            </div>

            {/* Animated Crown */}
            <div className="relative z-10 mb-4">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full animate-bounce">
                <Crown className="w-12 h-12 text-yellow-200" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-white mb-2 relative z-10">
              Bem-vindo ao Química PRO!
            </h1>
            <p className="text-white/90 text-lg relative z-10">
              Sua assinatura foi ativada com sucesso
            </p>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            {/* Success Message */}
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-green-900">Pagamento confirmado</p>
                <p className="text-sm text-green-700">Você agora tem acesso a todos os recursos PRO</p>
              </div>
            </div>

            {/* Features Unlocked */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-500" />
                Recursos Desbloqueados
              </h2>
              <ul className="space-y-3">
                {[
                  'Fotos ilimitadas por dia',
                  'Explicações passo a passo completas',
                  'Calculadora química avançada',
                  'Histórico de exercícios salvos',
                  'Prioridade no processamento',
                  'Sem intervalos entre fotos',
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA Button */}
            <div className="space-y-3">
              <Button
                onClick={() => router.push('/')}
                className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Crown className="w-5 h-5 mr-2" />
                Começar a Usar Agora
              </Button>
              
              <p className="text-center text-sm text-gray-500">
                Redirecionando em {countdown} segundo{countdown !== 1 ? 's' : ''}...
              </p>
            </div>

            {/* Support Info */}
            <div className="pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center">
                Dúvidas? Entre em contato com nosso suporte a qualquer momento.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
