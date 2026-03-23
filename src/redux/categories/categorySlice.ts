import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import * as XLSX from "xlsx";
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
  deleteSubCategoryLoading: boolean;
  deleteSubCategoryError: string | null;
  updateSubCategoryLoading: boolean;
  updateSubCategoryError: string | null;
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
  deleteSubCategoryLoading: false,
  deleteSubCategoryError: null,
  updateSubCategoryLoading: false,
  updateSubCategoryError: null,
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

    // Delete sub-category
    deleteSubCategoryRequest(state, _action: PayloadAction<string>) {
      state.deleteSubCategoryLoading = true;
      state.deleteSubCategoryError = null;
    },
    deleteSubCategorySuccess(state, action: PayloadAction<string>) {
      state.deleteSubCategoryLoading = false;
      state.subCategories = state.subCategories.filter(
        (sub) => sub.id !== action.payload
      );
    },
    deleteSubCategoryFailure(state, action: PayloadAction<string>) {
      state.deleteSubCategoryLoading = false;
      state.deleteSubCategoryError = action.payload;
    },

    // Update sub-category
    updateSubCategoryRequest(
      state,
      _action: PayloadAction<{ id: string; name: string; mainCategoryId: string }>
    ) {
      state.updateSubCategoryLoading = true;
      state.updateSubCategoryError = null;
    },
    updateSubCategorySuccess(state, action: PayloadAction<SubCategory>) {
      state.updateSubCategoryLoading = false;
      state.subCategories = state.subCategories.map((sub) =>
        sub.id === action.payload.id ? { ...sub, ...action.payload } : sub
      );
    },
    updateSubCategoryFailure(state, action: PayloadAction<string>) {
      state.updateSubCategoryLoading = false;
      state.updateSubCategoryError = action.payload;
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
  deleteSubCategoryRequest,
  deleteSubCategorySuccess,
  deleteSubCategoryFailure,
  updateSubCategoryRequest,
  updateSubCategorySuccess,
  updateSubCategoryFailure,
} = categorySlice.actions;

export default categorySlice.reducer;
