// components/Topbar.tsx
import Link from "next/link";

export function Topbar() {
  return (
    <header className="w-full bg-white shadow-md border-b border-gray-200 px-6 py-3 flex justify-between items-center">
      <h1 className="text-xl font-bold text-gray-800">Carteira IA</h1>

      <nav className="space-x-6 text-sm font-medium text-gray-700">
        <Link href="/dashboard" className="hover:text-blue-600 transition">
          Controle de Finanças
        </Link>
        <Link href="/investimentos" className="hover:text-blue-600 transition">
          Melhores Investimentos
        </Link>
        <Link href="/carteira" className="hover:text-blue-600 transition">
          Monte Minha Carteira
        </Link>
        <Link href="/perfil" className="hover:text-blue-600 transition">
          Perfil
        </Link>
      </nav>
    </header>
  );
}
