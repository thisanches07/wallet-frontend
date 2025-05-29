import { CategoryPie } from "@/components/dashboard/cards/charts/CategoryPie";
import { StatusBadge } from "@/components/dashboard/cards/StatusBadge";
import { ArrowDownRight, ArrowUpRight, Pencil } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function ExpensesCard() {
  const [isEditing, setIsEditing] = useState(false);
  const [despesasAtuais, setDespesasAtuais] = useState(0);
  const [inputValue, setInputValue] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const despesasPrevistas = 1500; // MOCK
  const categorias = [
    { nome: "Moradia", valor: 1700 },
    { nome: "Alimentação", valor: 950 },
    { nome: "Lazer", valor: 600 },
  ];

  const percentual = Math.min((despesasAtuais / despesasPrevistas) * 100, 100);
  const ultrapassou = percentual >= 100;

  const despesasMesAnterior = 9200; // MOCK
  const diffMesAnterior = despesasAtuais - despesasMesAnterior;

  useEffect(() => {
    const saved = localStorage.getItem("expensesTotal");
    if (saved) {
      const parsed = parseFloat(saved);
      if (!isNaN(parsed)) {
        setDespesasAtuais(parsed);
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
    localStorage.setItem("expensesTotal", inputValue.toString());
    setDespesasAtuais(inputValue);
    setIsEditing(false);
  };

  return (
    <div className="relative bg-gray-100 border border-gray-300 px-5 py-4 rounded-xl shadow w-full h-full flex flex-col justify-between">
      {/* Topo com conteúdo textual e gráfico à direita */}
      <div className="flex justify-between items-start mb-4">
        <div className="w-full pr-4">
          <p className="text-base font-semibold text-gray-800 mb-1">
            Total de despesas
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
                  R$ {despesasAtuais.toFixed(2)}
                </p>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-gray-500 hover:text-gray-700 transition"
                  aria-label="Editar despesas"
                >
                  <Pencil size={18} />
                </button>
              </>
            )}
          </div>

          {/* Status */}
          <StatusBadge
            color={ultrapassou ? "red" : "yellow"}
            text={
              ultrapassou
                ? "Você ultrapassou o orçamento!"
                : `${percentual.toFixed(0)}% do orçamento gasto`
            }
          />

          {/* Barra de progresso */}
          <div className="w-full h-2 mt-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                ultrapassou ? "bg-red-400" : "bg-yellow-400"
              }`}
              style={{ width: `${percentual}%` }}
            ></div>
          </div>

          <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
            {diffMesAnterior === 0 ? (
              "Mesmo valor que abril"
            ) : diffMesAnterior > 0 ? (
              <>
                <ArrowUpRight size={16} className="text-red-500" />
                R$ {diffMesAnterior.toFixed(2)} a mais que abril
              </>
            ) : (
              <>
                <ArrowDownRight size={16} className="text-green-500" />
                R$ {Math.abs(diffMesAnterior).toFixed(2)} a menos que abril
              </>
            )}
          </p>

          {/* Despesas previstas */}
          <p className="text-sm text-gray-600 mt-3 mb-0.5">
            Despesas previstas
          </p>
          <p className="text-lg font-medium text-gray-800 mb-2">
            R$ {despesasPrevistas.toFixed(2)}
          </p>
        </div>

        {/* Gráfico de pizza */}
        <div className="flex flex-col items-center justify-start gap-2">
          <div className="mt-2 flex justify-center items-center overflow-hidden">
            <CategoryPie data={categorias} />
          </div>
        </div>
      </div>
    </div>
  );
}
