import { InitialSetupModal } from "@/components/dashboard/modals/InitialSetupModal";
import { useCallback, useState } from "react";

interface OnboardingData {
  salarioFixo: number;
  receitasExtras: number;
  metaInvestimento: number;
  percentualGastos: number;
}

export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  const checkOnboardingStatus = useCallback(() => {
    if (hasChecked) return;

    try {
      const hasConfig = localStorage.getItem("planejamentoFinanceiro");
      if (!hasConfig) {
        setShowOnboarding(true);
      }
    } catch (error) {
      console.error("Erro ao verificar configuração:", error);
    } finally {
      setHasChecked(true);
    }
  }, [hasChecked]);

  const completeOnboarding = useCallback((data: OnboardingData) => {
    try {
      const totalRenda = data.salarioFixo + data.receitasExtras;
      const valorInvestimento = (totalRenda * data.metaInvestimento) / 100;
      const valorGastos = (totalRenda * data.percentualGastos) / 100;
      const valorLivre = totalRenda - valorInvestimento - valorGastos;

      const planejamento = {
        rendaTotal: totalRenda,
        metaInvestimento: valorInvestimento,
        limitesGastos: valorGastos,
        reservaLivre: valorLivre,
        configuracao: data,
        dataConfiguracao: new Date().toISOString(),
      };

      localStorage.setItem(
        "planejamentoFinanceiro",
        JSON.stringify(planejamento)
      );
      setShowOnboarding(false);
    } catch (error) {
      console.error("Erro ao salvar configuração:", error);
    }
  }, []);

  const OnboardingModal = useCallback(() => {
    if (!showOnboarding) return null;

    return (
      <InitialSetupModal
        onClose={() => setShowOnboarding(false)}
        onComplete={completeOnboarding}
      />
    );
  }, [showOnboarding, completeOnboarding]);

  return {
    checkOnboardingStatus,
    OnboardingModal,
    showOnboarding,
  };
}
