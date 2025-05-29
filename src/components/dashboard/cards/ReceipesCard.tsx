import { MiniSparkline } from "@/components/dashboard/cards/charts/MiniSparkline";
import { StatusBadge } from "@/components/dashboard/cards/StatusBadge";
import { Pencil } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function ReceipesCard() {
  const [isEditing, setIsEditing] = useState(false);
  const [receitaAtual, setReceitaAtual] = useState(0);
  const [inputValue, setInputValue] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const receitaPrevista = 1500;
  const receitaMesAnterior = 1200;
  const diffMesAnterior = receitaAtual - receitaMesAnterior;
  const atingiuMeta = receitaAtual >= receitaPrevista;
  const progresso = Math.min((receitaAtual / receitaPrevista) * 100, 100);

  const historicoReceita = [
    { mes: "Mar", saldo: 1000 },
    { mes: "Abr", saldo: 1200 },
    { mes: "Mai", saldo: receitaAtual },
  ];

  useEffect(() => {
    const saved = localStorage.getItem("receipesTotal");
    if (saved) {
      const parsed = parseFloat(saved);
      if (!isNaN(parsed)) {
        setReceitaAtual(parsed);
        setInputValue(parsed);
      }
    }
  }, []);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const saveChanges = () => {
    localStorage.setItem("receipesTotal", inputValue.toString());
    setReceitaAtual(inputValue);
    setIsEditing(false);
  };

  return (
    <div className="relative bg-gray-100 border border-gray-300 px-5 py-4 rounded-xl shadow w-full h-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="w-full pr-4">
          <p className="text-base font-semibold text-gray-800 mb-1">
            Total de receitas
          </p>

          {/* Valor com edição inline */}
          <div className="flex items-center gap-2 mb-2">
            {isEditing ? (
              <input
                ref={inputRef}
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(Number(e.target.value))}
                onBlur={saveChanges}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveChanges();
                }}
                className="text-2xl font-bold text-gray-900 border border-gray-300 rounded px-2 py-1 w-32"
              />
            ) : (
              <>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {receitaAtual.toFixed(2)}
                </p>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-gray-500 hover:text-gray-700 transition"
                  aria-label="Editar receita"
                >
                  <Pencil size={18} />
                </button>
              </>
            )}
          </div>

          {/* Status da meta */}
          <StatusBadge
            color={atingiuMeta ? "green" : "yellow"}
            text={
              atingiuMeta
                ? "Meta de receita atingida"
                : `Faltam R$ ${(receitaPrevista - receitaAtual).toFixed(
                    2
                  )} para sua meta`
            }
          />

          {/* Sparkline */}
          <div className="w-full mt-3 mb-1">
            <MiniSparkline data={historicoReceita} />
          </div>

          {/* Barra de progresso */}
          <div className="w-full h-2 mt-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                atingiuMeta ? "bg-green-400" : "bg-yellow-400"
              }`}
              style={{ width: `${progresso}%` }}
            ></div>
          </div>

          {/* Comparação com mês anterior */}
          <p className="text-sm text-gray-500 mt-2">
            {diffMesAnterior >= 0 ? "+" : "-"}R$
            {Math.abs(diffMesAnterior).toFixed(2)} em relação a abril
          </p>

          {/* Receita prevista no topo direito */}
          <div className="absolute top-4 right-5 text-right">
            <p className="text-xs text-gray-500">Receita prevista</p>
            <p className="text-sm font-medium text-gray-700">
              R$ {receitaPrevista.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
