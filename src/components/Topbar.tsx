// components/Topbar.tsx
import { useAuth } from "@/hooks/useAuth";
import {
  ChevronDown,
  LogOut,
  Menu,
  PieChart,
  Settings,
  Shield,
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
    if (!firebaseUser) {
      setUserProfile(null);
      return;
    }

    // Função para buscar dados adicionais do backend (opcional)
    const fetchUserProfile = async () => {
      try {
        // TODO: Implementar busca no backend usando firebaseUser.uid
        // const response = await api.get(`/users/${firebaseUser.uid}/profile`);
        // const backendData = response.data;

        // Por enquanto, usar apenas dados do Firebase/Google
        const profile: UserInfo = {
          name: getUserDisplayName(firebaseUser),
          email: firebaseUser.email || "",
          avatar: firebaseUser.photoURL || undefined,
          plan: "Pro", // TODO: buscar do backend
        };

        setUserProfile(profile);
      } catch (error) {
        console.error("Erro ao buscar perfil do usuário:", error);
        // Fallback para dados do Firebase
        const profile: UserInfo = {
          name: getUserDisplayName(firebaseUser),
          email: firebaseUser.email || "",
          avatar: firebaseUser.photoURL || undefined,
          plan: "Pro",
        };
        setUserProfile(profile);
      }
    };

    fetchUserProfile();
  }, [firebaseUser]);

  return userProfile;
};

export function Topbar() {
  const { user, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Usar o hook personalizado para dados do usuário
  const userInfo = useUserProfile(user);

  // Usuário padrão para quando não há login
  const defaultUser: UserInfo = {
    name: "Usuário Demo",
    email: "demo@carteira-ia.com",
    avatar: undefined,
    plan: "Free",
  };

  // Usar userInfo se disponível, senão usar defaultUser
  const currentUser = userInfo || defaultUser;
  const isLoggedIn = !!user;

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
      if (isLoggedIn) {
        await logout();
      }
      setIsUserMenuOpen(false);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

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
    <header className="w-full bg-white/95 backdrop-blur-lg border-b border-neutral-200/60 px-4 lg:px-6 py-3 flex justify-between items-center sticky top-0 z-50 shadow-sm">
      {/* Logo e Brand com Status de Segurança */}
      <div className="flex items-center gap-4">
        <div className="relative flex items-center justify-center w-11 h-11 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group">
          <Wallet className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-200" />
          {/* Indicador de segurança SSL */}
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
            <Shield className="w-2 h-2 text-white" />
          </div>
        </div>
        <div className="hidden sm:block">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
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
      <div className="flex items-center gap-3">
        {/* Busca - Desktop */}
        {/* Menu do Usuário */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-3 p-2 hover:bg-neutral-50 rounded-xl transition-all duration-200 group border border-transparent hover:border-neutral-200"
          >
            {/* Avatar */}
            <div className="relative">
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-neutral-200 group-hover:ring-blue-300 transition-all duration-200"
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
                className={`w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center ${
                  currentUser.avatar ? "hidden" : ""
                }`}
              >
                <span className="text-white font-semibold text-sm">
                  {getUserInitials(currentUser.name)}
                </span>
              </div>
              {/* Status online */}
              <div
                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${
                  isLoggedIn ? "bg-emerald-500" : "bg-gray-400"
                } border-2 border-white rounded-full`}
              ></div>
            </div>

            {/* Info do Usuário - Desktop */}
            <div className="hidden lg:block text-left">
              <p className="text-sm font-semibold text-neutral-900 truncate max-w-[120px]">
                {currentUser.name}
              </p>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full border ${getPlanColor(
                    currentUser.plan
                  )}`}
                >
                  {currentUser.plan}
                </span>
                {!isLoggedIn && (
                  <span className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                    Demo
                  </span>
                )}
              </div>
            </div>

            <ChevronDown
              className={`w-4 h-4 text-neutral-500 transition-transform duration-200 ${
                isUserMenuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-neutral-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
              {/* Header do Menu */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-neutral-200">
                <div className="flex items-center gap-3">
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm"
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
                    className={`w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center ring-2 ring-white shadow-sm ${
                      currentUser.avatar ? "hidden" : ""
                    }`}
                  >
                    <span className="text-white font-bold text-lg">
                      {getUserInitials(currentUser.name)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-neutral-900 truncate">
                      {currentUser.name}
                    </p>
                    <p className="text-sm text-neutral-600 truncate">
                      {currentUser.email}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`inline-block text-xs font-medium px-2 py-1 rounded-full border ${getPlanColor(
                          currentUser.plan
                        )}`}
                      >
                        Plano {currentUser.plan}
                      </span>
                      {!isLoggedIn && (
                        <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full border border-orange-200">
                          Demo
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-2">
                <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 rounded-xl transition-colors duration-200">
                  <User className="w-4 h-4" />
                  <span>Meu Perfil</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 rounded-xl transition-colors duration-200">
                  <Settings className="w-4 h-4" />
                  <span>Configurações</span>
                </button>
                <div className="h-px bg-neutral-200 my-2 mx-3"></div>
                {isLoggedIn ? (
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sair</span>
                  </button>
                ) : (
                  <Link
                    href="/"
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-blue-600 hover:bg-blue-50 rounded-xl transition-colors duration-200"
                  >
                    <User className="w-4 h-4" />
                    <span>Fazer Login</span>
                  </Link>
                )}
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
