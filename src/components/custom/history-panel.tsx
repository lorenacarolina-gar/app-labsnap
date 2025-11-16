'use client';

import { useEffect, useState } from 'react';
import { Clock, Star, Trash2, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getProblemHistory, toggleFavorite, supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import type { ChemProblem } from '@/lib/supabase';

interface HistoryPanelProps {
  onSelect: (problem: ChemProblem) => void;
}

export function HistoryPanel({ onSelect }: HistoryPanelProps) {
  const [problems, setProblems] = useState<ChemProblem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      const user = await getCurrentUser();
      const data = await getProblemHistory(user?.id);
      setProblems(data || []);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavorite = async (problemId: string, currentState: boolean) => {
    try {
      await toggleFavorite(problemId, !currentState);
      setProblems(problems.map(p => 
        p.id === problemId ? { ...p, is_favorite: !currentState } : p
      ));
    } catch (error) {
      console.error('Erro ao atualizar favorito:', error);
    }
  };

  const handleDelete = async (problemId: string) => {
    try {
      await supabase.from('chem_problems').delete().eq('id', problemId);
      setProblems(problems.filter(p => p.id !== problemId));
    } catch (error) {
      console.error('Erro ao deletar problema:', error);
    }
  };

  const filteredProblems = filter === 'favorites' 
    ? problems.filter(p => p.is_favorite)
    : problems;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 font-medium transition-colors ${
            filter === 'all'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Todos ({problems.length})
        </button>
        <button
          onClick={() => setFilter('favorites')}
          className={`px-4 py-2 font-medium transition-colors ${
            filter === 'favorites'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Favoritos ({problems.filter(p => p.is_favorite).length})
        </button>
      </div>

      {/* Problems List */}
      {filteredProblems.length === 0 ? (
        <div className="text-center py-12 space-y-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Nenhum problema encontrado</h3>
            <p className="text-gray-600">
              {filter === 'favorites' 
                ? 'Você ainda não marcou nenhum problema como favorito'
                : 'Comece resolvendo seu primeiro problema de química'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredProblems.map((problem) => (
            <div
              key={problem.id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group"
              onClick={() => onSelect(problem)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  {/* Topic Badge */}
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                      {problem.topic}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(problem.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  {/* Problem Text */}
                  <p className="text-gray-900 font-medium line-clamp-2">
                    {problem.problem_text}
                  </p>

                  {/* Image Preview */}
                  {problem.problem_image_url && (
                    <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={problem.problem_image_url}
                        alt="Problema"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Solution Preview */}
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Resposta:</span>{' '}
                    {problem.solution.final_answer}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(problem.id, problem.is_favorite);
                    }}
                    className={`hover:bg-yellow-50 ${
                      problem.is_favorite ? 'text-yellow-500' : 'text-gray-400'
                    }`}
                  >
                    <Star className={`w-5 h-5 ${problem.is_favorite ? 'fill-current' : ''}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Deseja realmente deletar este problema?')) {
                        handleDelete(problem.id);
                      }
                    }}
                    className="hover:bg-red-50 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
