// src/services/authService.ts
import { API_CONFIG } from "@/lib/firebase";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  idToken: string;
  refreshToken: string;
  localId: string;
  email: string;
  displayName?: string;
  expiresIn: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class AuthService {
  private baseUrl = API_CONFIG.backendUrl;
  private firebaseSignInUrl = API_CONFIG.firebaseSignInUrl;

  // Armazenar token localmente
  setToken(token: string) {
    localStorage.setItem("authToken", token);
  }

  getToken(): string | null {
    return localStorage.getItem("authToken");
  }

  removeToken() {
    localStorage.removeItem("authToken");
  }

  // Login direto com Firebase
  async loginWithEmailPassword(
    credentials: LoginCredentials
  ): Promise<AuthResponse> {
    if (!this.firebaseSignInUrl) {
      throw new Error("Firebase sign-in URL not configured");
    }

    const response = await fetch(this.firebaseSignInUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
        returnSecureToken: true,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Login failed");
    }

    const data = await response.json();

    // Armazenar o token
    this.setToken(data.idToken);

    return data;
  }

  // Método para fazer chamadas autenticadas para o backend
  async apiCall<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getToken();

    const headers = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      // Para respostas 204 (No Content), não há JSON para fazer parse
      let data = null;
      if (
        response.status !== 204 &&
        response.headers.get("content-length") !== "0"
      ) {
        try {
          const result = await response.json();
          data = result.data || result;
        } catch (jsonError) {
          // Se falhar ao fazer parse do JSON, continua com data = null
          data = null;
        }
      }

      if (!response.ok) {
        return {
          success: false,
          error:
            data?.message || `Request failed with status ${response.status}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Exemplos de endpoints que você pode usar
  async getUserProfile() {
    return this.apiCall("/api/users/me");
  }

  async syncUserWithBackend(name?: string) {
    // Se um nome foi fornecido, enviar no payload para o backend
    if (name) {
      return this.apiCall("/api/users/me", {
        method: "PATCH",
        body: JSON.stringify({ name }),
      });
    }
    return this.apiCall("/api/users/me");
  }

  async getTransactions() {
    return this.apiCall("/api/transactions");
  }

  async createTransaction(transaction: any) {
    return this.apiCall("/api/transactions", {
      method: "POST",
      body: JSON.stringify(transaction),
    });
  }

  // Logout
  logout() {
    this.removeToken();
  }
}

export const authService = new AuthService();
