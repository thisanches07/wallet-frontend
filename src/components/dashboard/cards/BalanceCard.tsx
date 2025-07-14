import { TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function BalanceCard() {
  const [isEditing, setIsEditing] = useState(false);
  const [balance, setBalance] = useState(0);
  const [inputValue, setInputValue] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const isPositive = balance >= 0;

  // Simulação de dados históricos - você pode substituir por dados reais
  const previousBalance = 2500; // Mock do mês anterior
  const change = balance - previousBalance;
  const changePercentage =
    previousBalance > 0 ? (change / previousBalance) * 100 : 0;
  const isGrowing = change > 0;

  useEffect(() => {
    const saved = localStorage.getItem("balanceTotal");
    if (saved) {
      const parsed = parseFloat(saved);
      if (!isNaN(parsed)) {
        setBalance(parsed);
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
    localStorage.setItem("balanceTotal", inputValue.toString());
    setBalance(inputValue);
    setIsEditing(false);
  };

  return (
    <div className="bg-white border border-neutral-200/80 p-6 rounded-2xl shadow-sm transition-all duration-300 group">
      <div className="flex items-center gap-4">
        <div
          className={`flex items-center justify-center w-12 h-12 rounded-xl shadow-sm ${
            isPositive ? "bg-gradient-success" : "bg-gradient-danger"
          }`}
        >
          <Wallet className="w-6 h-6 text-white" />
        </div>

        <div className="flex-1">
          <h3 className="text-sm font-medium text-neutral-500 mb-1">
            Saldo Total
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
                <p
                  className={`text-2xl font-bold tracking-tight ${
                    isPositive ? "text-neutral-900" : "text-danger-600"
                  }`}
                >
                  R${" "}
                  {balance.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </>
            )}
          </div>

          {!isPositive && (
            <p className="text-xs text-danger-600 font-medium mt-1">
              Atenção: Saldo negativo
            </p>
          )}

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
                {Math.abs(changePercentage).toFixed(1)}% vs mês anterior
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
