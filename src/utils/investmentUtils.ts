// utils/investmentUtils.ts

export const formatCurrency = (value: number | string): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numValue || 0);
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};

export const formatPercentage = (value: number | string): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return `${(numValue || 0).toFixed(2)}%`;
};

export const getStatusColor = (status: string): string => {
  switch (status.toUpperCase()) {
    case 'ACTIVE':
      return 'bg-emerald-100 text-emerald-800';
    case 'TOTAL_WITHDRAWAL':
      return 'bg-gray-100 text-gray-800';
    case 'PARTIAL_WITHDRAWAL':
      return 'bg-amber-100 text-amber-800';
    default:
      return 'bg-blue-100 text-blue-800';
  }
};

export const getStatusText = (status: string): string => {
  switch (status.toUpperCase()) {
    case 'ACTIVE':
      return 'Ativo';
    case 'TOTAL_WITHDRAWAL':
      return 'Resgatado';
    case 'PARTIAL_WITHDRAWAL':
      return 'Resgate Parcial';
    default:
      return status;
  }
};

export const getTypeDisplayName = (type: string): string => {
  const typeMap: Record<string, string> = {
    'STOCK': 'Ações',
    'REAL_ESTATE_FUND': 'Fundos Imobiliários',
    'ETF': 'ETFs',
    'INVESTMENT_FUND': 'Fundos de Investimento',
    'FIXED_INCOME': 'Renda Fixa',
    'CRYPTO': 'Criptomoedas',
    'PENSION_FUND': 'Previdência',
    'TREASURY': 'Tesouro Direto',
  };
  
  return typeMap[type.toUpperCase()] || type;
};
