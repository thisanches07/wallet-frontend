import { useEffect, useState } from "react";
import api from "../utils/api";
import { useAuth } from "../hooks/useAuth";
import { useRouter } from "next/router";

export default function DashboardPage() {
  const { user, logout, loading } = useAuth();
  const [data, setData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      api
        .get("/users/me")
        .then((res) => setData(res.data))
        .catch(console.error);
    }
  }, [user]);

  if (loading)
    return (
      <p style={{ color: "#fff", textAlign: "center", paddingTop: "2rem" }}>
        Carregando...
      </p>
    );

  if (!user) return null;

  return (
    <main
      style={{
        padding: 20,
        backgroundColor: "#0e0e11",
        height: "100vh",
        color: "#f0f0f0",
      }}
    >
      <h1>Dashboard</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <button onClick={logout}>Sair</button>
    </main>
  );
}
