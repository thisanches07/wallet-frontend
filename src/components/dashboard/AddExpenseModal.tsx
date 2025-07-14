import { Calendar, DollarSign, FileText, Plus, Tag, X } from "lucide-react";
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
    if (form.descricao && form.categoria && form.valor && form.data) {
      onAdd({ ...form, id: uuidv4(), valor: parseFloat(form.valor) });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-neutral-200 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-primary rounded-xl">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-neutral-900">
                Nova Despesa
              </h3>
              <p className="text-sm text-neutral-500">Adicionar novo gasto</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Descrição */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
              <FileText className="w-4 h-4" />
              Descrição
            </label>
            <input
              name="descricao"
              value={form.descricao}
              onChange={handleChange}
              placeholder="Ex: Supermercado, Gasolina..."
              className="input-primary"
              required
            />
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
              <Tag className="w-4 h-4" />
              Categoria
            </label>
            <select
              name="categoria"
              value={form.categoria}
              onChange={handleChange}
              className="input-primary"
              required
            >
              <option value="">Selecione uma categoria</option>
              <option value="Moradia">🏠 Moradia</option>
              <option value="Transporte">🚗 Transporte</option>
              <option value="Alimentação">🍽️ Alimentação</option>
              <option value="Saúde">⚕️ Saúde</option>
              <option value="Educação">📚 Educação</option>
              <option value="Lazer">🎯 Lazer</option>
              <option value="Compras">🛍️ Compras</option>
              <option value="Outros">📦 Outros</option>
            </select>
          </div>

          {/* Valor e Data */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
                <DollarSign className="w-4 h-4" />
                Valor
              </label>
              <input
                name="valor"
                type="number"
                step="0.01"
                min="0"
                value={form.valor}
                onChange={handleChange}
                placeholder="0,00"
                className="input-primary"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
                <Calendar className="w-4 h-4" />
                Data
              </label>
              <input
                name="data"
                type="date"
                value={form.data}
                onChange={handleChange}
                className="input-primary"
                required
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="button-secondary flex-1"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="button-primary flex-1 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
