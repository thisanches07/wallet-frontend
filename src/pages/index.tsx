import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useRouter } from "next/router";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { login, signup, googleLogin, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [loading, user, router]);

  const handleLogin = async () => {
    try {
      setError(null);
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      const firebaseCode = err?.code || err?.message || "";
      setError(getFriendlyFirebaseError(firebaseCode));
    }
  };

  const handleSignup = async () => {
    try {
      setError(null);
      await signup(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      const firebaseCode = err?.code || err?.message || "";
      setError(getFriendlyFirebaseError(firebaseCode));
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError(null);
      await googleLogin();
      router.push("/dashboard");
    } catch (err: any) {
      const firebaseCode = err?.code || err?.message || "";
      setError(getFriendlyFirebaseError(firebaseCode));
    }
  };

  function getFriendlyFirebaseError(errorCode: string): string {
    const map: Record<string, string> = {
      "auth/invalid-email": "E-mail inválido.",
      "auth/user-not-found": "Usuário não encontrado.",
      "auth/wrong-password": "Credenciais inválidas.",
      "auth/email-already-in-use": "Este e-mail já está em uso.",
      "auth/weak-password": "A senha deve ter no mínimo 6 caracteres.",
      "auth/invalid-credential": "Credenciais inválidas.",
      "auth/popup-closed-by-user": "Login com o Google foi cancelado.",
    };

    return map[errorCode] || "Erro desconhecido. Tente novamente.";
  }

  return (
    <main className="login-page">
      <div className="login-box">
        <h1 className="login-title">Carteira IA</h1>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="login-input"
        />

        <input
          placeholder="Senha"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="login-input"
        />

        <button onClick={handleLogin} className="btn btn-primary">
          Entrar
        </button>

        <button onClick={handleSignup} className="btn btn-secondary">
          Cadastrar
        </button>

        <button onClick={handleGoogleLogin} className="btn btn-google">
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            width={20}
          />
          Entrar com Google
        </button>

        {error && <p className="login-error">{error}</p>}
        {loading && <p className="login-loading">Carregando...</p>}
      </div>
    </main>
  );
}
