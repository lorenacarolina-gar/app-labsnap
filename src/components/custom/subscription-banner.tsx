'use client';

import { Crown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface SubscriptionBannerProps {
  onUpgrade: () => void;
  photosRemaining: number;
}

export function SubscriptionBanner({ onUpgrade, photosRemaining }: SubscriptionBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }} />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-0 right-0 p-2 hover:bg-white/20 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Crown className="w-6 h-6 text-yellow-200" />
          </div>

          <div className="flex-1 space-y-3">
            <div>
              <h3 className="text-xl font-bold mb-1">
                Você tem {photosRemaining} {photosRemaining === 1 ? 'foto restante' : 'fotos restantes'} hoje
              </h3>
              <p className="text-white/90 text-sm">
                Assine o Química PRO e tenha acesso ilimitado a todas as funcionalidades!
              </p>
            </div>

            <Button
              onClick={onUpgrade}
              className="bg-white text-orange-600 hover:bg-gray-100 font-semibold shadow-lg"
            >
              <Crown className="w-4 h-4 mr-2" />
              Ver Plano PRO
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
