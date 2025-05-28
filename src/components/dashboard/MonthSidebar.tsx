interface Props {
  selected: string;
  onSelect: (month: string) => void;
}

export function MonthSidebar({ selected, onSelect }: Props) {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return (
    <aside className="bg-white border-r border-gray-200 h-full w-[200px] py-6 px-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-6">
        Filtrar por mês
      </h2>
      <ul className="space-y-2">
        {months.map((month) => (
          <li key={month}>
            <button
              onClick={() => onSelect(month)}
              className={`w-full text-left px-3 py-2 rounded-md transition-all font-medium
                ${
                  selected === month
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                }`}
            >
              {month}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
