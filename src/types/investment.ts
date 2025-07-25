// types/investment.ts

export interface Investment {
  id: string;
  name: string;
  code?: string;
  isin?: string;
  type: string;
  subtype?: string;
  value: number | string;
  quantity: number | string;
  amount: number | string;
  status: 'ACTIVE' | 'TOTAL_WITHDRAWAL' | 'PARTIAL_WITHDRAWAL' | string;
  date: string;
  issuer?: string;
  lastTwelveMonthsRate?: number | string;
}

export interface InvestmentResponse {
  success: boolean;
  data: Investment[];
  error?: string;
  message?: string;
}

export interface InvestmentGroup {
  type: string;
  investments: Investment[];
  totalAmount: number;
}
