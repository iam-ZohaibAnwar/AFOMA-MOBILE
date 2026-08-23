import type { Product } from '../../../services/types/product';

function normalizeTerm(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

export function extractSearchSuggestions(query: string, products: Product[], limit = 5): string[] {
  const normalizedQuery = normalizeTerm(query);
  if (!normalizedQuery) {
    return [];
  }

  const suggestions = new Set<string>();

  for (const product of products) {
    const name = product.productName?.trim();
    if (!name) {
      continue;
    }

    if (normalizeTerm(name).includes(normalizedQuery)) {
      suggestions.add(name);
    }

    if (suggestions.size >= limit) {
      break;
    }
  }

  return Array.from(suggestions).slice(0, limit);
}

export function filterMatchingTerms(query: string, terms: string[], limit = 5): string[] {
  const normalizedQuery = normalizeTerm(query);
  if (!normalizedQuery) {
    return [];
  }

  return terms
    .filter((term) => normalizeTerm(term).includes(normalizedQuery))
    .slice(0, limit);
}
