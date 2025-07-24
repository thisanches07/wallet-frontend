// components/Topbar.tsx
import { useAuth } from "@/hooks/useAuth";
import {
  ChevronDown,
  LogOut,
  Menu,
  PieChart,
  Settings,
  TrendingUp,
  User,
  Wallet,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface UserInfo {
  name: string;
  email: string;
  avatar?: string;
  plan: "Free" | "Pro" | "Premium";
}

interface BackendUserData {
  name?: string;
  email?: string;
  plan?: string;
  [key: string]: any;
}

// Funções utilitárias para dados do usuário Google
const getUserDisplayName = (user: any) => {
  if (user?.displayName) {
    return user.displayName;
  }
  if (user?.email) {
    const emailName = user.email.split("@")[0];
    return (
      emailName.charAt(0).toUpperCase() +
      emailName.slice(1).replace(/[._]/g, " ")
    );
  }
  return "Usuário";
};

const getUserInitials = (name: string) => {
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return parts[0].charAt(0).toUpperCase() + parts[1].charAt(0).toUpperCase();
  }
  return name.charAt(0).toUpperCase();
};

// Hook personalizado para dados do usuário (pode ser expandido para integrar com backend)
const useUserProfile = (firebaseUser: any) => {
  const [userProfile, setUserProfile] = useState<UserInfo | null>(null);

  useEffect(() => {
    // Limpar dados quando não há usuário ou quando o usuário muda
    if (!firebaseUser) {
      setUserProfile(null);
      return;
    }

    // Limpar dados do usuário anterior quando trocar de usuário
    setUserProfile(null);

    // Função para buscar dados adicionais do backend
    const fetchUserProfile = async () => {
      try {
        // Criar uma chave única baseada no UID do usuário
        const userKey = `userProfile_${firebaseUser.uid}`;

        // Limpar cache de outros usuários
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith("userProfile_") && key !== userKey) {
            localStorage.removeItem(key);
          }
        });

        // Importar o authService dinamicamente para evitar circular imports
        const { authService } = await import("@/services/authService");

        // Verificar se há token antes de fazer a chamada
        const token = authService.getToken();
        if (!token) {
          // Se não há token, usar apenas dados do Firebase
          const profile: UserInfo = {
            name: getUserDisplayName(firebaseUser),
            email: firebaseUser.email || "",
            avatar: firebaseUser.photoURL || undefined,
            plan: "Free",
          };
          setUserProfile(profile);
          return;
        }

        // Buscar dados do backend primeiro (apenas se há token)
        try {
          const backendResponse = await authService.getUserProfile();

          let profile: UserInfo;
          if (backendResponse.success && backendResponse.data) {
            // Usar dados do backend se disponíveis
            const backendData = backendResponse.data as BackendUserData;
            profile = {
              name: backendData.name || getUserDisplayName(firebaseUser),
              email: backendData.email || firebaseUser.email || "",
              avatar: firebaseUser.photoURL || undefined,
              plan: (backendData.plan as "Free" | "Pro" | "Premium") || "Free",
            };
          } else {
            // Fallback para dados do Firebase
            profile = {
              name: getUserDisplayName(firebaseUser),
              email: firebaseUser.email || "",
              avatar: firebaseUser.photoURL || undefined,
              plan: "Free",
            };
          }

          setUserProfile(profile);
        } catch (apiError) {
          // Se falhou a chamada da API, usar dados do Firebase silenciosamente
          const profile: UserInfo = {
            name: getUserDisplayName(firebaseUser),
            email: firebaseUser.email || "",
            avatar: firebaseUser.photoURL || undefined,
            plan: "Free",
          };
          setUserProfile(profile);
        }
      } catch (error) {
        console.error("Erro ao buscar perfil do usuário:", error);
        // Fallback para dados do Firebase
        const profile: UserInfo = {
          name: getUserDisplayName(firebaseUser),
          email: firebaseUser.email || "",
          avatar: firebaseUser.photoURL || undefined,
          plan: "Free",
        };
        setUserProfile(profile);
      }
    };

    fetchUserProfile();
  }, [firebaseUser?.uid]); // Dependência específica no UID do usuário

  return userProfile;
};

