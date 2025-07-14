import { Pencil, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function ReceipesCard() {
  const [isEditing, setIsEditing] = useState(false);
  const [receitas, setReceitas] = useState(0);
  const [inputValue, setInputValue] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Simulação de comparação mensal
  const previousReceitas = 4500; // Mock do mês anterior
  const change = receitas - previousReceitas;
  const changePercentage =
    previousReceitas > 0 ? (change / previousReceitas) * 100 : 0;
  const isGrowing = change > 0;

  useEffect(() => {
    const saved = localStorage.getItem("receitasTotal");
    if (saved) {
      const parsed = parseFloat(saved);
      if (!isNaN(parsed)) {
        setReceitas(parsed);
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
    localStorage.setItem("receitasTotal", inputValue.toString());
    setReceitas(inputValue);
    setIsEditing(false);
  };

  return (
    <div className="bg-white border border-neutral-200/80 p-6 rounded-2xl shadow-sm transition-all duration-300 group">
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-success shadow-sm">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>

        <div className="flex-1">
          <h3 className="text-sm font-medium text-neutral-500 mb-1">
            Receitas
          </h3>

          <div className="flex items-center gap-2">
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
                className="text-2xl font-bold text-neutral-900 border-2 border-primary-300 rounded-lg px-2 py-1 w-40 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
              />
            ) : (
              <>
                <p className="text-2xl font-bold text-success-600 tracking-tight">
                  R${" "}
                  {receitas.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </p>
                <button
                  onClick={() => setIsEditing(true)}
                  className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-primary-600 transition-all duration-200 p-1 hover:bg-primary-50 rounded-md"
                  aria-label="Editar receitas"
                >
                  <Pencil size={14} />
                </button>
              </>
            )}
          </div>

          <p className="text-xs text-neutral-400 mt-1">Este mês</p>

          {/* Indicador sutil de tendência */}
          {Math.abs(changePercentage) > 0.1 && (
            <div
              className={`flex items-center gap-1 mt-1 ${
                isGrowing ? "text-success-600" : "text-danger-600"
              }`}
            >
              {isGrowing ? (
                <TrendingUp size={12} />
              ) : (
                <TrendingDown size={12} />
              )}
              <span className="text-xs font-medium">
                {isGrowing ? "+" : ""}
                {Math.abs(changePercentage).toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
