import { Topbar } from "@/components/Topbar";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/authService";
import { ArrowRight, Check, Crown, Mail, Settings, User } from "lucide-react";
import { useEffect, useState } from "react";

const Profile = () => {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState("basic");
  const [userBackendData, setUserBackendData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Buscar dados do usuário do backend
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {

        const response = await authService.getUserProfile();


        if (response.success && response.data) {

          setUserBackendData(response.data);
        } else {

        }
      } catch (error) {
        console.error("❌ Erro ao buscar dados do usuário:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  // Dados do usuário com fallbacks apropriados
  const userProfile = {
    name:
      userBackendData?.name ||
      user?.displayName ||
      user?.email?.split("@")[0] ||
      "Usuário",
    email: userBackendData?.email || user?.email || "usuario@email.com",
    plan: userBackendData?.plan || "Plano Básico",
    joinDate: "Janeiro 2024",
  };

  const plans = [
    {
      id: "basic",
      name: "Básico",
      price: "Grátis",
      features: [
        "Controle de despesas básico",
        "Até 3 categorias",
        "Relatórios simples",
      ],
      current: true,
    },
    {
      id: "premium",
      name: "Premium",
      price: "R$ 19,90/mês",
      features: [
        "Controle avançado de despesas",
        "Categorias ilimitadas",
        "Relatórios detalhados",
        "Metas de economia",
        "Suporte prioritário",
      ],
      current: false,
      popular: true,
    },
    {
      id: "pro",
      name: "Pro",
      price: "R$ 39,90/mês",
      features: [
        "Tudo do Premium",
        "Análise de investimentos",
        "Consultoria financeira",
        "API personalizada",
        "Suporte 24/7",
      ],
      current: false,
    },
  ];

  const handlePlanChange = (planId: string) => {
    setSelectedPlan(planId);
    // Aqui você implementaria a lógica de mudança de plano

  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Topbar />
        <div className="max-w-4xl mx-auto p-6 pt-24">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Topbar />

      <div className="max-w-4xl mx-auto p-6 pt-24">
        {/* Header da página */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Meu Perfil
          </h1>
          <p className="text-neutral-600">
            Gerencie suas informações pessoais e plano
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informações do Perfil */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-card border border-neutral-200 p-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-xl font-bold text-neutral-900 mb-1">
                  {userProfile.name}
                </h2>
                <p className="text-neutral-500 text-sm">
                  Membro desde {userProfile.joinDate}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                  <Mail className="w-5 h-5 text-neutral-400" />
                  <div>
                    <p className="text-xs text-neutral-500 uppercase tracking-wide">
                      Email
                    </p>
                    <p className="text-sm font-medium text-neutral-900">
                      {userProfile.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                  <Crown className="w-5 h-5 text-neutral-400" />
                  <div>
                    <p className="text-xs text-neutral-500 uppercase tracking-wide">
                      Plano Atual
                    </p>
                    <p className="text-sm font-medium text-neutral-900">
                      {userProfile.plan}
                    </p>
                  </div>
                </div>
              </div>

              <button className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors text-sm font-medium">
                <Settings className="w-4 h-4" />
                Editar Perfil
                <span className="text-xs text-neutral-400">(Em breve)</span>
              </button>
            </div>
          </div>

          {/* Planos */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-card border border-neutral-200 p-6">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-neutral-900 mb-2">
                  Gerenciar Plano
                </h3>
                <p className="text-neutral-600">
                  Escolha o plano que melhor se adapta às suas necessidades
                </p>
              </div>

              <div className="space-y-4">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative p-4 border-2 rounded-xl transition-all cursor-pointer ${
                      plan.current
                        ? "border-primary-500 bg-primary-50"
                        : selectedPlan === plan.id
                        ? "border-primary-300 bg-primary-25"
                        : "border-neutral-200 hover:border-neutral-300"
                    }`}
                    onClick={() => handlePlanChange(plan.id)}
                  >
                    {plan.popular && (
                      <div className="absolute -top-2 left-4">
                        <span className="bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                          Mais Popular
                        </span>
                      </div>
                    )}

                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-bold text-neutral-900">
                            {plan.name}
                          </h4>
                          {plan.current && (
                            <span className="flex items-center gap-1 text-xs font-medium text-primary-600 bg-primary-100 px-2 py-1 rounded-full">
                              <Check className="w-3 h-3" />
                              Atual
                            </span>
                          )}
                        </div>
                        <p className="text-2xl font-bold text-neutral-900 mb-3">
                          {plan.price}
                        </p>
                        <ul className="space-y-2">
                          {plan.features.map((feature, index) => (
                            <li
                              key={index}
                              className="flex items-center gap-2 text-sm text-neutral-600"
                            >
                              <Check className="w-4 h-4 text-primary-500 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="ml-4">
                        {plan.current ? (
                          <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                selectedPlan === plan.id
                                  ? "bg-primary-600 text-white hover:bg-primary-700"
                                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePlanChange(plan.id);
                              }}
                            >
                              {selectedPlan === plan.id
                                ? "Selecionado"
                                : "Selecionar"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedPlan !== "basic" &&
                !plans.find((p) => p.id === selectedPlan)?.current && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-primary-25 rounded-xl border border-primary-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-primary-900 mb-1">
                          Pronto para fazer upgrade?
                        </h4>
                        <p className="text-sm text-primary-700">
                          Você selecionou o plano{" "}
                          {plans.find((p) => p.id === selectedPlan)?.name}
                        </p>
                      </div>
                      <button className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium">
                        Fazer Upgrade
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-primary-600 mt-2">
                      * Esta funcionalidade estará disponível em breve
                    </p>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
