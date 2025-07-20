import { NextApiRequest, NextApiResponse } from "next";

// Rota para criar usuário no Pluggy
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const response = await fetch("https://api.pluggy.ai/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": process.env.PLUGGY_CLIENT_ID!,
        "X-CLIENT-SECRET": process.env.PLUGGY_CLIENT_SECRET!,
      },
      body: JSON.stringify({
        // Você pode adicionar dados do usuário aqui se necessário
      }),
    });

    if (!response.ok) {
      throw new Error(`Pluggy API error: ${response.status}`);
    }

    const data = await response.json();

    return res.status(200).json(data);
  } catch (error) {
    console.error("Erro ao criar usuário no Pluggy:", error);
    return res.status(500).json({
      error: "Erro interno do servidor",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
