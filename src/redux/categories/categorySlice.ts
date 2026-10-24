import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  MainCategory,
  MainCategoryState,
  SubCategory,
} from "./categoryTypes";
import type { CategoryItem } from "./categoryTypes";

interface CategoryState extends MainCategoryState {
  subCategories: SubCategory[];
  mainCategories: MainCategory[];
  subCategoriesLoading: boolean;
  subCategoriesError: string | null;
  categoryItems: any[];
  createSubCategoryLoading: boolean;
  createSubCategoryError: string | null;
  createSubCategorySuccess: boolean;
  createMainCategoryLoading: boolean;
  createMainCategoryError: string | null;
  createMainCategorySuccess: boolean;
  createCategoryItemLoading: boolean;
  createCategoryItemError: string | null;
  createCategoryItemSuccess: boolean;
  // Update / Delete SubCategory
  updateSubCategoryLoading: boolean;
  updateSubCategoryError: string | null;
  updateSubCategorySuccess: boolean;
  deleteSubCategoryLoading: boolean;
  deleteSubCategoryError: string | null;
  deleteSubCategorySuccess: boolean;
  // Update / Delete MainCategory
  updateMainCategoryLoading: boolean;
  updateMainCategoryError: string | null;
  updateMainCategorySuccess: boolean;
  deleteMainCategoryLoading: boolean;
  deleteMainCategoryError: string | null;
  deleteMainCategorySuccess: boolean;
}

const initialState: CategoryState = {
  list: [],
  loading: false,
  error: null,
  nextCode: null,
  subCategories: [],
  mainCategories: [],
  subCategoriesLoading: false,
  subCategoriesError: null,
  categoryItems: [],
  createSubCategoryLoading: false,
  createSubCategoryError: null,
  createSubCategorySuccess: false,
  createMainCategoryLoading: false,
  createMainCategoryError: null,
  createMainCategorySuccess: false,
  createCategoryItemLoading: false,
  createCategoryItemError: null,
  createCategoryItemSuccess: false,
  // Update / Delete SubCategory
  updateSubCategoryLoading: false,
  updateSubCategoryError: null,
  updateSubCategorySuccess: false,
  deleteSubCategoryLoading: false,
  deleteSubCategoryError: null,
  deleteSubCategorySuccess: false,
  // Update / Delete MainCategory
  updateMainCategoryLoading: false,
  updateMainCategoryError: null,
  updateMainCategorySuccess: false,
  deleteMainCategoryLoading: false,
  deleteMainCategoryError: null,
  deleteMainCategorySuccess: false,
};

const categorySlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    // Main categories
    fetchCategoriesRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchCategoriesSuccess(state, action: PayloadAction<MainCategory[]>) {
      state.loading = false;
      state.list = action.payload;
    },
    fetchCategoriesFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    // Subcategory creation
    createSubCategoryRequest(
      state,
      _action: PayloadAction<{ name: string; mainCategoryId: string }>
    ) {
      state.createSubCategoryLoading = true;
      state.createSubCategoryError = null;
      state.createSubCategorySuccess = false;
    },
    createSubCategorySuccess(state, action: PayloadAction<SubCategory>) {
      state.createSubCategoryLoading = false;
      state.createSubCategorySuccess = true;
      state.subCategories.push(action.payload);
    },
    createSubCategoryFailure(state, action: PayloadAction<string>) {
      state.createSubCategoryLoading = false;
      state.createSubCategoryError = action.payload;
      state.createSubCategorySuccess = false;
    },

    // Main categories with different naming
    fetchMainCategoriesRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchMainCategoriesSuccess(state, action: PayloadAction<MainCategory[]>) {
      state.loading = false;
      state.mainCategories = action.payload;
    },
    fetchMainCategoriesFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    fetchSubCategoriesRequest(state) {
      state.subCategoriesLoading = true;
      state.subCategoriesError = null;
    },
    fetchSubCategoriesSuccess(state, action: PayloadAction<SubCategory[]>) {
      state.subCategoriesLoading = false;
      state.subCategories = action.payload;
    },
    fetchSubCategoriesFailure(state, action: PayloadAction<string>) {
      state.subCategoriesLoading = false;
      state.subCategoriesError = action.payload;
    },

    // Main category creation
    createCategoryRequest(state, _action) {
      state.createMainCategoryLoading = true;
      state.createMainCategoryError = null;
      state.createMainCategorySuccess = false;
    },
    createCategorySuccess(state, action) {
      state.createMainCategoryLoading = false;
      state.createMainCategorySuccess = true;
      state.list.push(action.payload);
      // Also add to mainCategories so the table updates immediately
      if (action.payload && action.payload.id) {
        const exists = state.mainCategories.some((c) => c.id === action.payload.id);
        if (!exists) {
          state.mainCategories.push(action.payload);
        }
      }
    },
    createCategoryFailure(state, action) {
      state.createMainCategoryLoading = false;
      state.createMainCategoryError = action.payload;
      state.createMainCategorySuccess = false;
    },

    // Fetch subcategories by main category
    fetchSubCategoriesByMainCategoryIdRequest(
      state,
      _action: PayloadAction<string>
    ) {
      state.subCategoriesLoading = true;
      state.subCategoriesError = null;
    },
    fetchSubCategoriesByMainCategoryIdSuccess(
      state,
      action: PayloadAction<SubCategory[]>
    ) {
      state.subCategoriesLoading = false;
      state.subCategories = action.payload;
    },
    fetchSubCategoriesByMainCategoryIdFailure(
      state,
      action: PayloadAction<string>
    ) {
      state.subCategoriesLoading = false;
      state.subCategoriesError = action.payload;
    },

    // Category item  creation
    createCategoryItemRequest(state, _action) {
      state.createCategoryItemLoading = true;
      state.createCategoryItemError = null;
      state.createCategoryItemSuccess = false;
    },
    createCategoryItemSuccess(state, action) {
      state.createCategoryItemLoading = false;
      state.createCategoryItemSuccess = true;
      // Also add to categoryItems so the table updates immediately
      if (action.payload && action.payload.id) {
        const exists = (state.categoryItems || []).some((c) => c.id === action.payload.id);
        if (!exists) {
          state.categoryItems = [...(state.categoryItems || []), action.payload];
        }
      }
    },
    createCategoryItemFailure(state, action) {
      state.createCategoryItemLoading = false;
      state.createCategoryItemError = action.payload;
      state.createCategoryItemSuccess = false;
    },

    // Fetch all category items
    fetchCategoryItemsRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchCategoryItemsSuccess(state, action: PayloadAction<CategoryItem[]>) {
      state.loading = false;
      state.categoryItems = action.payload;
    },
    fetchCategoryItemsFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    // Delete category item
    deleteCategoryItemRequest(state, _action: PayloadAction<string>) {
      state.loading = true;
      state.error = null;
    },
    deleteCategoryItemSuccess(state, action: PayloadAction<string>) {
      state.loading = false;
      state.categoryItems = state.categoryItems.filter(
        (item: any) => item.id !== action.payload
      );
    },
    deleteCategoryItemFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    // Update category item
    updateCategoryItemRequest(
      state,
      _action: PayloadAction<{
        id: string;
        name: string;
        subCategoryId: string;
      }>
    ) {
      state.loading = true;
      state.error = null;
    },
    updateCategoryItemSuccess(state, action: PayloadAction<any>) {
      state.loading = false;
      const updated = action.payload;
      state.categoryItems = state.categoryItems.map((item) =>
        item.id === updated.id ? { ...item, ...updated } : item
      );
    },
    updateCategoryItemFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    // ── Update SubCategory ────────────────────────────────────────────────────
    updateSubCategoryRequest(
      state,
      _action: PayloadAction<{ id: string; name: string; mainCategoryId: string }>
    ) {
      state.updateSubCategoryLoading = true;
      state.updateSubCategoryError = null;
      state.updateSubCategorySuccess = false;
    },
    updateSubCategorySuccess(state, action: PayloadAction<SubCategory>) {
      state.updateSubCategoryLoading = false;
      state.updateSubCategorySuccess = true;
      state.subCategories = state.subCategories.map((s) =>
        s.id === action.payload.id ? { ...s, ...action.payload } : s
      );
    },
    updateSubCategoryFailure(state, action: PayloadAction<string>) {
      state.updateSubCategoryLoading = false;
      state.updateSubCategoryError = action.payload;
      state.updateSubCategorySuccess = false;
    },

    // ── Delete SubCategory ────────────────────────────────────────────────────
    deleteSubCategoryRequest(state, _action: PayloadAction<string>) {
      state.deleteSubCategoryLoading = true;
      state.deleteSubCategoryError = null;
      state.deleteSubCategorySuccess = false;
    },
    deleteSubCategorySuccess(state, action: PayloadAction<string>) {
      state.deleteSubCategoryLoading = false;
      state.deleteSubCategorySuccess = true;
      state.subCategories = state.subCategories.filter(
        (s) => s.id !== action.payload
      );
    },
    deleteSubCategoryFailure(state, action: PayloadAction<string>) {
      state.deleteSubCategoryLoading = false;
      state.deleteSubCategoryError = action.payload;
      state.deleteSubCategorySuccess = false;
    },

    // ── Update MainCategory ───────────────────────────────────────────────────
    updateMainCategoryRequest(
      state,
      _action: PayloadAction<{ id: string; name: string }>
    ) {
      state.updateMainCategoryLoading = true;
      state.updateMainCategoryError = null;
      state.updateMainCategorySuccess = false;
    },
    updateMainCategorySuccess(state, action: PayloadAction<MainCategory>) {
      state.updateMainCategoryLoading = false;
      state.updateMainCategorySuccess = true;
      state.mainCategories = state.mainCategories.map((c) =>
        c.id === action.payload.id ? { ...c, ...action.payload } : c
      );
      state.list = state.list.map((c) =>
        c.id === action.payload.id ? { ...c, ...action.payload } : c
      );
    },
    updateMainCategoryFailure(state, action: PayloadAction<string>) {
      state.updateMainCategoryLoading = false;
      state.updateMainCategoryError = action.payload;
      state.updateMainCategorySuccess = false;
    },

    // ── Delete MainCategory ───────────────────────────────────────────────────
    deleteMainCategoryRequest(state, _action: PayloadAction<string>) {
      state.deleteMainCategoryLoading = true;
      state.deleteMainCategoryError = null;
      state.deleteMainCategorySuccess = false;
    },
    deleteMainCategorySuccess(state, action: PayloadAction<string>) {
      state.deleteMainCategoryLoading = false;
      state.deleteMainCategorySuccess = true;
      state.mainCategories = state.mainCategories.filter(
        (c) => c.id !== action.payload
      );
      state.list = state.list.filter((c) => c.id !== action.payload);
    },
    deleteMainCategoryFailure(state, action: PayloadAction<string>) {
      state.deleteMainCategoryLoading = false;
      state.deleteMainCategoryError = action.payload;
      state.deleteMainCategorySuccess = false;
    },
  },
});

