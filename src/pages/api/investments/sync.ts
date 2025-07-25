// pages/api/investments/sync.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ 
      success: false, 
      error: `Method ${req.method} Not Allowed` 
    });
  }

  // Esta rota agora é apenas um proxy
  // O frontend deve usar o hook useInvestments() que chama diretamente o backend
  // via authService através do useApi
  
  return res.status(200).json({
    success: true,
    data: [],
    message: 'Use o hook useInvestments() no frontend para sincronizar os dados.'
  });
}
