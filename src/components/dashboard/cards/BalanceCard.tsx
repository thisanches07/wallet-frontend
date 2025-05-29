import { MiniSparkline } from "@/components/dashboard/cards/charts/MiniSparkline";
import { StatusBadge } from "@/components/dashboard/cards/StatusBadge";
import { Pencil } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function BalanceCard() {
  const [isEditing, setIsEditing] = useState(false);
  const [balance, setBalance] = useState(0);
  const [inputValue, setInputValue] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const previousMonthBalance = 100;
  const difference = balance - previousMonthBalance;
  const isPositive = balance >= 0;
  const progresso = Math.min(
    Math.abs((balance / previousMonthBalance) * 100),
    100
  );

  const historicoSaldo = [
    { mes: "Mar", saldo: 150 },
    { mes: "Abr", saldo: 100 },
    { mes: "Mai", saldo: balance },
  ];

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
    <div className="relative bg-gray-100 border border-gray-300 px-5 py-4 rounded-xl shadow w-full h-full flex flex-col justify-between">
      {/* Topo com subtítulo, título e gráfico */}
      <div className="flex justify-between items-start mb-4">
        <div className="w-full pr-4">
          <p className="text-base font-semibold text-gray-800 mb-1">
            Balanço total
          </p>

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
                  R$ {balance.toFixed(2)}
                </p>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-gray-500 hover:text-gray-700 transition"
                  aria-label="Editar saldo"
                >
                  <Pencil size={18} />
                </button>
              </>
            )}
          </div>

          <StatusBadge
            color={isPositive ? "green" : "red"}
            text={isPositive ? "Você está positivo" : "Atenção: saldo negativo"}
          />

          {/* Sparkline */}
          <div className="w-full mt-3 mb-1">
            <MiniSparkline data={historicoSaldo} />
          </div>

          {/* Barra de progresso */}
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                isPositive ? "bg-green-400" : "bg-red-400"
              }`}
              style={{ width: `${progresso}%` }}
            ></div>
          </div>

          {/* Comparação com mês anterior */}
          <p className="text-sm text-gray-500 mt-2">
            {difference >= 0 ? "+" : "-"}R$ {Math.abs(difference).toFixed(2)} em
            relação a abril
          </p>
        </div>
      </div>
    </div>
  );
}
