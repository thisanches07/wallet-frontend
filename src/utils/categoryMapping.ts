// src/utils/categoryMapping.ts
import {
  getCategoryByName,
  getCategoryColor,
  getCategoryIcon,
} from "@/constants/categories";

/**
 * Utilitários para mapear categorys antigas do backend para as novas categorys fixas
 */

// Mapeamento de categorys antigas (IDs) para novos nomes
const categoryIdToNameMap: Record<string, string> = {
  "1": "Aluguel",
  "2": "Transporte",
  "3": "Alimentação",
  "4": "Educação",
  "5": "Lazer",
  "6": "Saúde",
  "7": "Outros",
  "8": "Salário",
  "9": "Freelance",
  "10": "Investimentos",
  // Mapeamentos adicionais conforme necessário
};

// Mapeamento de nomes antigos para novos nomes
const categoryNameMap: Record<string, string> = {
  // Despesas
  moradia: "Aluguel",
  casa: "Aluguel",
  habitacao: "Aluguel",
  transporte: "Transporte",
  carro: "Transporte",
  combustivel: "Transporte",
  alimentacao: "Alimentação",
  comida: "Alimentação",
  supermercado: "Alimentação",
  educacao: "Educação",
  ensino: "Educação",
  curso: "Educação",
  lazer: "Lazer",
  entretenimento: "Lazer",
  diversao: "Lazer",
  saude: "Saúde",
  medico: "Saúde",
  farmacia: "Saúde",
  outros: "Outros",

  // Receitas
  salario: "Salário",
  trabalho: "Salário",
  emprego: "Salário",
  freelance: "Freelance",
  autonomo: "Freelance",
  consultoria: "Freelance",
  investimentos: "Investimentos",
  investimento: "Investimentos",
  aplicacao: "Investimentos",
  renda: "Investimentos",
};

/**
 * Mapeia uma category antiga (ID ou nome) para o novo nome padrão
 */
export function mapCategory(categoryInput: string | number): string {
  const categoryStr = categoryInput.toString();

  // Primeiro tenta mapear por ID
  if (categoryIdToNameMap[categoryStr]) {
    return categoryIdToNameMap[categoryStr];
  }

  // Depois tenta mapear por nome (normalizado)
  const normalizedInput = categoryStr
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/\s+/g, ""); // Remove espaços

  for (const [oldName, newName] of Object.entries(categoryNameMap)) {
    const normalizedOldName = oldName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "");

    if (normalizedInput === normalizedOldName) {
      return newName;
    }
  }

  // Se não encontrar mapeamento, verifica se já é um nome válido
  const existingCategory = getCategoryByName(categoryStr);
  if (existingCategory) {
    return existingCategory.name;
  }

  // Fallback: retorna a category original ou "Outros"
  return categoryStr || "Outros";
}

/**
 * Obtém o ícone para uma category (mapeando se necessário)
 */
export function getCategoryIconSafe(categoryInput: string | number): string {
  const mappedCategory = mapCategory(categoryInput);
  return getCategoryIcon(mappedCategory);
}

/**
 * Obtém a cor para uma category (mapeando se necessário)
 */
export function getCategoryColorSafe(categoryInput: string | number): string {
  const mappedCategory = mapCategory(categoryInput);
  return getCategoryColor(mappedCategory);
}

/**
 * Converte dados antigos de category (com ID) para o novo formato (string)
 */
export function convertCategoryData(oldCategory: any): string {
  if (typeof oldCategory === "string") {
    return mapCategory(oldCategory);
  }

  if (typeof oldCategory === "number") {
    return mapCategory(oldCategory);
  }

  // Se for um objeto com formato antigo: { id, name, type }
  if (oldCategory && typeof oldCategory === "object") {
    if (oldCategory.name) {
      return mapCategory(oldCategory.name);
    }
    if (oldCategory.id) {
      return mapCategory(oldCategory.id);
    }
  }

  return "Outros";
}