export const {
  fetchCategoriesRequest,
  fetchCategoriesSuccess,
  fetchCategoriesFailure,
  fetchMainCategoriesRequest,
  fetchMainCategoriesSuccess,
  fetchMainCategoriesFailure,
  fetchSubCategoriesRequest,
  fetchSubCategoriesSuccess,
  fetchSubCategoriesFailure,
  createCategoryRequest,
  createCategorySuccess,
  createCategoryFailure,
  createSubCategoryRequest,
  createSubCategorySuccess,
  createSubCategoryFailure,
  fetchSubCategoriesByMainCategoryIdRequest,
  fetchSubCategoriesByMainCategoryIdSuccess,
  fetchSubCategoriesByMainCategoryIdFailure,
  createCategoryItemRequest,
  createCategoryItemSuccess,
  createCategoryItemFailure,
  fetchCategoryItemsRequest,
  fetchCategoryItemsSuccess,
  fetchCategoryItemsFailure,
  deleteCategoryItemRequest,
  deleteCategoryItemSuccess,
  deleteCategoryItemFailure,
  updateCategoryItemRequest,
  updateCategoryItemSuccess,
  updateCategoryItemFailure,
  // SubCategory CRUD
  updateSubCategoryRequest,
  updateSubCategorySuccess,
  updateSubCategoryFailure,
  deleteSubCategoryRequest,
  deleteSubCategorySuccess,
  deleteSubCategoryFailure,
  // MainCategory CRUD
  updateMainCategoryRequest,
  updateMainCategorySuccess,
  updateMainCategoryFailure,
  deleteMainCategoryRequest,
  deleteMainCategorySuccess,
  deleteMainCategoryFailure,
} = categorySlice.actions;

export default categorySlice.reducer;
