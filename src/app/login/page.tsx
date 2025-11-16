'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signIn, signUp } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isSignUp) {
        // Criar conta e fazer login automático
        await signUp(email, password, fullName);
        setSuccess('Conta criada com sucesso! Redirecionando...');
        
        // Aguardar 1 segundo e redirecionar automaticamente
        setTimeout(() => {
          router.push('/');
        }, 1000);
      } else {
        const result = await signIn(email, password);
        if (result) {
          router.push('/');
        }
      }
    } catch (err: any) {
      console.error('Erro de autenticação:', err);
      
      // Tratamento específico de erros
      if (err.message?.includes('Invalid login credentials')) {
        setError('Email ou senha incorretos. Verifique suas credenciais e tente novamente.');
      } else if (err.message?.includes('User already registered')) {
        setError('Este email já está cadastrado. Faça login ou recupere sua senha.');
      } else {
        setError(err.message || 'Erro ao autenticar. Verifique suas credenciais e tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-7 h-7 text-white"
                strokeWidth={2}
              >
                {/* Frasco Erlenmeyer vazio com base reta */}
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 3h6M10 3v5l-4 8v5h12v-5l-4-8V3M6 21h12"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
              LabSnap
            </h1>
          </div>
          <p className="text-gray-600">
            {isSignUp ? 'Crie sua conta para começar' : 'Entre na sua conta'}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-800">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-gray-700 font-medium">
                  Nome Completo
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Seu nome"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10 h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                    required={isSignUp}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                  required
                  minLength={6}
                />
              </div>
              {isSignUp && (
                <p className="text-xs text-gray-500 mt-1">
                  Mínimo de 6 caracteres
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processando...
                </div>
              ) : (
                isSignUp ? 'Criar Conta e Entrar' : 'Entrar'
              )}
            </Button>
          </form>

          {/* Toggle Sign Up / Sign In */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setSuccess(null);
              }}
              className="text-sm text-gray-600 hover:text-orange-500 transition-colors"
            >
              {isSignUp ? (
                <>
                  Já tem uma conta?{' '}
                  <span className="font-semibold text-orange-500">Entre aqui</span>
                </>
              ) : (
                <>
                  Não tem uma conta?{' '}
                  <span className="font-semibold text-orange-500">Cadastre-se</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-8">
          Ao continuar, você concorda com nossos Termos de Uso
        </p>
      </div>
    </div>
  );
}
