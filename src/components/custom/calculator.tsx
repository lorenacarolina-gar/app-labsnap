'use client';

import { useState } from 'react';
import { Send, Delete, Plus, Minus, X as Multiply, Divide, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface CalculatorProps {
  onSubmit: (expression: string) => void;
  isLoading?: boolean;
}

export function CalculatorComponent({ onSubmit, isLoading = false }: CalculatorProps) {
  const [expression, setExpression] = useState('');
  const [showLetterKeyboard, setShowLetterKeyboard] = useState(false);

  const handleButtonClick = (value: string) => {
    setExpression(prev => prev + value);
  };

  const handleClear = () => {
    setExpression('');
  };

  const handleBackspace = () => {
    setExpression(prev => prev.slice(0, -1));
  };

  const handleSubmit = () => {
    if (expression.trim()) {
      onSubmit(expression);
      setExpression('');
    }
  };

  const buttons = [
    // Linha 1 - Funções químicas
    { label: 'H₂O', value: 'H2O' },
    { label: 'CO₂', value: 'CO2' },
    { label: 'NaCl', value: 'NaCl' },
    { label: 'H₂SO₄', value: 'H2SO4' },
    
    // Linha 2 - Operadores matemáticos
    { label: '+', value: ' + ', icon: Plus },
    { label: '-', value: ' - ', icon: Minus },
    { label: '×', value: ' × ', icon: Multiply },
    { label: '÷', value: ' ÷ ', icon: Divide },
    
    // Linha 3 - Números e símbolos
    { label: '7', value: '7' },
    { label: '8', value: '8' },
    { label: '9', value: '9' },
    { label: '(', value: '(' },
    
    { label: '4', value: '4' },
    { label: '5', value: '5' },
    { label: '6', value: '6' },
    { label: ')', value: ')' },
    
    { label: '1', value: '1' },
    { label: '2', value: '2' },
    { label: '3', value: '3' },
    { label: 'mol', value: ' mol' },
    
    { label: '0', value: '0' },
    { label: '.', value: '.' },
    { label: '→', value: ' → ' },
    { label: 'g', value: ' g' },
  ];

  // Teclado de letras otimizado para 375px
  const letterRows = [
    ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
    ['K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'],
    ['U', 'V', 'W', 'X', 'Y', 'Z'],
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Text Input Area */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between bg-orange-400 px-4 py-3 rounded-lg">
            <h3 className="text-lg font-semibold text-white">Digite o problema químico</h3>
            <Button
              onClick={handleClear}
              variant="ghost"
              size="sm"
              className="text-red-600 hover:bg-red-50"
              disabled={isLoading}
            >
              <Delete className="w-4 h-4 mr-2" />
              Limpar
            </Button>
          </div>

          <Textarea
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            placeholder="Ex: Calcule a massa molar de 2 mol de H2SO4"
            className="min-h-32 text-lg font-mono resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            disabled={isLoading}
          />

          <div className="flex gap-2">
            <Button
              onClick={handleBackspace}
              variant="outline"
              className="border-gray-400 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold"
              disabled={isLoading}
            >
              ← Apagar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!expression.trim() || isLoading}
              className="flex-1 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Resolver Problema
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Input Buttons */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Atalhos Rápidos</h3>
          <Button
            onClick={() => setShowLetterKeyboard(!showLetterKeyboard)}
            variant="outline"
            className="h-10 px-4 font-bold text-base border-2 border-gray-700 bg-white hover:bg-gray-50 text-gray-800 transition-all duration-200"
            disabled={isLoading}
          >
            ABC
          </Button>
        </div>
        
        {!showLetterKeyboard ? (
          <div className="grid grid-cols-4 gap-2">
            {buttons.map((button, index) => {
              const Icon = button.icon;
              return (
                <Button
                  key={index}
                  onClick={() => handleButtonClick(button.value)}
                  variant="outline"
                  className="h-14 text-base font-medium border-gray-300 hover:bg-blue-50 hover:border-blue-400 transition-all duration-200"
                  disabled={isLoading}
                >
                  {Icon ? <Icon className="w-5 h-5" /> : button.label}
                </Button>
              );
            })}
          </div>
        ) : (
          <div className="space-y-1.5">
            {letterRows.map((row, rowIndex) => (
              <div key={rowIndex} className="flex gap-1 justify-center">
                {row.map((letter) => (
                  <Button
                    key={letter}
                    onClick={() => handleButtonClick(letter)}
                    variant="outline"
                    className="h-11 w-8 text-sm font-bold border-gray-300 hover:bg-blue-50 hover:border-blue-400 transition-all duration-200 p-0"
                    disabled={isLoading}
                  >
                    {letter}
                  </Button>
                ))}
              </div>
            ))}
            <div className="flex gap-1 justify-center mt-3">
              <Button
                onClick={() => handleButtonClick(' ')}
                variant="outline"
                className="h-11 flex-1 text-sm font-medium border-gray-300 hover:bg-blue-50 hover:border-blue-400 transition-all duration-200"
                disabled={isLoading}
              >
                Espaço
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Examples */}
      <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl border border-orange-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 bg-orange-100 p-3 rounded-lg">Exemplos de Problemas</h3>
        <div className="space-y-3">
          {[
            'Calcule a massa molar de H2SO4',
            'Balanceie: Fe + O2 → Fe2O3',
            'Qual o pH de uma solução 0.01M de NaOH?',
            'Quantos gramas há em 3 mol de NaCl?',
            'Calcule a concentração molar de 10g de NaOH em 500mL',
          ].map((example, index) => (
            <button
              key={index}
              onClick={() => setExpression(example)}
              className="w-full text-left px-4 py-3 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all duration-200 text-sm text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
