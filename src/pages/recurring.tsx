import { RecurringManagementPanel } from "@/components/dashboard/RecurringManagementPanel";
import { Topbar } from "@/components/Topbar";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function RecurringPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (
      !loading &&
      !user &&
      process.env.NEXT_PUBLIC_NODE_ENV !== "development"
    ) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-neutral-50 via-white to-neutral-100">
      <Topbar />

      <main className="flex-1 p-3 lg:p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Voltar ao Dashboard</span>
            </button>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              Gestão de Recorrências
            </h1>
            <p className="text-neutral-600">
              Configure e monitore suas receitas e despesas que se repetem
              mensalmente
            </p>
          </div>

          {/* Main Content */}
          <RecurringManagementPanel />
        </div>
      </main>
    </div>
  );
}
