import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

type Props = {
  onClose: () => void;
  onAdd: (expense: any) => void;
};

export function AddExpenseModal({ onClose, onAdd }: Props) {
  const [form, setForm] = useState({
    descricao: "",
    categoria: "",
    valor: "",
    data: new Date().toISOString().substring(0, 10),
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ ...form, id: uuidv4(), valor: parseFloat(form.valor) });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Novo Gasto</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="descricao"
            value={form.descricao}
            onChange={handleChange}
            placeholder="Descrição"
            className="w-full border rounded px-3 py-2"
          />
          <select
            name="categoria"
            value={form.categoria}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Categoria</option>
            <option value="Moradia">Moradia</option>
            <option value="Transporte">Transporte</option>
            <option value="Alimentação">Alimentação</option>
            <option value="Lazer">Lazer</option>
            <option value="Outros">Outros</option>
          </select>
          <input
            name="valor"
            type="number"
            value={form.valor}
            onChange={handleChange}
            placeholder="Valor (R$)"
            className="w-full border rounded px-3 py-2"
          />
          <input
            name="data"
            type="date"
            value={form.data}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
