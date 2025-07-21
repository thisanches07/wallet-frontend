export interface PluggyConnection {
  id: string;
  itemId: string;
  connector: {
    id: number;
    name: string;
    institutionUrl: string;
    imageUrl: string;
    primaryColor: string;
    type: string;
  };
  status: "UPDATED" | "UPDATING" | "WAITING_USER_INPUT" | "MERGING" | "ERROR";
  createdAt: string;
  updatedAt: string;
  lastUpdatedAt?: string;
  parameters?: any[];
  userAction?: string;
  webhookUrl?: string;
}

export interface PluggyAccount {
  id: string;
  itemId: string;
  type: "BANK" | "CREDIT";
  subtype: string;
  number: string;
  name: string;
  balance: number;
  currencyCode: string;
  creditData?: {
    limit: number;
    available: number;
    minimumPayment?: number;
    dueDate?: string;
  };
}

export interface PluggyTransaction {
  id: string;
  accountId: string;
  date: string;
  description: string;
  amount: number;
  currencyCode: string;
  category?: string;
  balance?: number;
  type: "DEBIT" | "CREDIT";
}

class PluggyService {
  private readonly baseUrl =
    process.env.NEXT_PUBLIC_PLUGGY_API_URL || "/api/pluggy";
  private token: string | null = null;

  constructor() {
    // O token será obtido do contexto de autenticação quando necessário
  }

  private async getAuthToken(): Promise<string> {
    // Em um cenário real, você obteria o token do contexto de autenticação
    // Por enquanto, vamos simular
    return "your-auth-token";
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getAuthToken();

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Inicia o processo de conexão com uma instituição financeira
   */
  async createConnection(
    connectorId: number,
    parameters?: any[]
  ): Promise<PluggyConnection> {
    return this.makeRequest<PluggyConnection>("/connections", {
      method: "POST",
      body: JSON.stringify({
        connectorId,
        parameters,
      }),
    });
  }

  /**
   * Lista todas as conexões do usuário
   */
  async getConnections(): Promise<PluggyConnection[]> {
    return this.makeRequest<PluggyConnection[]>("/connections");
  }

  /**
   * Obtém uma conexão específica
   */
  async getConnection(connectionId: string): Promise<PluggyConnection> {
    return this.makeRequest<PluggyConnection>(`/connections/${connectionId}`);
  }

  /**
   * Atualiza uma conexão existente
   */
  async updateConnection(
    connectionId: string,
    parameters?: any[]
  ): Promise<PluggyConnection> {
    return this.makeRequest<PluggyConnection>(`/connections/${connectionId}`, {
      method: "PATCH",
      body: JSON.stringify({ parameters }),
    });
  }

  /**
   * Remove uma conexão
   */
  async deleteConnection(connectionId: string): Promise<void> {
    await this.makeRequest(`/connections/${connectionId}`, {
      method: "DELETE",
    });
  }

  /**
   * Lista as contas de uma conexão
   */
  async getAccounts(connectionId?: string): Promise<PluggyAccount[]> {
    const endpoint = connectionId
      ? `/connections/${connectionId}/accounts`
      : "/accounts";
    return this.makeRequest<PluggyAccount[]>(endpoint);
  }

  /**
   * Obtém transações de uma conta
   */
  async getTransactions(
    accountId: string,
    options?: {
      from?: string;
      to?: string;
      pageSize?: number;
      page?: number;
    }
  ): Promise<PluggyTransaction[]> {
    const params = new URLSearchParams();
    if (options?.from) params.append("from", options.from);
    if (options?.to) params.append("to", options.to);
    if (options?.pageSize)
      params.append("pageSize", options.pageSize.toString());
    if (options?.page) params.append("page", options.page.toString());

    const query = params.toString();
    const endpoint = `/accounts/${accountId}/transactions${
      query ? `?${query}` : ""
    }`;

    return this.makeRequest<PluggyTransaction[]>(endpoint);
  }

  /**
   * Lista os conectores disponíveis (bancos suportados)
   */
  async getConnectors(options?: {
    name?: string;
    type?: string;
    country?: string;
  }): Promise<any[]> {
    const params = new URLSearchParams();
    if (options?.name) params.append("name", options.name);
    if (options?.type) params.append("type", options.type);
    if (options?.country) params.append("country", options.country);

    const query = params.toString();
    const endpoint = `/connectors${query ? `?${query}` : ""}`;

    return this.makeRequest<any[]>(endpoint);
  }

  /**
   * Obtém informações de um conector específico
   */
  async getConnector(connectorId: number): Promise<any> {
    return this.makeRequest<any>(`/connectors/${connectorId}`);
  }

  /**
   * Obtém o widget URL para autenticação OAuth (se aplicável)
   */
  async getWidgetUrl(connectionId: string): Promise<{ url: string }> {
    return this.makeRequest<{ url: string }>(
      `/connections/${connectionId}/widget`
    );
  }

  /**
   * Força uma sincronização de dados
   */
  async syncConnection(connectionId: string): Promise<PluggyConnection> {
    return this.makeRequest<PluggyConnection>(
      `/connections/${connectionId}/sync`,
      {
        method: "POST",
      }
    );
  }
}

export const pluggyService = new PluggyService();
