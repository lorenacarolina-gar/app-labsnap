'use client';

import { BookOpen, Lightbulb, CheckCircle2, Crown, ArrowRight, Beaker, Calculator as CalcIcon } from 'lucide-react';
import type { ChemProblemAnalysis } from '@/lib/openai';

interface SolutionDisplayProps {
  solution: ChemProblemAnalysis;
  isPro?: boolean;
}

export function SolutionDisplay({ solution, isPro = false }: SolutionDisplayProps) {
  // Formatar a solução de forma limpa e legível
  const formatSolution = () => {
    // Se solution.solution for string, retornar direto
    if (typeof solution.solution === 'string') {
      return solution.solution;
    }

    // Se for objeto, formatar apenas a resposta final
    if (solution.solution && typeof solution.solution === 'object') {
      return solution.solution.final_answer || 'Resposta não disponível';
    }

    return 'Resposta não disponível';
  };

  const formattedSolution = formatSolution();

  // Extrair dados estruturados se existirem
  const solutionData = typeof solution.solution === 'object' ? solution.solution : null;
  const hasSteps = solutionData?.steps && Array.isArray(solutionData.steps) && solutionData.steps.length > 0;
  const hasMethods = solutionData?.methods && Array.isArray(solutionData.methods) && solutionData.methods.length > 0;

  return (
    <div className="space-y-6">
      {/* Problem Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-yellow-500 px-6 py-4">
          <div className="flex items-center gap-2 text-white">
            <BookOpen className="w-5 h-5" />
            <h3 className="font-semibold text-lg">Problema</h3>
          </div>
        </div>
        <div className="p-6">
          <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap">
            {solution.problem_text}
          </p>
        </div>
      </div>

      {/* Topic & Difficulty */}
      <div className="flex flex-wrap gap-3">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
          <Lightbulb className="w-4 h-4" />
          <span className="text-sm font-medium">{solution.topic}</span>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg border border-purple-200">
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-sm font-medium capitalize">
            {solution.difficulty === 'easy' && 'Fácil'}
            {solution.difficulty === 'medium' && 'Médio'}
            {solution.difficulty === 'hard' && 'Difícil'}
          </span>
        </div>
      </div>

      {/* Passo a Passo - APENAS PARA PRO */}
      {isPro && hasSteps && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
          <div className="bg-orange-500 px-6 py-4">
            <div className="flex items-center gap-2 text-white">
              <Beaker className="w-5 h-5" />
              <h3 className="font-semibold text-lg">Passo a Passo da Resolução</h3>
            </div>
          </div>
          <div className="p-6 space-y-6">
            {solutionData.steps.map((step: any, index: number) => (
              <div key={index} className="relative pl-8 pb-6 border-l-2 border-white last:border-l-0 last:pb-0 bg-yellow-100">
                <div className="absolute -left-3 top-0 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {step.step_number}
                </div>
                <div className="space-y-2">
                  <h4 className="text-lg font-semibold text-gray-900">{step.title}</h4>
                  <p className="text-gray-700 leading-relaxed">{step.description}</p>
                  {step.formula && (
                    <div className="mt-3 p-3 rounded-lg border border-orange-500 bg-transparent">
                      <p className="text-sm text-orange-500 font-medium mb-1">Fórmula:</p>
                      <p className="text-black font-mono text-base">{step.formula}</p>
                    </div>
                  )}
                  {step.calculation && (
                    <div className="mt-3 p-3 rounded-lg border border-orange-500">
                      <p className="text-sm text-orange-500 font-medium mb-1">Cálculo:</p>
                      <p className="text-gray-700 font-mono text-base">{step.calculation}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Explicação Conceitual - APENAS PARA PRO */}
      {isPro && solutionData?.explanation && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
          <div className="bg-yellow-400 px-6 py-4">
            <div className="flex items-center gap-2 text-white">
              <Lightbulb className="w-5 h-5" />
              <h3 className="font-semibold text-lg">Explicação Conceitual</h3>
            </div>
          </div>
          <div className="p-6">
            <p className="text-gray-800 text-base leading-relaxed whitespace-pre-wrap">
              {solutionData.explanation}
            </p>
          </div>
        </div>
      )}

      {/* Resposta Final */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <CheckCircle2 className="w-5 h-5" />
              <h3 className="font-semibold text-lg">
                Resposta Final
              </h3>
            </div>
            {!isPro && (
              <div className="flex items-center gap-1 px-2 py-1 bg-white/20 rounded-lg">
                <Crown className="w-4 h-4" />
                <span className="text-xs font-bold">PRO</span>
              </div>
            )}
          </div>
        </div>
        <div className="p-6">
          <div className="prose prose-lg max-w-none">
            <div className="text-gray-800 text-2xl font-bold leading-relaxed whitespace-pre-wrap">
              {formattedSolution}
            </div>
          </div>

          {/* Upgrade CTA for Free Users */}
          {!isPro && (
            <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl">
              <div className="flex items-start gap-3">
                <Crown className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 mb-1">
                    Desbloqueie explicações completas
                  </p>
                  <p className="text-xs text-gray-600 mb-3">
                    Assine o Química PRO para ver:
                  </p>
                  <ul className="text-xs text-gray-700 space-y-1 mb-3">
                    <li className="flex items-center gap-2">
                      <ArrowRight className="w-3 h-3 text-orange-600" />
                      Passo a passo completo da resolução
                    </li>
                    <li className="flex items-center gap-2">
                      <ArrowRight className="w-3 h-3 text-orange-600" />
                      Explicação conceitual detalhada
                    </li>
                    <li className="flex items-center gap-2">
                      <ArrowRight className="w-3 h-3 text-orange-600" />
                      Métodos alternativos de resolução
                    </li>
                  </ul>
                  <a
                    href="/subscribe"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white text-sm font-semibold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    <Crown className="w-4 h-4" />
                    Ver Plano PRO
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Métodos Alternativos - APENAS PARA PRO */}
      {isPro && hasMethods && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-4">
            <div className="flex items-center gap-2 text-white">
              <CalcIcon className="w-5 h-5" />
              <h3 className="font-semibold text-lg">Métodos Alternativos de Resolução</h3>
            </div>
          </div>
          <div className="p-6 space-y-8">
            {solutionData.methods.map((method: any, methodIndex: number) => (
              <div key={methodIndex} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xl font-bold text-gray-900">{method.method_name}</h4>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-50 text-cyan-700 rounded-lg border border-cyan-200">
                    <span className="text-xs font-medium capitalize">
                      {method.difficulty === 'easy' && 'Fácil'}
                      {method.difficulty === 'medium' && 'Médio'}
                      {method.difficulty === 'hard' && 'Difícil'}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {method.steps && Array.isArray(method.steps) && method.steps.map((step: any, stepIndex: number) => (
                    <div key={stepIndex} className="relative pl-8 pb-4 border-l-2 border-cyan-200 last:border-l-0 last:pb-0">
                      <div className="absolute -left-3 top-0 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {step.step_number}
                      </div>
                      <div className="space-y-2">
                        <h5 className="text-base font-semibold text-gray-900">{step.title}</h5>
                        <p className="text-gray-700 text-sm leading-relaxed">{step.description}</p>
                        {step.formula && (
                          <div className="mt-2 p-2 bg-cyan-50 rounded-lg border border-cyan-200">
                            <p className="text-xs text-cyan-700 font-medium mb-1">Fórmula:</p>
                            <p className="text-cyan-900 font-mono text-sm">{step.formula}</p>
                          </div>
                        )}
                        {step.calculation && (
                          <div className="mt-2 p-2 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-xs text-green-700 font-medium mb-1">Cálculo:</p>
                            <p className="text-green-900 font-mono text-sm">{step.calculation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {methodIndex < solutionData.methods.length - 1 && (
                  <div className="border-t border-gray-200 pt-4" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
