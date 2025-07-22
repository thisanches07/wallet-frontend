import { AuthButton } from "@/components/login/AuthButton";
import { AuthInput } from "@/components/login/AuthInput";
import { ErrorMessage } from "@/components/login/ErrorMessage";
import { GoogleLoginButton } from "@/components/login/GoogleLoginButton";
import { getFriendlyFirebaseError } from "@/context/AuthContext";
import { Eye, EyeOff, Shield, TrendingUp, Wallet, Zap } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, signup, googleLogin, loading, user } = useAuth();
  const router = useRouter();

  // Função para limpar cache completamente
  const clearAllCache = () => {
    console.log("🧹 Limpando todo o cache...");
    localStorage.clear();
    sessionStorage.clear();
    location.reload();
  };

  useEffect(() => {
    if (!loading && user) {
      console.log(
        "🔄 Usuário encontrado, redirecionando para dashboard...",
        user
      );
      router.push("/dashboard");
    }
  }, [loading, user, router]);

  const handleAction = async (action: "login" | "signup" | "google") => {
    try {
      setError(null);

      if (action === "signup") {
        // Validações para signup
        if (!name.trim()) {
          setError("Por favor, informe seu nome.");
          return;
        }

        if (password.length < 6) {
          setError("A senha deve ter pelo menos 6 caracteres.");
          return;
        }

        if (password !== confirmPassword) {
          setError("As senhas não coincidem.");
          return;
        }

        await signup(email, password, name);
      } else if (action === "login") {
        await login(email, password);
      } else if (action === "google") {
        await googleLogin();
      }

      router.push("/dashboard");
    } catch (err: any) {
      const code = err?.code || err?.message || "";
      setError(getFriendlyFirebaseError(code));
    }
  };

  const toggleMode = () => {
    setIsSignupMode(!isSignupMode);
    setError(null);
    // Limpar campos específicos do signup
    setName("");
    setConfirmPassword("");
    setShowConfirmPassword(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-600/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
        {/* Seção esquerda - Branding e benefícios */}
        <div className="hidden lg:block space-y-8 pl-8">
          {/* Logo e título principal */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent">
                Carteira IA
              </h1>
            </div>
            <p className="text-xl text-gray-600 leading-relaxed">
              Transforme sua gestão financeira com inteligência artificial
            </p>
          </div>

          {/* Benefícios principais */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Análises Inteligentes
                </h3>
                <p className="text-gray-600 text-sm">
                  Insights automáticos sobre seus gastos e oportunidades de
                  economia
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-md">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">100% Seguro</h3>
                <p className="text-gray-600 text-sm">
                  Seus dados protegidos com criptografia de nível bancário
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-md">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Setup Rápido</h3>
                <p className="text-gray-600 text-sm">
                  Comece a usar em menos de 2 minutos
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Seção direita - Formulário de login */}
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 space-y-6">
            {/* Header do formulário */}
            <div className="text-center space-y-2">
              <div className="lg:hidden flex items-center justify-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">
                  Carteira IA
                </span>
              </div>

              <h2 className="text-2xl font-bold text-gray-900">
                {isSignupMode ? "Criar Conta" : "Bem-vindo de volta"}
              </h2>
              <p className="text-gray-600">
                {isSignupMode
                  ? "Comece sua jornada financeira hoje"
                  : "Entre na sua conta para continuar"}
              </p>
            </div>

            {/* Formulário */}
            <div className="space-y-4">
              {/* Campo Nome - apenas no modo signup */}
              {isSignupMode && (
                <AuthInput
                  placeholder="Seu nome completo"
                  value={name}
                  onChange={setName}
                  type="text"
                />
              )}

              <AuthInput
                placeholder="seu@email.com"
                value={email}
                onChange={setEmail}
                type="email"
              />

              <div className="relative">
                <AuthInput
                  type={showPassword ? "text" : "password"}
                  placeholder="Sua senha"
                  value={password}
                  onChange={setPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Campo Confirmar Senha - apenas no modo signup */}
              {isSignupMode && (
                <div className="relative">
                  <AuthInput
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirme sua senha"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              )}

              {error && <ErrorMessage message={error} />}

              <AuthButton
                onClick={() => handleAction(isSignupMode ? "signup" : "login")}
                loading={loading}
              >
                {loading
                  ? "Carregando..."
                  : isSignupMode
                  ? "Criar Conta"
                  : "Entrar"}
              </AuthButton>

              {/* Divider */}
              <div className="relative flex items-center">
                <div className="flex-1 border-t border-gray-200"></div>
                <span className="px-3 text-sm text-gray-500 bg-white">ou</span>
                <div className="flex-1 border-t border-gray-200"></div>
              </div>

              <GoogleLoginButton onClick={() => handleAction("google")} />

              {/* Toggle entre login/signup */}
              <div className="text-center pt-4">
                <button
                  onClick={toggleMode}
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  {isSignupMode
                    ? "Já tem uma conta? Faça login"
                    : "Não tem conta? Cadastre-se gratuitamente"}
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6 text-xs text-gray-500">
            <p>Ao continuar, você concorda com nossos</p>
            <div className="space-x-4">
              <a href="#" className="hover:text-blue-600 transition-colors">
                Termos de Uso
              </a>
              <span>•</span>
              <a href="#" className="hover:text-blue-600 transition-colors">
                Política de Privacidade
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
