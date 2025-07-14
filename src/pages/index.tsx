import { AuthButton } from "@/components/login/AuthButton";
import { AuthInput } from "@/components/login/AuthInput";
import { ErrorMessage } from "@/components/login/ErrorMessage";
import { GoogleLoginButton } from "@/components/login/GoogleLoginButton";
import { getFriendlyFirebaseError } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { login, signup, googleLogin, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.push("/dashboard");
  }, [loading, user, router]);

  const handleAction = async (action: "login" | "signup" | "google") => {
    try {
      setError(null);
      if (action === "login") await login(email, password);
      if (action === "signup") await signup(email, password);
      if (action === "google") await googleLogin();
      router.push("/dashboard");
    } catch (err: any) {
      const code = err?.code || err?.message || "";
      setError(getFriendlyFirebaseError(code));
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-800">
      <div className="w-full max-w-sm bg-white border border-gray-300 p-8 rounded-2xl shadow-lg space-y-4">
        <h1 className="text-2xl font-bold text-center text-blue-600 mb-4">
          Carteira IA
        </h1>

        <AuthInput placeholder="Email" value={email} onChange={setEmail} />
        <AuthInput
          type="password"
          placeholder="Senha"
          value={password}
          onChange={setPassword}
        />

        <AuthButton
          onClick={() => handleAction("login")}
          className="btn-primary"
        >
          Entrar
        </AuthButton>
        <AuthButton
          onClick={() => handleAction("signup")}
          className="bg-gray-300 text-gray-800 hover:bg-gray-400"
        >
          Cadastrar
        </AuthButton>
        <GoogleLoginButton onClick={() => handleAction("google")} />

        {error && <ErrorMessage message={error} />}
        {loading && <p className="login-loading">Carregando...</p>}
        {process.env.NODE_ENV === "development" && (
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm underline text-gray-400 mt-4"
          >
            Pular login (dev)
          </button>
        )}
      </div>
    </main>
  );
}
