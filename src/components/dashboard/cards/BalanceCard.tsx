import walletIcon from "@/assets/icons/wallet.png";
import { DashboardData } from "@/types/dashboard";
import Image from "next/image";

export function BalanceCard({ data }: { data: DashboardData }) {
  const total = data.income + data.invested - data.expenses;
  const invested = data.invested;
  const saldo = data.income - data.expenses - data.invested;

  return (
    <div className="bg-gray-100 border border-gray-300 px-4 py-3 rounded-xl shadow flex justify-between items-start max-w-[320px] h-auto">
      <div>
        <p className="text-base font-semibold text-gray-800">Balanço total</p>
        <p className="text-2xl font-bold text-gray-900 mb-3">
          R$ {total.toFixed(2)}
        </p>

        <div>
          <p className="text-sm text-gray-600 mb-0.5">Investido</p>
          <p className="text-lg font-medium text-gray-800 mb-2">
            R$ {invested.toFixed(2)}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-0.5">Saldo</p>
          <p className="text-lg font-medium text-blue-600">
            R$ {saldo.toFixed(2)}
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
