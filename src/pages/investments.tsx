// pages/investments.tsx
import { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { RefreshCw, TrendingUp, DollarSign, PieChart } from 'lucide-react';
import { Investment, InvestmentGroup } from '@/types/investment';
import { InvestmentCard } from '@/components/investments/InvestmentCard';
import { InvestmentSkeletonGroup } from '@/components/investments/InvestmentSkeleton';
import { EmptyInvestments } from '@/components/investments/EmptyInvestments';
import { formatCurrency, getTypeDisplayName } from '@/utils/investmentUtils';
import { useInvestments } from '@/hooks/useApi';
import { Topbar } from '@/components/Topbar';
import { ClientOnly } from '@/components/ClientOnly';

const InvestmentsPage: NextPage = () => {
  return (
    <ClientOnly
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <InvestmentsContent />
    </ClientOnly>
  );
};

function InvestmentsContent() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { getInvestments, syncInvestments } = useInvestments();

  // Buscar investimentos ao carregar a página
  const fetchInvestments = async () => {
    try {
      setError(null);
      const data = await getInvestments();
      setInvestments(data || []);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar investimentos');
      console.error('Erro ao buscar investimentos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Sincronizar investimentos
  const handleSyncInvestments = async () => {
    try {
      setSyncing(true);
      setError(null);
      
      const data = await syncInvestments();
      
      // Se o sync retornou dados, usar esses dados
      // Se retornou vazio, recarregar a lista atual (pois pode ter havido atualizações internas)
      if (data && Array.isArray(data) && data.length > 0) {
        setInvestments(data);
      } else {
        // Se o sync não retornou novos dados, recarregar a lista atual
        await fetchInvestments();
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao sincronizar investimentos');
      console.error('Erro ao sincronizar investimentos:', err);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, []);

  // Agrupar investimentos por tipo
  const groupedInvestments: InvestmentGroup[] = investments.reduce((groups, investment) => {
    const existingGroup = groups.find(group => group.type === investment.type);
    const amount = typeof investment.amount === 'string' ? parseFloat(investment.amount) : investment.amount;
    
    if (existingGroup) {
      existingGroup.investments.push(investment);
      existingGroup.totalAmount += amount;
    } else {
      groups.push({
        type: investment.type,
        investments: [investment],
        totalAmount: amount,
      });
    }
    
    return groups;
  }, [] as InvestmentGroup[]);

  // Calcular estatísticas gerais
  const totalInvested = investments.reduce((total, investment) => {
    const amount = typeof investment.amount === 'string' ? parseFloat(investment.amount) : investment.amount;
    return total + amount;
  }, 0);

  const activeInvestments = investments.filter(inv => inv.status.toUpperCase() === 'ACTIVE').length;

  return (
    <>
      <Head>
        <title>Investimentos - Wallet AI</title>
        <meta name="description" content="Gerencie e acompanhe seus investimentos" />
      </Head>

      <div className="min-h-screen flex flex-col bg-gradient-to-br from-neutral-50 to-neutral-100">
        <Topbar />
        
        <div className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                  💼 Seus Investimentos
                </h1>
                <p className="text-neutral-600">
                  Acompanhe o desempenho da sua carteira de investimentos
                </p>
              </div>
              
              <button
                onClick={handleSyncInvestments}
                disabled={syncing || loading}
                className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Sincronizando...' : 'Sincronizar Investimentos'}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
          </div>

          {/* Summary Cards */}
          {!loading && investments.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Total Investido</p>
                    <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalInvested)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Investimentos Ativos</p>
                    <p className="text-2xl font-bold text-blue-600">{activeInvestments}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <PieChart className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Tipos de Ativos</p>
                    <p className="text-2xl font-bold text-purple-600">{groupedInvestments.length}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          {loading ? (
            <div>
              <InvestmentSkeletonGroup />
              <InvestmentSkeletonGroup />
            </div>
          ) : investments.length === 0 ? (
            <EmptyInvestments />
          ) : (
            <div className="space-y-8">
              {groupedInvestments.map((group) => (
                <div key={group.type} className="mb-8">
                  {/* Group Header */}
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-neutral-900">
                        {getTypeDisplayName(group.type)}
                      </h2>
                      <p className="text-neutral-600">
                        {group.investments.length} {group.investments.length === 1 ? 'investimento' : 'investimentos'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-neutral-600">Total do Grupo</p>
                      <p className="text-xl font-bold text-primary-600">
                        {formatCurrency(group.totalAmount)}
                      </p>
                    </div>
                  </div>

                  {/* Investments Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {group.investments.map((investment) => (
                      <InvestmentCard key={investment.id} investment={investment} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>
        </div>
      </div>
    </>
  );
}

export default InvestmentsPage;
