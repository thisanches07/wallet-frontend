import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { auth } from "../lib/firebase";

interface AuthContextProps {
  user: any;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  googleLogin: () => Promise<void>;
  logout: () => Promise<void>;
}

export function getFriendlyFirebaseError(errorCode: string): string {
  const map: Record<string, string> = {
    "Firebase: Error (auth/invalid-email).": "Email e/ou senha inválidos.",
    "Firebase: Error (auth/user-not-found).": "Usuário não encontrado.",
    "Firebase: Error (auth/wrong-password).": "Email e/ou senha inválidos.",
    "Firebase: Error (auth/missing-password).": "Email e/ou senha inválidos.",
    "Firebase: Password should be at least 6 characters (auth/weak-password)":
      "Senha deve possuir pelo menos 6 caracteres",
    "Firebase: Error (auth/email-already-in-use).":
      "Este e-mail já está em uso.",
    "Firebase: Error (auth/weak-password).":
      "A senha deve ter no mínimo 6 caracteres.",
    "Firebase: Error (auth/invalid-credential).": "Email e/ou senha inválidos.",
    "Firebase: Error (auth/popup-closed-by-user).":
      "Login com o Google foi cancelado.",
  };

  console.log("erro ->", errorCode);

  return map[errorCode] || "Erro desconhecido. Tente novamente.";
}

const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const idToken = await firebaseUser.getIdToken();
        setUser(firebaseUser);
        setToken(idToken);
      } else {
        setUser(null);
        setToken(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const idToken = await userCredential.user.getIdToken();
    setUser(userCredential.user);
    setToken(idToken);
  };

  const signup = async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const idToken = await userCredential.user.getIdToken();
    setUser(userCredential.user);
    setToken(idToken);
  };

  const googleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      // Adicionar configurações para garantir que funcione corretamente
      provider.addScope("email");
      provider.addScope("profile");

      const userCredential = await signInWithPopup(auth, provider);
      const idToken = await userCredential.user.getIdToken();
      setUser(userCredential.user);
      setToken(idToken);

      console.log("✅ Login com Google realizado com sucesso:", {
        name: userCredential.user.displayName,
        email: userCredential.user.email,
        photo: userCredential.user.photoURL,
      });
    } catch (error: any) {
      console.error("❌ Erro no login com Google:", error);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setToken(null);
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
