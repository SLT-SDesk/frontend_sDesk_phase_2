export interface MainCategory {
  id: string;
  name: string;
  category_code: string;
  createdAt: string;
  updatedAt: string;
  subCategories?: SubCategory[];
}

export interface SubCategory {
  id: string;
  name: string;
  category_code: string;
  createdAt: string;
  updatedAt: string;
  mainCategory: MainCategory;
  categoryItems?: CategoryItem[];
}

export interface CategoryItem {
  id: string;
  name: string;
  category_code: string;
  createdAt: string;
  updatedAt: string;
  subCategory: SubCategory;
}

export interface MainCategoryState {
  list: MainCategory[];
  loading: boolean;
  error: string | null;
  nextCode: string | null;
}

export interface SubCategoryState {
  list: SubCategory[];
  loading: boolean;
  error: string | null;
  nextCode: string | null;
}

export interface CategoryItemState {
  list: CategoryItem[];
  loading: boolean;
  error: string | null;
  nextCode: string | null;
}

export interface CreateMainCategoryPayload {
  name: string;
}

export interface CreateSubCategoryPayload {
  name: string;
  mainCategoryId: string;
}

export interface CreateCategoryItemPayload {
  name: string;
  subCategoryId: string;
}

export interface ApiError {
  message: string;
}