import { useMonthlyData } from "@/context/MonthlyDataContext";
import { AlertTriangle, CheckCircle, Info, X } from "lucide-react";
import { useEffect, useState } from "react";

interface Notification {
  id: string;
  type: "success" | "warning" | "info" | "error";
  title: string;
  message: string;
  timestamp: Date;
  persistent?: boolean;
  autoCloseTimer?: NodeJS.Timeout;
  createdAt?: number; // timestamp para calcular progresso
  duration?: number; // duração total em ms
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  // Obter dados reais do mês atual
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const { expenses, incomes, loading } = useMonthlyData(
    currentMonth,
    currentYear
  );

  // Configurações de tempo para auto-dismiss (em milissegundos)
  const AUTO_DISMISS_TIMES = {
    success: 5000, // 5 segundos
    info: 8000, // 8 segundos
    warning: 10000, // 10 segundos
    error: 12000, // 12 segundos
  };

  // Função para configurar auto-dismiss de uma notificação
  const setupAutoDismiss = (notification: Notification) => {
    if (notification.persistent) return notification;

    const dismissTime = AUTO_DISMISS_TIMES[notification.type];
    const createdAt = Date.now();

    const timer = setTimeout(() => {
      dismissNotification(notification.id);
    }, dismissTime);

    return {
      ...notification,
      autoCloseTimer: timer,
      createdAt,
      duration: dismissTime,
    };
  };

  // Limpar timers quando o componente for desmontado
  useEffect(() => {
    return () => {
      notifications.forEach((notification) => {
        if (notification.autoCloseTimer) {
          clearTimeout(notification.autoCloseTimer);
        }
      });
    };
  }, []);

  useEffect(() => {
    // Só verificar alertas quando os dados estiverem carregados
    if (!loading) {
      checkFinancialAlerts();
    }
  }, [expenses, incomes, loading]); // Atualizar quando os dados mudarem