export function Topbar() {
  const { user, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [mounted, setMounted] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Usar o hook personalizado para dados do usuário
  const userInfo = useUserProfile(user);

  // SEMPRE chamar useEffect primeiro, antes de qualquer return condicional
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setIsUserMenuOpen(false);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  // Se não há usuário autenticado ou não está montado, não renderizar o componente
  if (!mounted || !user || !userInfo) {
    return null;
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "Free":
        return "bg-gray-100 text-gray-700 border-gray-200";
      case "Pro":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Premium":
        return "bg-purple-100 text-purple-700 border-purple-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <header className="w-full bg-white/95 backdrop-blur-lg border-b border-neutral-200/60 px-3 sm:px-4 lg:px-6 py-3 flex justify-between items-center sticky top-0 z-50 shadow-sm">
      {/* Logo e Brand com Status de Segurança */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <div className="relative flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group flex-shrink-0">
          <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:scale-110 transition-transform duration-200" />
        </div>
        <div className="hidden sm:block min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-lg lg:text-xl font-bold text-neutral-900 tracking-tight truncate">
              Carteira IA
            </h1>
          </div>
        </div>
      </div>

      {/* Navegação Principal - Desktop */}
      <nav className="hidden lg:flex items-center space-x-2">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-200 transition-all duration-200 group px-4 py-2.5 rounded-xl hover:bg-blue-100"
        >
          <TrendingUp className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span>Dashboard</span>
        </Link>
        <Link
          href="/investimentos"
          className="flex items-center gap-2 text-sm font-medium text-neutral-700 hover:text-blue-600 transition-all duration-200 group px-4 py-2.5 rounded-xl hover:bg-blue-50"
        >
          <PieChart className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span>Investimentos</span>
        </Link>
        <Link
          href="/carteira"
          className="flex items-center gap-2 text-sm font-medium text-neutral-700 hover:text-blue-600 transition-all duration-200 group px-4 py-2.5 rounded-xl hover:bg-blue-50"
        >
          <Wallet className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span>Carteira</span>
        </Link>
      </nav>

      {/* Seção do Usuário */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Menu do Usuário */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 sm:gap-3 p-2 hover:bg-neutral-50 rounded-xl transition-all duration-200 group border border-transparent hover:border-neutral-200 min-w-0"
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {userInfo.avatar ? (
                <img
                  src={userInfo.avatar}
                  alt={userInfo.name}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover ring-2 ring-neutral-200 group-hover:ring-blue-300 transition-all duration-200"
                  onError={(e) => {
                    // Fallback caso a imagem do Google falhe
                    e.currentTarget.style.display = "none";
                    e.currentTarget.nextElementSibling?.classList.remove(
                      "hidden"
                    );
                  }}
                />
              ) : null}
              <div
                className={`w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center ${
                  userInfo.avatar ? "hidden" : ""
                }`}
              >
                <span className="text-white font-semibold text-xs sm:text-sm">
                  {getUserInitials(userInfo.name)}
                </span>
              </div>
              {/* Status online */}
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
            </div>

            {/* Info do Usuário - Desktop */}
            <div className="hidden lg:block text-left min-w-0">
              <p className="text-sm font-semibold text-neutral-900 truncate max-w-[120px]">
                {userInfo.name}
              </p>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full border ${getPlanColor(
                    userInfo.plan
                  )}`}
                >
                  {userInfo.plan}
                </span>
              </div>
            </div>

            <ChevronDown
              className={`w-3 h-3 sm:w-4 sm:h-4 text-neutral-500 transition-transform duration-200 hidden sm:block ${
                isUserMenuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-16px)] bg-white border border-neutral-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
              {/* Header do Menu */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-neutral-200">
                <div className="flex items-center gap-3">
                  {userInfo.avatar ? (
                    <img
                      src={userInfo.avatar}
                      alt={userInfo.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm flex-shrink-0"
                      onError={(e) => {
                        // Fallback caso a imagem do Google falhe
                        e.currentTarget.style.display = "none";
                        e.currentTarget.nextElementSibling?.classList.remove(
                          "hidden"
                        );
                      }}
                    />
                  ) : null}
                  <div
                    className={`w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center ring-2 ring-white shadow-sm flex-shrink-0 ${
                      userInfo.avatar ? "hidden" : ""
                    }`}
                  >
                    <span className="text-white font-bold text-lg">
                      {getUserInitials(userInfo.name)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-neutral-900 truncate">
                      {userInfo.name}
                    </p>
                    <p className="text-sm text-neutral-600 truncate">
                      {userInfo.email}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`inline-block text-xs font-medium px-2 py-1 rounded-full border ${getPlanColor(
                          userInfo.plan
                        )}`}
                      >
                        Plano {userInfo.plan}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-2">
                <Link
                  href="/profile"
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 rounded-xl transition-colors duration-200"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <User className="w-4 h-4" />
                  <span>Meu Perfil</span>
                </Link>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 rounded-xl transition-colors duration-200">
                  <Settings className="w-4 h-4" />
                  <span>Configurações</span>
                </button>
                <div className="h-px bg-neutral-200 my-2 mx-3"></div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sair</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-2 text-neutral-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
        >
          {isMobileMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-neutral-200 shadow-lg z-40">
          <nav className="p-4 space-y-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-blue-700 bg-blue-50 rounded-xl"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <TrendingUp className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/profile"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 rounded-xl transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <User className="w-5 h-5" />
              <span>Meu Perfil</span>
            </Link>
            <Link
              href="/investimentos"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 rounded-xl transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <PieChart className="w-5 h-5" />
              <span>Investimentos</span>
            </Link>
            <Link
              href="/carteira"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 rounded-xl transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Wallet className="w-5 h-5" />
              <span>Carteira</span>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
