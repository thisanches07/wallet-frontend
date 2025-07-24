// components/MonthSelectorMobile.tsx
import { Calendar } from "lucide-react";

interface Props {
  selected: number;
  onSelect: (month: number) => void;
}

export default function MonthSelectorMobile({ selected, onSelect }: Props) {
  const months = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];
  const currentMonth = new Date().getMonth();
  const year = new Date().getFullYear();

  return (
    <div className="bg-white rounded-xl shadow border border-gray-100 p-4 sm:hidden">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="text-blue-600 w-5 h-5" />
        <span className="text-sm font-semibold text-gray-700">
          Selecionar Mês
        </span>
        <span className="ml-auto text-sm text-gray-500">{year}</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {months.map((month, index) => {
          const isCurrent = index === currentMonth;
          const isSelected = index === selected;
          return (
            <button
              key={month}
              onClick={() => onSelect(index)}
              className={`p-2 text-sm rounded-xl font-medium relative ${
                isSelected
                  ? "bg-blue-600 text-white shadow"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              {month}
              {isCurrent && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border-2 border-white" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
