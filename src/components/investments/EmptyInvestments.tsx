// components/investments/EmptyInvestments.tsx
import { TrendingUp, Plus } from 'lucide-react';

export function EmptyInvestments() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mb-6">
        <TrendingUp className="w-12 h-12 text-primary-600" />
      </div>
      
      <div className="text-center max-w-md">
        <h3 className="text-2xl font-bold text-neutral-900 mb-2">
          📈 Seus investimentos aparecerão aqui!
        </h3>
        <p className="text-neutral-600 mb-6">
          Você ainda não possui investimentos cadastrados. Sincronize sua conta para visualizar seus ativos financeiros.
        </p>
        
        <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg p-4 border border-primary-100">
          <div className="flex items-center gap-3 text-sm text-primary-700">
            <Plus className="w-4 h-4" />
            <span>
              Clique em <strong>"Sincronizar Investimentos"</strong> para começar
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
