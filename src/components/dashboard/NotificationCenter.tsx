import { AlertTriangle, CheckCircle, Info, X } from "lucide-react";
import { useEffect, useState } from "react";

interface Notification {
  id: string;
  type: "success" | "warning" | "info" | "error";
  title: string;
  message: string;
  timestamp: Date;
  persistent?: boolean;
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    checkFinancialAlerts();
    // Atualizar notificações a cada 10 minutos
    const interval = setInterval(checkFinancialAlerts, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const checkFinancialAlerts = () => {
    const now = new Date();
    const dayOfMonth = now.getDate();
    const newNotifications: Notification[] = [];

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
      const gastos = parseFloat(localStorage.getItem("gastosTotal") || "0");

      // Verificar se ultrapassou o orçamento
      if (gastos > data.limitesGastos) {
        const excesso = gastos - data.limitesGastos;
        newNotifications.push({
          id: "budget-exceeded",
          type: "warning",
          title: "Orçamento ultrapassado",
          message: `Você gastou R$ ${excesso.toLocaleString(
            "pt-BR"
          )} acima do planejado este mês`,
          timestamp: now,
        });
      }

      // Verificar se está próximo do limite (90%)
      else if (gastos > data.limitesGastos * 0.9) {
        const restante = data.limitesGastos - gastos;
        newNotifications.push({
          id: "budget-warning",
          type: "warning",
          title: "Atenção ao orçamento",
          message: `Restam apenas R$ ${restante.toLocaleString(
            "pt-BR"
          )} do seu orçamento mensal`,
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
            "pt-BR"
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
      setNotifications(newNotifications);
      setIsVisible(true);
    }
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (notifications.length <= 1) {
      setIsVisible(false);
    }
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

  if (!isVisible || notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 rounded-xl border shadow-lg animate-scale-in ${getColorClasses(
            notification.type
          )}`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">{getIcon(notification.type)}</div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm mb-1">
                {notification.title}
              </h4>
              <p className="text-sm opacity-90">{notification.message}</p>
            </div>
            {!notification.persistent && (
              <button
                onClick={() => dismissNotification(notification.id)}
                className="flex-shrink-0 p-1 rounded-lg hover:bg-black/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
