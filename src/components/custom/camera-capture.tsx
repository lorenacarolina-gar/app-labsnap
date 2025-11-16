'use client';

import { useState, useRef } from 'react';
import { Camera, Upload, X, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CameraCaptureProps {
  onCapture: (imageUrl: string) => void;
}

export function CameraCapture({ onCapture }: CameraCaptureProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  const startCamera = async () => {
    setError(null);
    
    // Verificar se a API está disponível
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('📷 Seu navegador não suporta acesso à câmera. Por favor, faça upload de uma imagem da galeria.');
      return;
    }

    // Verificar se está em contexto seguro (HTTPS ou localhost)
    const isSecureContext = window.isSecureContext;
    if (!isSecureContext) {
      setError('🔒 A câmera só funciona em conexões seguras (HTTPS). Por favor, faça upload de uma imagem da galeria.');
      return;
    }

    try {
      // Primeiro, verificar se há dispositivos de vídeo disponíveis
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      if (videoDevices.length === 0) {
        setError('📷 Nenhuma câmera encontrada no dispositivo. Por favor, faça upload de uma imagem da galeria.');
        return;
      }

      // Tentar acessar a câmera com configurações simples primeiro
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });
      
      setStream(mediaStream);
      setShowCamera(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error('Erro ao acessar câmera:', err);
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('🔒 Permissão de câmera negada. Por favor, permita o acesso à câmera nas configurações do navegador e recarregue a página, ou faça upload de uma imagem da galeria.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('📷 Nenhuma câmera encontrada no dispositivo. Por favor, faça upload de uma imagem da galeria.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setError('⚠️ A câmera está sendo usada por outro aplicativo. Feche outros apps que possam estar usando a câmera e tente novamente, ou faça upload de uma imagem da galeria.');
      } else if (err.name === 'OverconstrainedError' || err.name === 'ConstraintNotSatisfiedError') {
        setError('❌ Configurações de câmera não suportadas. Por favor, faça upload de uma imagem da galeria.');
      } else if (err.name === 'TypeError') {
        setError('🔒 A câmera só funciona em conexões seguras (HTTPS). Por favor, faça upload de uma imagem da galeria.');
      } else if (err.name === 'SecurityError') {
        setError('🔒 Acesso à câmera bloqueado por política de segurança. Por favor, faça upload de uma imagem da galeria.');
      } else {
        setError('❌ Não foi possível acessar a câmera. Por favor, faça upload de uma imagem da galeria.');
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setPreviewUrl(dataUrl);
      stopCamera();
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione um arquivo de imagem válido.');
      setIsProcessing(false);
      return;
    }

    // Validar tamanho (máx 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Imagem muito grande. O tamanho máximo é 10MB.');
      setIsProcessing(false);
      return;
    }

    // Criar preview local
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
      setIsProcessing(false);
    };
    reader.onerror = () => {
      setError('Erro ao ler o arquivo. Tente novamente.');
      setIsProcessing(false);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!previewUrl) return;

    setIsProcessing(true);
    setError(null);
    
    try {
      // ✅ Usa base64 diretamente - sem upload para Supabase Storage
      // A imagem é enviada diretamente para a API de análise
      onCapture(previewUrl);
      
      // Reset
      handleReset();
    } catch (error: any) {
      console.error('Erro ao processar imagem:', error);
      setError(error.message || 'Erro ao processar a imagem. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setPreviewUrl(null);
    setError(null);
    stopCamera();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-800 leading-relaxed">{error}</p>
            {error.includes('Permissão de câmera negada') && (
              <div className="mt-3 pt-3 border-t border-red-200">
                <p className="text-xs text-red-700 font-semibold mb-2">Como permitir o acesso à câmera:</p>
                <ul className="text-xs text-red-700 space-y-1 list-disc list-inside">
                  <li>Chrome/Edge: Clique no ícone de cadeado na barra de endereço → Permissões → Câmera → Permitir</li>
                  <li>Firefox: Clique no ícone de cadeado → Permissões → Câmera → Permitir</li>
                  <li>Safari: Configurações → Safari → Câmera → Permitir</li>
                </ul>
                <p className="text-xs text-red-700 mt-2 font-semibold">Após permitir, recarregue a página e tente novamente.</p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setError(null)}
            className="flex-shrink-0 h-6 w-6"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Camera View */}
      {showCamera && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg">
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-auto max-h-96 object-contain bg-black"
            />
            
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
              <Button
                onClick={capturePhoto}
                className="bg-white hover:bg-gray-100 text-gray-900 shadow-lg"
              >
                <Camera className="w-5 h-5 mr-2" />
                Capturar
              </Button>
              
              <Button
                onClick={stopCamera}
                variant="outline"
                className="bg-white hover:bg-gray-100 border-gray-300"
              >
                <X className="w-5 h-5 mr-2" />
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Area */}
      {!previewUrl && !showCamera && (
        <div className={`bg-white rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300 ${
          isProcessing 
            ? 'border-orange-400 animate-spin-border' 
            : 'border-orange-400 hover:border-orange-500'
        }`}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="camera-input"
          />
          
          <div className="space-y-6">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-full flex items-center justify-center mx-auto">
              <Camera className="w-10 h-10 text-orange-600" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-900">
                Faça upload de uma imagem
              </h3>
              <p className="text-gray-600">
                Selecione uma imagem do problema químico da sua galeria
              </p>
            </div>

            <div className="flex justify-center">
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="border-gray-300 hover:bg-gray-50"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Carregando...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 mr-2" />
                    Fazer Upload
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Area */}
      {previewUrl && !showCamera && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg">
            <div className="relative">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-auto max-h-96 object-contain bg-gray-50"
              />
              
              <Button
                onClick={handleReset}
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 bg-white/90 hover:bg-white shadow-lg"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-6 bg-gradient-to-br from-orange-50 to-yellow-50 border-t border-gray-200">
              <div className="flex gap-2">
                <Button
                  onClick={handleAnalyze}
                  disabled={isProcessing}
                  className="flex-1 bg-gradient-to-r from-orange-400 to-yellow-400 hover:from-orange-500 hover:to-yellow-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      Resolver Problema
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={handleReset}
                  variant="outline"
                  disabled={isProcessing}
                  className="border-gray-300 hover:bg-white"
                >
                  <X className="w-5 h-5 mr-2" />
                  Cancelar
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-800">
              <strong>Dica:</strong> Certifique-se de que o problema está bem iluminado e legível para melhores resultados.
            </p>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin-border {
          0% {
            border-color: #fb923c;
          }
          50% {
            border-color: #f97316;
          }
          100% {
            border-color: #fb923c;
          }
        }
        
        .animate-spin-border {
          animation: spin-border 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
