// Função utilitária para filtrar dados por mês e ano
export function filterByMonth<
  T extends { data?: string; date?: string; dataRecebimento?: string }
>(items: T[], month: number, year: number): T[] {
  return items.filter((item) => {
    // Buscar a data no item (pode estar em diferentes campos)
    const dateString = item.data || item.date || item.dataRecebimento;

    if (!dateString) return false;

    const itemDate = new Date(dateString);

    // Verificar se a data está dentro do mês e ano especificados
    return itemDate.getMonth() === month && itemDate.getFullYear() === year;
  });
}

// Função para obter o primeiro e último dia de um mês
export function getMonthRange(month: number, year: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  return {
    start: firstDay.toISOString().split("T")[0],
    end: lastDay.toISOString().split("T")[0],
    firstDay,
    lastDay,
  };
}

// Função para formatar mês/ano para exibição
export function formatMonthYear(month: number, year: number): string {
  const months = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  return `${months[month]} ${year}`;
}

// Função para verificar se é o mês atual
export function isCurrentMonth(month: number, year: number): boolean {
  const now = new Date();
  return month === now.getMonth() && year === now.getFullYear();
}
