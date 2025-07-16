import { Expense } from "@/types/expense";
import { filterByMonth } from "@/utils/dateUtils";
import { convertApiExpenseToExpense } from "@/utils/expenseUtils";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useApi } from "../hooks/useApi";

interface IncomeData {
  id: number;
  tipo: "recorrente" | "pontual";
  descricao: string;
  amount: number;
  categoria: "salario" | "freelance" | "investimento" | "bonus" | "outros";
}

interface MonthlyDataState {
  expenses: Expense[];
  incomes: IncomeData[];
  loading: boolean;
  error: string | null;
}

interface MonthlyDataContextType {
  data: Record<string, MonthlyDataState>;
  loadMonthData: (month: number, year: number) => Promise<void>;
  getMonthData: (month: number, year: number) => MonthlyDataState;
  invalidateCurrentMonth: () => void;
}

const MonthlyDataContext = createContext<MonthlyDataContextType | undefined>(
  undefined
);

interface MonthlyDataProviderProps {
  children: ReactNode;
}

export function MonthlyDataProvider({ children }: MonthlyDataProviderProps) {
  const { getExpenses, getIncomes } = useApi();
  const [data, setData] = useState<Record<string, MonthlyDataState>>({});
  const [loadingStates, setLoadingStates] = useState<Set<string>>(new Set());

  // Usar refs para acessar valores atuais sem dependências
  const dataRef = useRef(data);
  const loadingStatesRef = useRef(loadingStates);
  const requestQueueRef = useRef<Set<string>>(new Set()); // Controlar requisições em andamento globalmente

  // Atualizar refs quando estados mudam
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    loadingStatesRef.current = loadingStates;
  }, [loadingStates]);

  // Função para invalidar dados de um mês específico
  const invalidateMonth = useCallback((month: number, year: number) => {
    const key = `${year}-${month}`;
    console.log(`🔄 Invalidando dados para ${month + 1}/${year}`);

    setData((prev) => {
      const newData = { ...prev };
      delete newData[key];
      return newData;
    });

    // Recarregar dados
    loadMonthData(month, year);
  }, []);

  const getMonthData = useCallback(
    (month: number, year: number): MonthlyDataState => {
      const key = `${year}-${month}`;
      return (
        data[key] || {
          expenses: [],
          incomes: [],
          loading: true,
          error: null,
        }
      );
    },
    [data]
  );

  const loadExpenses = async (
    month: number,
    year: number
  ): Promise<Expense[]> => {
    try {
      // Tentar carregar despesas com filtro primeiro
      const apiExpenses = await getExpenses({
        month: month,
        year: year,
      });

      if (Array.isArray(apiExpenses)) {
        return apiExpenses.map(convertApiExpenseToExpense);
      } else {
        // Fallback: buscar todas e filtrar localmente
        const allExpenses = await getExpenses();
        if (Array.isArray(allExpenses)) {
          const convertedExpenses = allExpenses.map(convertApiExpenseToExpense);
          return filterByMonth(convertedExpenses, month, year);
        }
        return [];
      }
    } catch (error) {
      console.error("Erro ao carregar despesas:", error);
      return [];
    }
  };

  const loadIncomes = async (
    month: number,
    year: number
  ): Promise<IncomeData[]> => {
    try {
      // Tentar carregar receitas com filtro primeiro
      const apiIncomes = await getIncomes({
        month: month,
        year: year,
      });

      if (Array.isArray(apiIncomes)) {
        return apiIncomes;
      } else {
        // Fallback: buscar todas e filtrar localmente
        const allIncomes = await getIncomes();
        if (Array.isArray(allIncomes)) {
          return filterByMonth(allIncomes, month, year);
        }
        return [];
      }
    } catch (error) {
      console.error("Erro ao carregar receitas:", error);
      return [];
    }
  };

  const refreshMonthData = useCallback(async (month: number, year: number) => {
    const key = `${year}-${month}`;

    console.log(`🔄 Fazendo refresh em background para ${month + 1}/${year}`);

    try {
      // Fazer requisições em paralelo
      const [expenses, incomes] = await Promise.all([
        loadExpenses(month, year),
        loadIncomes(month, year),
      ]);

      setData((prev) => ({
        ...prev,
        [key]: {
          expenses,
          incomes,
          loading: false,
          error: null,
        },
      }));

      console.log(`✅ Refresh concluído para ${month + 1}/${year}`, {
        expenses: expenses.length,
        incomes: incomes.length,
      });
    } catch (error) {
      console.error(`❌ Erro no refresh para ${month + 1}/${year}:`, error);
    }
  }, []);

  const loadMonthData = useCallback(
    async (month: number, year: number) => {
      const key = `${year}-${month}`;

      console.log(`🔍 Verificando dados para ${month + 1}/${year}`, {
        hasData: !!dataRef.current[key],
        isLoading: loadingStatesRef.current.has(key),
        inQueue: requestQueueRef.current.has(key),
        currentData: dataRef.current[key],
      });

      // CONTROLE TRIPLO: Se já está carregando OU na fila de requisições, não iniciar nova requisição
      if (
        loadingStatesRef.current.has(key) ||
        requestQueueRef.current.has(key)
      ) {
        console.log(
          `⏳ Já processando dados para ${
            month + 1
          }/${year} (loading: ${loadingStatesRef.current.has(
            key
          )}, queued: ${requestQueueRef.current.has(key)})`
        );
        return;
      }

      // Se já temos dados válidos para este mês, não recarregar
      if (
        dataRef.current[key] &&
        !dataRef.current[key].loading &&
        !dataRef.current[key].error
      ) {
        console.log(`✅ Dados já existem para ${month + 1}/${year}`);
        return;
      }

      console.log(`🔄 Iniciando carregamento para ${month + 1}/${year}`);

      // Adicionar à fila de requisições ANTES de tudo
      requestQueueRef.current.add(key);

      setLoadingStates((prev) => new Set(prev).add(key));

      // Marcar como carregando
      setData((prev) => ({
        ...prev,
        [key]: {
          expenses: [],
          incomes: [],
          loading: true,
          error: null,
        },
      }));

      try {
        // Fazer requisições em paralelo
        const [expenses, incomes] = await Promise.all([
          loadExpenses(month, year),
          loadIncomes(month, year),
        ]);

        setData((prev) => ({
          ...prev,
          [key]: {
            expenses,
            incomes,
            loading: false,
            error: null,
          },
        }));

        console.log(`✅ Dados carregados para ${month + 1}/${year}`, {
          expenses: expenses.length,
          incomes: incomes.length,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Erro ao carregar dados";
        setData((prev) => ({
          ...prev,
          [key]: {
            expenses: [],
            incomes: [],
            loading: false,
            error: errorMessage,
          },
        }));
        console.error(
          `❌ Erro ao carregar dados para ${month + 1}/${year}:`,
          error
        );
      } finally {
        // Remover da fila de requisições E do loading states
        requestQueueRef.current.delete(key);
        setLoadingStates((prev) => {
          const newSet = new Set(prev);
          newSet.delete(key);
          return newSet;
        });
      }
    },
    [] // Removendo dependências para evitar recriação
  );

  const invalidateCurrentMonth = useCallback(() => {
    const now = new Date();
    const currentKey = `${now.getFullYear()}-${now.getMonth()}`;

    setData((prev) => {
      const newData = { ...prev };
      delete newData[currentKey];
      return newData;
    });

    // Recarregar dados do mês atual
    loadMonthData(now.getMonth(), now.getFullYear());
  }, [loadMonthData]);

  // Carregar dados do mês atual na inicialização (apenas uma vez)
  useEffect(() => {
    const now = new Date();
    const currentKey = `${now.getFullYear()}-${now.getMonth()}`;

    // Só carregar se ainda não temos dados para o mês atual
    if (!data[currentKey]) {
      console.log("🚀 Inicializando dados do mês atual");
      loadMonthData(now.getMonth(), now.getFullYear());
    }
  }, []); // Array vazio para executar apenas na montagem

  // Escutar eventos de novos dados para atualizar o mês correto
  useEffect(() => {
    const handleExpenseAdded = (e: Event) => {
      const customEvent = e as CustomEvent;
      const expense = customEvent.detail;
      if (!expense || !expense.data) return;

      const expenseDate = new Date(expense.data);
      const month = expenseDate.getMonth();
      const year = expenseDate.getFullYear();
      const key = `${year}-${month}`;

      console.log(`💰 Expense adicionado, atualizando ${month + 1}/${year}`);

      // Ao invés de deletar os dados, adicionar o novo expense localmente
      setData((prev) => {
        const currentData = prev[key];
        if (!currentData) {
          // Se não há dados para este mês, não fazer nada (os componentes carregarão quando necessário)
          return prev;
        }

        // Verificar se o expense está no formato correto
        const formattedExpense = {
          id: expense.id,
          descricao: expense.descricao,
          categoria: expense.categoria,
          valor: Number(expense.valor),
          data: expense.data,
          tipo: expense.tipo || "unico",
        };

        // Adicionar o novo expense aos dados existentes
        return {
          ...prev,
          [key]: {
            ...currentData,
            expenses: [...currentData.expenses, formattedExpense],
          },
        };
      });
    };

    const handleExpenseDeleted = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { id, month, year } = customEvent.detail;
      if (!id) return;

      const key = `${year}-${month}`;
      console.log(
        `🗑️ Expense deletado, removendo ${id} de ${month + 1}/${year}`
      );

      setData((prev) => {
        const currentData = prev[key];
        if (!currentData) return prev;

        return {
          ...prev,
          [key]: {
            ...currentData,
            expenses: currentData.expenses.filter(
              (expense) => expense.id !== id
            ),
          },
        };
      });
    };

    const handleIncomeAdded = (e: Event) => {
      const customEvent = e as CustomEvent;
      const income = customEvent.detail;
      if (!income || !income.dataRecebimento) return;

      const incomeDate = new Date(income.dataRecebimento);
      const month = incomeDate.getMonth();
      const year = incomeDate.getFullYear();
      const key = `${year}-${month}`;

      console.log(`💵 Income adicionado, atualizando ${month + 1}/${year}`);

      // Converter income para o formato esperado pelo contexto
      const contextIncome: IncomeData = {
        id: parseInt(income.id),
        tipo: income.tipo || "pontual",
        descricao: income.descricao,
        amount: Number(income.valor || income.amount),
        categoria: income.categoria,
      };

      // Adicionar o novo income aos dados existentes
      setData((prev) => {
        const currentData = prev[key];
        if (!currentData) {
          // Se não há dados para este mês, não fazer nada (os componentes carregarão quando necessário)
          return prev;
        }

        return {
          ...prev,
          [key]: {
            ...currentData,
            incomes: [...currentData.incomes, contextIncome],
          },
        };
      });
    };

    const handleIncomeDeleted = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { id, month, year } = customEvent.detail;
      if (!id) return;

      const key = `${year}-${month}`;
      console.log(
        `🗑️ Income deletado, removendo ${id} de ${month + 1}/${year}`
      );

      setData((prev) => {
        const currentData = prev[key];
        if (!currentData) return prev;

        return {
          ...prev,
          [key]: {
            ...currentData,
            incomes: currentData.incomes.filter((income) => income.id !== id),
          },
        };
      });
    };

    window.addEventListener("expenseAdded", handleExpenseAdded);
    window.addEventListener("expenseDeleted", handleExpenseDeleted);
    window.addEventListener("incomeAdded", handleIncomeAdded);
    window.addEventListener("incomeDeleted", handleIncomeDeleted);

    return () => {
      window.removeEventListener("expenseAdded", handleExpenseAdded);
      window.removeEventListener("expenseDeleted", handleExpenseDeleted);
      window.removeEventListener("incomeAdded", handleIncomeAdded);
      window.removeEventListener("incomeDeleted", handleIncomeDeleted);
    };
  }, [loadMonthData, refreshMonthData]);

  const value: MonthlyDataContextType = {
    data,
    loadMonthData,
    getMonthData,
    invalidateCurrentMonth,
  };

  return (
    <MonthlyDataContext.Provider value={value}>
      {children}
    </MonthlyDataContext.Provider>
  );
}

