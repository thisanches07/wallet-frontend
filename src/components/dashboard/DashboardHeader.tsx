interface Props {
  selectedMonth: string;
}

const fullMonthMap: Record<string, string> = {
  Jan: "Janeiro",
  Feb: "Fevereiro",
  Mar: "Março",
  Apr: "Abril",
  May: "Maio",
  Jun: "Junho",
  Jul: "Julho",
  Aug: "Agosto",
  Sep: "Setembro",
  Oct: "Outubro",
  Nov: "Novembro",
  Dec: "Dezembro",
};

export function DashboardHeader({ selectedMonth }: Props) {
  return (
    <header className="mb-4">
      <h1 className="text-2xl font-bold">
        Controle Financeiro de {fullMonthMap[selectedMonth]}
      </h1>
    </header>
  );
}
