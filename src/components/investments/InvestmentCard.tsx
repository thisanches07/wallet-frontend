// components/investments/InvestmentCard.tsx
import { Investment } from '@/types/investment';
import { formatCurrency, formatDate, formatPercentage, getStatusColor, getStatusText } from '@/utils/investmentUtils';
import { TrendingUp, TrendingDown, Calendar, Hash, Building2 } from 'lucide-react';

interface InvestmentCardProps {
  investment: Investment;
}

export function InvestmentCard({ investment }: InvestmentCardProps) {
  const amount = typeof investment.amount === 'string' ? parseFloat(investment.amount) : investment.amount;
  const value = typeof investment.value === 'string' ? parseFloat(investment.value) : investment.value;
  const quantity = typeof investment.quantity === 'string' ? parseFloat(investment.quantity) : investment.quantity;
  const lastTwelveMonthsRate = investment.lastTwelveMonthsRate 
    ? typeof investment.lastTwelveMonthsRate === 'string' 
      ? parseFloat(investment.lastTwelveMonthsRate) 
      : investment.lastTwelveMonthsRate
    : null;

  const isPositiveReturn = lastTwelveMonthsRate && lastTwelveMonthsRate > 0;

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-primary-200">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="font-bold text-lg text-neutral-900 mb-1">{investment.name}</h3>
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            {investment.code && (
              <div className="flex items-center gap-1">
                <Hash className="w-3 h-3" />
                <span className="font-mono">{investment.code}</span>
              </div>
            )}
            {investment.isin && !investment.code && (
              <div className="flex items-center gap-1">
                <Hash className="w-3 h-3" />
                <span className="font-mono text-xs">{investment.isin}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(investment.status)}`}>
            {getStatusText(investment.status)}
          </span>
          <div className="flex items-center gap-1 text-xs text-neutral-500">
            <Calendar className="w-3 h-3" />
            {formatDate(investment.date)}
          </div>
        </div>
      </div>

      {/* Type and Subtype */}
      {investment.subtype && (
        <div className="mb-4">
          <span className="text-sm text-neutral-600 bg-neutral-100 px-2 py-1 rounded-lg">
            {investment.subtype}
          </span>
        </div>
      )}

      {/* Financial Info */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-neutral-600">Valor Total</p>
          <p className="text-xl font-bold text-neutral-900">{formatCurrency(amount)}</p>
        </div>
        <div>
          <p className="text-sm text-neutral-600">Valor Unitário</p>
          <p className="text-lg font-semibold text-neutral-700">{formatCurrency(value)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-neutral-600">Quantidade</p>
          <p className="text-lg font-semibold text-neutral-700">
            {quantity.toLocaleString('pt-BR', { maximumFractionDigits: 4 })}
          </p>
        </div>
        {lastTwelveMonthsRate !== null && (
          <div>
            <p className="text-sm text-neutral-600">Rentabilidade (12m)</p>
            <div className="flex items-center gap-1">
              {isPositiveReturn ? (
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <p className={`text-lg font-semibold ${isPositiveReturn ? 'text-emerald-600' : 'text-red-500'}`}>
                {formatPercentage(lastTwelveMonthsRate)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Issuer */}
      {investment.issuer && (
        <div className="pt-4 border-t border-neutral-100">
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <Building2 className="w-4 h-4" />
            <span>{investment.issuer}</span>
          </div>
        </div>
      )}
    </div>
  );
}