  useEffect(() => {
    // Verificar alertas periodicamente (a cada 10 minutos)
    const interval = setInterval(() => {
      if (!loading) {
        checkFinancialAlerts();
      }
    }, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    // Escutar eventos de novos expenses/incomes para atualizar notificações
    const handleNewTransaction = () => {
      if (!loading) {
        // Aguardar um pouco para garantir que os dados foram atualizados
        setTimeout(() => {
          checkFinancialAlerts();
        }, 500);
      }
    };

    window.addEventListener("expenseAdded", handleNewTransaction);
    window.addEventListener("incomeAdded", handleNewTransaction);

    return () => {
      window.removeEventListener("expenseAdded", handleNewTransaction);
      window.removeEventListener("incomeAdded", handleNewTransaction);
    };
  }, [loading]);

  const checkFinancialAlerts = () => {
    const now = new Date();
    const dayOfMonth = now.getDate();
    const newNotifications: Notification[] = [];

    // Calcular gastos reais do mês atual
    const gastosReais = expenses.reduce(
      (acc, expense) => acc + Number(expense.valor),
      0
    );

    // Calcular receitas reais do mês atual
    const receitasReais = incomes.reduce(
      (acc, income) => acc + Number(income.amount),
      0
    );

    console.log("📊 Dados financeiros do mês:", {
      gastos: gastosReais,
      receitas: receitasReais,
      despesas: expenses.length,
      rendas: incomes.length,
    });

    // Verificar configuração inicial
    const planejamento = localStorage.getItem("planejamentoFinanceiro");
    if (!planejamento) {
      newNotifications.push({
        id: "setup",
        type: "info",
        title: "Configure seu planejamento",
        message:
          "Defina sua renda e metas para começar o acompanhamento financeiro",
        timestamp: now,
        persistent: true,
      });
    } else {
      const data = JSON.parse(planejamento);

      // Verificar se ultrapassou o orçamento usando dados reais
      if (gastosReais > data.limitesGastos) {
        console.log(
          "gastos reais ->",
          gastosReais,
          "limitesGastos ->",
          data.limitesGastos
        );
        const excesso = gastosReais - data.limitesGastos;
        newNotifications.push({
          id: "budget-exceeded",
          type: "warning",
          title: "Orçamento ultrapassado",
          message: `Você gastou R$ ${excesso.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          })} acima do planejado este mês`,
          timestamp: now,
        });
      }

      // Verificar se está próximo do limite (90%) usando dados reais
      else if (gastosReais > data.limitesGastos * 0.9) {
        const restante = data.limitesGastos - gastosReais;
        newNotifications.push({
          id: "budget-warning",
          type: "warning",
          title: "Atenção ao orçamento",
          message: `Restam apenas R$ ${restante.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          })} do seu orçamento mensal`,
          timestamp: now,
        });
      }

      // Verificar se há saldo positivo significativo
      const saldoMensal = receitasReais - gastosReais;
      if (saldoMensal > 0 && gastosReais < data.limitesGastos * 0.7) {
        newNotifications.push({
          id: "good-savings",
          type: "success",
          title: "Parabéns! Economia no mês",
          message: `Você economizou R$ ${saldoMensal.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          })} este mês`,
          timestamp: now,
        });
      }

      // Lembrete de investimento (dia 25)
      if (dayOfMonth >= 25 && dayOfMonth <= 27) {
        newNotifications.push({
          id: "investment-reminder",
          type: "info",
          title: "Lembrete de investimento",
          message: `Não se esqueça de investir R$ ${data.metaInvestimento.toLocaleString(
            "pt-BR",
            { minimumFractionDigits: 2 }
          )} este mês`,
          timestamp: now,
        });
      }
    }

    // Verificar despesas recorrentes vencendo
    const despesasRecorrentes = localStorage.getItem("despesasRecorrentes");
    if (despesasRecorrentes) {
      const despesas = JSON.parse(despesasRecorrentes);
      const despesasVencendo = despesas.filter(
        (d: any) =>
          d.ativo &&
          d.diaVencimento >= dayOfMonth &&
          d.diaVencimento <= dayOfMonth + 3
      );

      if (despesasVencendo.length > 0) {
        newNotifications.push({
          id: "bills-due",
          type: "warning",
          title: "Contas vencendo",
          message: `${despesasVencendo.length} conta(s) vence(m) nos próximos dias`,
          timestamp: now,
        });
      }
    }

    if (newNotifications.length > 0) {
      // Aplicar auto-dismiss nas novas notificações
      const notificationsWithTimers = newNotifications.map(setupAutoDismiss);

      // Limpar notificações antigas antes de adicionar novas (evitar duplicatas)
      setNotifications((prev) => {
        // Limpar timers das notificações antigas
        prev.forEach((notification) => {
          if (notification.autoCloseTimer) {
            clearTimeout(notification.autoCloseTimer);
          }
        });
        return notificationsWithTimers;
      });

      setIsVisible(true);
    }
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => {
      const notificationToRemove = prev.find((n) => n.id === id);

      // Limpar timer se existir
      if (notificationToRemove?.autoCloseTimer) {
        clearTimeout(notificationToRemove.autoCloseTimer);
      }

      const remaining = prev.filter((n) => n.id !== id);

      // Se não há mais notificações, esconder o container
      if (remaining.length === 0) {
        setIsVisible(false);
      }

      return remaining;
    });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5" />;
      case "error":
        return <X className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getColorClasses = (type: string) => {
    switch (type) {
      case "success":
        return "bg-success-50 border-success-200 text-success-800";
      case "warning":
        return "bg-warning-50 border-warning-200 text-warning-800";
      case "error":
        return "bg-danger-50 border-danger-200 text-danger-800";
      default:
        return "bg-primary-50 border-primary-200 text-primary-800";
    }
  };

  const getProgressBarColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-success-400";
      case "warning":
        return "bg-warning-400";
      case "error":
        return "bg-danger-400";
      default:
        return "bg-primary-400";
    }
  };

  // Componente individual de notificação com progresso
  const NotificationItem = ({
    notification,
  }: {
    notification: Notification;
  }) => {
    const [progress, setProgress] = useState(100);
    const [isPaused, setIsPaused] = useState(false);
    const [pausedAt, setPausedAt] = useState<number | null>(null);

    useEffect(() => {
      if (
        notification.persistent ||
        !notification.createdAt ||
        !notification.duration
      ) {
        return;
      }

      const updateProgress = () => {
        if (isPaused) return;

        const baseElapsed = pausedAt ? pausedAt - notification.createdAt! : 0;
        const currentElapsed = pausedAt
          ? 0
          : Date.now() - notification.createdAt!;
        const totalElapsed = baseElapsed + currentElapsed;

        const remaining = Math.max(
          0,
          100 - (totalElapsed / notification.duration!) * 100
        );
        setProgress(remaining);
      };

      // Atualizar progresso a cada 100ms
      const progressInterval = setInterval(updateProgress, 100);

      return () => clearInterval(progressInterval);
    }, [
      notification.createdAt,
      notification.duration,
      notification.persistent,
      isPaused,
      pausedAt,
    ]);

    const handleMouseEnter = () => {
      setIsPaused(true);
      setPausedAt(Date.now());
    };

    const handleMouseLeave = () => {
      if (pausedAt) {
        // Atualizar o timestamp de criação para compensar o tempo pausado
        notification.createdAt =
          Date.now() - (pausedAt - notification.createdAt!);
      }
      setIsPaused(false);
      setPausedAt(null);
    };

    return (
      <div
        className={`p-4 rounded-xl border shadow-lg animate-scale-in relative overflow-hidden transition-all duration-200 hover:shadow-xl ${getColorClasses(
          notification.type
        )}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Barra de progresso no topo */}
        {!notification.persistent && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-black/10">
            <div
              className={`h-full transition-all duration-100 ease-linear ${getProgressBarColor(
                notification.type
              )} ${isPaused ? "animate-pulse" : ""}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <div className="flex items-start gap-3 mt-1">
          <div className="flex-shrink-0">{getIcon(notification.type)}</div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm mb-1">{notification.title}</h4>
            <p className="text-sm opacity-90">{notification.message}</p>
            {isPaused && (
              <p className="text-xs opacity-60 mt-1">Timer pausado</p>
            )}
          </div>
          <button
            onClick={() => dismissNotification(notification.id)}
            className="flex-shrink-0 p-1 rounded-lg hover:bg-black/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  if (!isVisible || notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
      {notifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} />
      ))}
    </div>
  );
}
