import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { useRouter } from "next/router";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { auth, googleProvider } from "../lib/firebase";
import { authService } from "../services/authService";

interface AuthContextProps {
  user: any;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  googleLogin: () => Promise<void>;
  logout: () => Promise<void>;
}

export function getFriendlyFirebaseError(errorCode: string): string {
  const map: Record<string, string> = {
    "auth/invalid-email": "Email e/ou senha inválidos.",
    "auth/user-not-found": "Usuário não encontrado.",
    "auth/wrong-password": "Email e/ou senha inválidos.",
    "auth/missing-password": "Email e/ou senha inválidos.",
    "Firebase: Password should be at least 6 characters (auth/weak-password)":
      "Senha deve possuir pelo menos 6 caracteres",
    "auth/email-already-in-use": "Este e-mail já está em uso.",
    "auth/weak-password": "A senha deve ter no mínimo 6 caracteres.",
    "auth/invalid-credential": "Email e/ou senha inválidos.",
    "auth/popup-closed-by-user": "Login com o Google foi cancelado.",
    INVALID_EMAIL: "Email inválido.",
    EMAIL_NOT_FOUND: "Email não encontrado.",
    INVALID_PASSWORD: "Senha incorreta.",
    USER_DISABLED: "Usuário desabilitado.",
    TOO_MANY_ATTEMPTS_TRY_LATER:
      "Muitas tentativas. Tente novamente mais tarde.",
  };

  console.log("Erro Firebase:", errorCode);

  return map[errorCode] || "Erro desconhecido. Tente novamente.";
}

// Função auxiliar para sincronizar usuário com backend
const syncUserWithBackend = async (
  firebaseUser: any,
  token: string,
  name?: string
) => {
  try {
    // Fazer chamada para GET /api/users/me (incluindo nome se fornecido)
    const response = await authService.syncUserWithBackend(name);

    if (response.success) {
      return response.data;
    } else {
      console.warn("⚠️ Falha na sincronização do usuário:", response.error);
    }
  } catch (error) {
    console.error("❌ Erro ao sincronizar usuário com backend:", error);
  }
};

const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Limpar qualquer token existente primeiro para evitar loops
    const savedToken = authService.getToken();
    if (savedToken) {
      console.log(
        "🔍 Token salvo encontrado, removendo para garantir estado limpo"
      );
      authService.removeToken();
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // Limpar estado anterior imediatamente quando há mudança de usuário
      if (!firebaseUser) {
        setUser(null);
        setToken(null);
        authService.removeToken();
        setLoading(false);
        return;
      }

      // Se o UID mudou, limpar dados do usuário anterior
      if (user && user.uid !== firebaseUser.uid) {
        setUser(null);
        setToken(null);
        authService.removeToken();
      }

      try {
        const idToken = await firebaseUser.getIdToken();
        setUser(firebaseUser);
        setToken(idToken);
        authService.setToken(idToken);

        // Sincronizar com backend após autenticação
        await syncUserWithBackend(firebaseUser, idToken);
      } catch (error) {
        console.error("Erro ao obter token:", error);
        setUser(null);
        setToken(null);
        authService.removeToken();
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Método 1: Usar Firebase Auth SDK (recomendado)
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const idToken = await userCredential.user.getIdToken();
      setUser(userCredential.user);
      setToken(idToken);
      authService.setToken(idToken);

      // Sincronizar com backend após login
      await syncUserWithBackend(userCredential.user, idToken);
    } catch (error: any) {
      // Remover fallback de mock user - usar apenas Firebase SDK
      throw error; // Lançar o erro original do Firebase
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const idToken = await userCredential.user.getIdToken();
    setUser(userCredential.user);
    setToken(idToken);
    authService.setToken(idToken);

    // Sincronizar com backend após cadastro, incluindo o nome
    await syncUserWithBackend(userCredential.user, idToken, name);
  };

  const googleLogin = async () => {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const idToken = await userCredential.user.getIdToken();
      setUser(userCredential.user);
      setToken(idToken);
      authService.setToken(idToken);

      // Sincronizar com backend após login com Google
      await syncUserWithBackend(userCredential.user, idToken);
    } catch (error: any) {
      console.error("❌ Erro no login com Google:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log("🚪 Iniciando logout...");

      // 1. Limpar estado local PRIMEIRO para evitar mais requisições
      setUser(null);
      setToken(null);
      authService.removeToken();

      // 2. Limpar todo o cache
      authService.logout();

      // 3. Fazer logout do Firebase (pode falhar, mas não é crítico)
      try {
        await signOut(auth);
        console.log("✅ Firebase logout realizado");
      } catch (firebaseError) {
        console.warn(
          "⚠️ Erro no logout do Firebase (não crítico):",
          firebaseError
        );
      }

      // 4. Redirecionar para a página de login
      console.log("🔄 Redirecionando para login...");
      router.push("/");
    } catch (error) {
      console.error("❌ Erro durante logout:", error);
      // Mesmo com erro, garantir que tudo seja limpo
      setUser(null);
      setToken(null);
      authService.logout();
      router.push("/");
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, signup, googleLogin, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
