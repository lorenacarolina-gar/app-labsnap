'use client';

import { Clock } from 'lucide-react';

interface CountdownModalProps {
  isOpen: boolean;
  countdown: number;
  onUpgrade: () => void;
}

export function CountdownModal({ isOpen, countdown, onUpgrade }: CountdownModalProps) {
  if (!isOpen) return null;

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  const timeDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-400 to-yellow-400 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <Clock className="w-6 h-6" />
              <h3 className="font-bold text-xl">Aguarde para continuar</h3>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Countdown Display */}
          <div className="flex flex-col items-center justify-center py-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-8 border-orange-100 flex items-center justify-center shadow-lg">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900">{timeDisplay}</div>
                  <div className="text-sm text-gray-600 mt-1 font-medium">segundos</div>
                </div>
              </div>
              <div 
                className="absolute inset-0 rounded-full border-8 border-orange-400 border-t-transparent animate-spin"
                style={{ animationDuration: '2s' }}
              />
            </div>
          </div>

          {/* Message */}
          <div className="text-center space-y-2">
            <p className="text-gray-900 font-semibold text-lg">
              Aguarde {countdown} segundos para fazer sua próxima pergunta
            </p>
            <p className="text-sm text-gray-600">
              Usuários do plano gratuito precisam aguardar entre perguntas
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-orange-100 rounded-full h-3 overflow-hidden shadow-inner">
            <div 
              className="bg-gradient-to-r from-orange-400 to-yellow-400 h-full transition-all duration-1000 ease-linear shadow-sm"
              style={{ width: `${((30 - countdown) / 30) * 100}%` }}
            />
          </div>

          {/* Info */}
          <div className="text-center">
            <p className="text-xs text-gray-500 font-medium">
              O botão de nova pergunta será liberado automaticamente quando o tempo acabar
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
