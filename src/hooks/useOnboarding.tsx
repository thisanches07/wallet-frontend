import { InitialSetupModal } from "@/components/dashboard/modals/InitialSetupModal";
import { useState } from "react";

interface OnboardingData {
  salarioFixo: number;
  receitasExtras: number;
  metaInvestimento: number;
  percentualGastos: number;
}

export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  const checkOnboardingStatus = () => {
    if (hasChecked) return; // Evitar múltiplas verificações

    if (typeof window !== 'undefined') {
      const hasConfig = localStorage.getItem("planejamentoFinanceiro");
      if (!hasConfig) {
        setShowOnboarding(true);
      }
    }
    setHasChecked(true);
  };

  const completeOnboarding = (data: OnboardingData) => {
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
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(
        "planejamentoFinanceiro",
        JSON.stringify(planejamento)
      );
    }
    setShowOnboarding(false);
  };

  const OnboardingModal = () => {
    if (!showOnboarding) return null;

    return (
      <InitialSetupModal
        onClose={() => setShowOnboarding(false)}
        onComplete={completeOnboarding}
      />
    );
  };

  return {
    checkOnboardingStatus,
    OnboardingModal,
    showOnboarding,
  };
}
