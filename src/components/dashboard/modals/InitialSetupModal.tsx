import { Calendar, DollarSign, Target, User, X } from "lucide-react";
import { useState } from "react";

interface InitialSetupData {
  salarioFixo: number;
  receitasExtras: number;
  metaInvestimento: number;
  percentualGastos: number;
}

interface Props {
  onClose: () => void;
  onComplete: (data: InitialSetupData) => void;
  initialData?: Partial<InitialSetupData>;
}

export function InitialSetupModal({ onClose, onComplete, initialData }: Props) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<InitialSetupData>({
    salarioFixo: initialData?.salarioFixo || 0,
    receitasExtras: initialData?.receitasExtras || 0,
    metaInvestimento: initialData?.metaInvestimento || 20, // Percentual padrão de 20%
    percentualGastos: initialData?.percentualGastos || 70, // Percentual padrão de 70%
  });

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleComplete = () => {
    onComplete(data);
  };

  const totalRenda = data.salarioFixo + data.receitasExtras;
  const valorInvestimento = (totalRenda * data.metaInvestimento) / 100;
  const valorGastos = (totalRenda * data.percentualGastos) / 100;
  const valorLivre = totalRenda - valorInvestimento - valorGastos;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-neutral-200 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-primary rounded-xl">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">
                Configuração Inicial
              </h2>
              <p className="text-sm text-neutral-500">
                Vamos configurar sua estratégia financeira
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress */}
        <div className="px-6 py-4 border-b border-neutral-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-600">
              Passo {step} de 3
            </span>
            <span className="text-sm text-neutral-500">
              {Math.round((step / 3) * 100)}% completo
            </span>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-2">
            <div
              className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Renda */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-neutral-900 mb-2">
                  Vamos começar com sua renda mensal
                </h3>
                <p className="text-neutral-600">
                  Informe suas fontes de renda para calcularmos seu planejamento
                  financeiro
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
                    <DollarSign className="w-4 h-4" />
                    Salário Fixo (CLT)
                  </label>
                  <input
                    type="number"
                    value={data.salarioFixo || ""}
                    onChange={(e) =>
                      setData({ ...data, salarioFixo: Number(e.target.value) })
                    }
                    placeholder="Ex: 5000"
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
                  />
                  <p className="text-xs text-neutral-500">
                    Seu salário mensal líquido
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
                    <Target className="w-4 h-4" />
                    Receitas Extras (PJ/Freelance)
                  </label>
                  <input
                    type="number"
                    value={data.receitasExtras || ""}
                    onChange={(e) =>
                      setData({
                        ...data,
                        receitasExtras: Number(e.target.value),
                      })
                    }
                    placeholder="Ex: 2000"
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
                  />
                  <p className="text-xs text-neutral-500">
                    Renda média de outras fontes
                  </p>
                </div>
              </div>

              {totalRenda > 0 && (
                <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
                  <h4 className="font-semibold text-primary-900 mb-2">
                    Renda Total Mensal
                  </h4>
                  <p className="text-2xl font-bold text-primary-700">
                    R$ {totalRenda.toLocaleString("pt-BR")}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Planejamento */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-neutral-900 mb-2">
                  Como você quer dividir sua renda?
                </h3>
                <p className="text-neutral-600">
                  Defina os percentuais para gastos e investimentos
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
                    <Target className="w-4 h-4" />
                    Meta de Investimento (%)
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    value={data.metaInvestimento}
                    onChange={(e) =>
                      setData({
                        ...data,
                        metaInvestimento: Number(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-neutral-500">
                    <span>10%</span>
                    <span className="font-bold text-primary-600">
                      {data.metaInvestimento}%
                    </span>
                    <span>50%</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
                    <Calendar className="w-4 h-4" />
                    Orçamento para Gastos (%)
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="80"
                    value={data.percentualGastos}
                    onChange={(e) =>
                      setData({
                        ...data,
                        percentualGastos: Number(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-neutral-500">
                    <span>50%</span>
                    <span className="font-bold text-danger-600">
                      {data.percentualGastos}%
                    </span>
                    <span>80%</span>
                  </div>
                </div>
              </div>

              {totalRenda > 0 && (
                <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4">
                  <h4 className="font-semibold text-neutral-900 mb-3">
                    Resumo do Planejamento
                  </h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">
                        Investimentos
                      </p>
                      <p className="text-lg font-bold text-success-600">
                        R$ {valorInvestimento.toLocaleString("pt-BR")}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">Gastos</p>
                      <p className="text-lg font-bold text-danger-600">
                        R$ {valorGastos.toLocaleString("pt-BR")}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">Livre</p>
                      <p className="text-lg font-bold text-primary-600">
                        R$ {valorLivre.toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Confirmação */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-neutral-900 mb-2">
                  Confirme sua estratégia financeira
                </h3>
                <p className="text-neutral-600">
                  Revise os dados antes de finalizar
                </p>
              </div>

              <div className="bg-gradient-to-br from-primary-50 to-success-50 border border-primary-200 rounded-xl p-6">
                <h4 className="font-bold text-neutral-900 mb-4 text-center">
                  Sua Estratégia Financeira Mensal
                </h4>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-700">Renda Total:</span>
                    <span className="font-bold text-neutral-900">
                      R$ {totalRenda.toLocaleString("pt-BR")}
                    </span>
                  </div>

                  <div className="border-t border-neutral-200 pt-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-success-700">
                        💰 Investimentos ({data.metaInvestimento}%):
                      </span>
                      <span className="font-bold text-success-700">
                        R$ {valorInvestimento.toLocaleString("pt-BR")}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-danger-700">
                        🛒 Gastos ({data.percentualGastos}%):
                      </span>
                      <span className="font-bold text-danger-700">
                        R$ {valorGastos.toLocaleString("pt-BR")}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-primary-700">
                        🎯 Reserva Livre:
                      </span>
                      <span className="font-bold text-primary-700">
                        R$ {valorLivre.toLocaleString("pt-BR")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                  💡 <strong>Dica:</strong> Você pode ajustar esses valores a
                  qualquer momento nas configurações do dashboard.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between p-6 border-t border-neutral-100">
          <button
            onClick={step === 1 ? onClose : handlePrevious}
            className="px-6 py-3 text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100 rounded-xl transition-colors font-medium"
          >
            {step === 1 ? "Cancelar" : "Voltar"}
          </button>

          <button
            onClick={step === 3 ? handleComplete : handleNext}
            disabled={step === 1 && totalRenda === 0}
            className="px-6 py-3 bg-gradient-primary text-white rounded-xl hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {step === 3 ? "Finalizar Configuração" : "Próximo"}
          </button>
        </div>
      </div>
    </div>
  );
}
