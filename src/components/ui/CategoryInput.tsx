// src/components/ui/CategoryInput.tsx
import { CategorySuggestion } from "@/constants/categories";
import { ChevronDown, Tag } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface CategoryInputProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: CategorySuggestion[];
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export function CategoryInput({
  value,
  onChange,
  suggestions,
  placeholder = "Digite ou selecione uma category",
  error,
  disabled,
  className = "",
}: CategoryInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filtrar sugestões baseado no valor digitado
  const filteredSuggestions = suggestions.filter((suggestion) =>
    suggestion.name.toLowerCase().includes(inputValue.toLowerCase())
  );

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sincronizar inputValue com value prop
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    setIsOpen(true);
  };

  const handleSuggestionClick = (suggestion: CategorySuggestion) => {
    setInputValue(suggestion.name);
    onChange(suggestion.name);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Tag className="h-4 w-4 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full pl-10 pr-10 py-2 border rounded-lg text-sm
            focus:ring-2 focus:ring-blue-500 focus:border-transparent
            disabled:bg-gray-50 disabled:text-gray-500
            ${
              error
                ? "border-red-300 ring-2 ring-red-500 ring-opacity-20"
                : "border-gray-300"
            }
          `}
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <ChevronDown
            className={`h-4 w-4 text-gray-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      {/* Dropdown com sugestões */}
      {isOpen &&
        (filteredSuggestions.length > 0 || inputValue.trim() === "") && (
          <div
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            {(inputValue.trim() === "" ? suggestions : filteredSuggestions).map(
              (suggestion) => (
                <button
                  key={suggestion.id}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 transition-colors"
                >
                  <span className="text-lg">{suggestion.icon}</span>
                  <span className="text-sm font-medium text-gray-900">
                    {suggestion.name}
                  </span>
                </button>
              )
            )}

            {/* Opção para usar valor customizado se não existir nas sugestões */}
            {inputValue.trim() !== "" &&
              !suggestions.some(
                (s) => s.name.toLowerCase() === inputValue.toLowerCase()
              ) && (
                <div className="border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => {
                      onChange(inputValue);
                      setIsOpen(false);
                      inputRef.current?.blur();
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 transition-colors"
                  >
                    <span className="text-lg">📝</span>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">
                        Usar "{inputValue}"
                      </span>
                      <span className="text-xs text-gray-500">
                        Categoria personalizada
                      </span>
                    </div>
                  </button>
                </div>
              )}
          </div>
        )}

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
