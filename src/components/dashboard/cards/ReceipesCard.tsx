import walletIcon from "@/assets/icons/money-bag.png";
import { DashboardData } from "@/types/dashboard";
import Image from "next/image";

export function ReceipesCard({ data }: { data: DashboardData }) {
  const card = {
    label1: "Total de Receitas",
    label2: "Investido",
    total: 123,
    invested: 321,
    color: "text-green-400",
  };
  return (
    <div className="bg-gray-100 border border-gray-300 px-4 py-3 rounded-xl shadow flex justify-between items-start max-w-[320px] h-auto">
      <div>
        <p className="text-base font-semibold text-gray-800">
          Total de despesas
        </p>
        <p className="text-2xl font-bold text-gray-900 mb-3">
          R$ {card.total.toFixed(2)}
        </p>

        <div>
          <p className="text-sm text-gray-600 mb-0.5">Despesas previstas</p>
          <p className="text-lg font-medium text-gray-800 mb-2">
            R$ {card.invested.toFixed(2)}
          </p>
        </div>
      </div>

      <Image
        src={walletIcon}
        alt="Ícone de carteira"
        width={48}
        height={48}
        className="ml-4"
      />
    </div>
  );
}
