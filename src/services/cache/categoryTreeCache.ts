import type { SubCategoryBrowserSection } from '../../features/categories/types/subCategoryBrowser';
import {
  getCategoryRouteId,
  getNavigableCategories,
} from '../../features/categories/utils/categoryNavigation';
import {
  getCategories,
  getChildCategories,
  getSubCategories,
} from '../api/categoriesApi';
import { getErrorMessage } from '../api/errors';
import type { Category } from '../types/category';
import { getCategorySectionsCache, setCategorySectionsCache } from './screenCache';

type RawCategory = Category & {
  SubCategoryName?: string;
  ChildCategoryName?: string;
  parentCategory?: string | { _id?: string };
};

let parentCategories: Category[] = [];
let subCategoriesByParentId = new Map<string, Category[]>();
let childCategoriesBySubCategoryId = new Map<string, Category[]>();
let sectionsByParentId = new Map<string, SubCategoryBrowserSection[]>();
let loadPromise: Promise<void> | null = null;
let lastLoadError: string | null = null;

const listeners = new Set<() => void>();

function notifyListeners(): void {
  listeners.forEach((listener) => listener());
}

function normalizeArray(data: unknown): RawCategory[] {
  return Array.isArray(data) ? (data as RawCategory[]) : [];
}

function normalizeCategory(raw: RawCategory): Category {
  return {
    _id: raw._id,
    slug: raw.slug,
    name: raw.name ?? raw.SubCategoryName ?? raw.ChildCategoryName,
  };
}

function getParentCategoryId(raw: RawCategory): string | undefined {
  const parent = raw.parentCategory;
  if (!parent) {
    return undefined;
  }

  if (typeof parent === 'string') {
    return parent;
  }

  return parent._id;
}

function buildSectionsForParent(parentId: string): SubCategoryBrowserSection[] {
  const subCategories = getNavigableCategories(subCategoriesByParentId.get(parentId) ?? []);

  return subCategories
    .map((subCategory) => {
      const subCategoryId = getCategoryRouteId(subCategory);
      if (!subCategoryId) {
        return null;
      }

      return {
        subCategory,
        childCategories: getNavigableCategories(
          childCategoriesBySubCategoryId.get(subCategoryId) ?? [],
        ),
      };
    })
    .filter((section): section is SubCategoryBrowserSection => section !== null);
}

async function loadCategoryTree(): Promise<void> {
  const [parentsRaw, subCategoriesRaw, childCategoriesRaw] = await Promise.all([
    getCategories(),
    getSubCategories(),
    getChildCategories(),
  ]);

  parentCategories = getNavigableCategories(
    normalizeArray(parentsRaw).map((item) => normalizeCategory(item)),
  );

  subCategoriesByParentId = new Map();
  childCategoriesBySubCategoryId = new Map();
  sectionsByParentId = new Map();

  for (const raw of normalizeArray(subCategoriesRaw)) {
    const parentId = getParentCategoryId(raw);
    const subCategory = normalizeCategory(raw);
    const subCategoryId = getCategoryRouteId(subCategory);

    if (!parentId || !subCategoryId) {
      continue;
    }

    const existing = subCategoriesByParentId.get(parentId) ?? [];
    existing.push(subCategory);
    subCategoriesByParentId.set(parentId, existing);
  }

  for (const raw of normalizeArray(childCategoriesRaw)) {
    const subCategoryId = getParentCategoryId(raw);
    const childCategory = normalizeCategory(raw);
    const childCategoryId = getCategoryRouteId(childCategory);

    if (!subCategoryId || !childCategoryId) {
      continue;
    }

    const existing = childCategoriesBySubCategoryId.get(subCategoryId) ?? [];
    existing.push(childCategory);
    childCategoriesBySubCategoryId.set(subCategoryId, existing);
  }

  for (const parent of parentCategories) {
    const parentId = getCategoryRouteId(parent);
    if (!parentId) {
      continue;
    }

    const sections = buildSectionsForParent(parentId);
    sectionsByParentId.set(parentId, sections);
    setCategorySectionsCache(parentId, sections);
  }

  lastLoadError = null;
}

export function isCategoryTreeLoaded(): boolean {
  return parentCategories.length > 0;
}

export function getCategoryTreeLoadError(): string | null {
  return lastLoadError;
}

export function subscribeCategoryTree(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function prefetchCategoryTree(): void {
  void ensureCategoryTreeLoaded();
}

export async function ensureCategoryTreeLoaded(): Promise<void> {
  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = (async () => {
    try {
      await loadCategoryTree();
      notifyListeners();
    } catch (err) {
      lastLoadError = getErrorMessage(err, 'Failed to load categories');
      notifyListeners();
      loadPromise = null;
      throw err;
    }
  })();

  return loadPromise;
}

export function getCachedParentCategories(): Category[] {
  return parentCategories;
}

export function getCachedSubCategoriesByParent(parentId: string): Category[] {
  return getNavigableCategories(subCategoriesByParentId.get(parentId) ?? []);
}

export function getCachedChildCategoriesBySubCategory(subCategoryId: string): Category[] {
  return getNavigableCategories(childCategoriesBySubCategoryId.get(subCategoryId) ?? []);
}

export function getCachedCategorySections(parentId: string): SubCategoryBrowserSection[] {
  return sectionsByParentId.get(parentId) ?? getCategorySectionsCache(parentId) ?? [];
}