export function useMonthlyData(month?: number, year?: number) {
  const context = useContext(MonthlyDataContext);
  if (context === undefined) {
    throw new Error("useMonthlyData must be used within a MonthlyDataProvider");
  }

  // Se não especificar mês/ano, usar o mês atual
  const now = new Date();
  const targetMonth = month ?? now.getMonth();
  const targetYear = year ?? now.getFullYear();
  const key = `${targetYear}-${targetMonth}`;

  const monthData = context.getMonthData(targetMonth, targetYear);

  // Carregar dados apenas uma vez por key - o contexto agora controla duplicações
  useEffect(() => {
    const currentData = context.data[key];

    console.log(
      `🎯 Hook ${Math.random().toString(36).substr(2, 5)} verificando ${
        targetMonth + 1
      }/${targetYear}`,
      {
        hasData: !!currentData,
        data: currentData,
      }
    );

    // Só fazer requisição se realmente não temos dados válidos
    if (
      !currentData ||
      (currentData.loading &&
        currentData.expenses.length === 0 &&
        currentData.incomes.length === 0 &&
        !currentData.error)
    ) {
      // Verificar se já não está sendo processado antes de solicitar
      if (!context.data[key]?.loading) {
        console.log(
          `📞 Hook solicitando carregamento de ${targetMonth + 1}/${targetYear}`
        );
        context.loadMonthData(targetMonth, targetYear);
      }
    } else {
      console.log(`✅ Hook já tem dados para ${targetMonth + 1}/${targetYear}`);
    }
  }, [key, context.loadMonthData]); // Mantendo apenas dependências essenciais

  return {
    ...monthData,
    refresh: () => context.loadMonthData(targetMonth, targetYear),
    invalidateCurrentMonth: context.invalidateCurrentMonth,
  };
}
