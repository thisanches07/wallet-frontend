import { NextApiRequest, NextApiResponse } from "next";

// Rota para criar token de conexão do Pluggy
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId é obrigatório" });
    }

    const response = await fetch("https://api.pluggy.ai/connect_tokens", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": process.env.PLUGGY_CLIENT_ID!,
        "X-CLIENT-SECRET": process.env.PLUGGY_CLIENT_SECRET!,
      },
      body: JSON.stringify({
        userId: userId,
        // Opcional: você pode adicionar opções específicas aqui
        options: {
          // language: 'pt',
          // webhookUrl: 'https://your-webhook-url.com/webhook'
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Pluggy API error: ${response.status}`);
    }

    const data = await response.json();

    return res.status(200).json({ data });
  } catch (error) {
    console.error("Erro ao criar token de conexão:", error);
    return res.status(500).json({
      error: "Erro interno do servidor",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
