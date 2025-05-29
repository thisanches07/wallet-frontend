interface Props {
  selected: number; // ex: 0 para Jan, 1 para Feb...
  onSelect: (monthIndex: number) => void;
}

export function MonthSidebar({ selected, onSelect }: Props) {
  const currentMonth = new Date().getMonth(); // 0-based

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
      <h2 className="text-lg font-semibold text-gray-800 mb-6">Visão Anual</h2>
      <ul className="space-y-2">
        {months.slice(0, currentMonth + 1).map((month, index) => (
          <li key={month}>
            <button
              onClick={() => onSelect(index)}
              className={`w-full flex justify-between items-center px-3 py-2 rounded-md transition-all font-medium
                ${
                  selected === index
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                }`}
            >
              <span>{month}</span>

              {index === currentMonth && (
                <span className="text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">
                  Atual
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
