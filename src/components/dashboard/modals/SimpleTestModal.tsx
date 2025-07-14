import { X } from "lucide-react";

interface SimpleModalProps {
  onClose: () => void;
  onAdd: (data: any) => void;
}

export function SimpleTestModal({ onClose, onAdd }: SimpleModalProps) {
  console.log("SimpleTestModal renderizado!");

  const handleSubmit = () => {
    console.log("Submit do modal simples!");
    alert("Modal simples funcionando!");
    onAdd({ teste: "dados" });
  };

  return (
    <div
      className="fixed inset-0 bg-black/75 flex items-center justify-center"
      style={{ zIndex: 999999 }}
    >
      <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Modal de Teste</h2>
          <button onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <p className="mb-4">
          Este é um modal simples para testar se está funcionando.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-200 rounded-lg"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            Testar
          </button>
        </div>
      </div>
    </div>
  );
}
