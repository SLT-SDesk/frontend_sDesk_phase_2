import apiClient from "../../api/axiosInstance";
import axios from "axios"; // only for isAxiosError type guard in error handling
import { MainCategory, SubCategory, CategoryItem } from "./categoryTypes";
import { buildUrl, API_BASE } from "../../utils/apiUtils";

export const fetchMainCategories = async () => {
  try {
    return await apiClient.get(buildUrl(API_BASE, "/categories/main"));
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};

export const fetchMainCategoryById = async (id: string) => {
  try {
    return await apiClient.get(buildUrl(API_BASE, `/categories/main/${id}`));
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};

export const createMainCategory = async (data: Partial<MainCategory>) => {
  try {
    return await apiClient.post(buildUrl(API_BASE, "/categories/main"), data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};

export const updateMainCategory = async (
  id: string,
  data: Partial<MainCategory>
) => {
  try {
    return await apiClient.put(
      buildUrl(API_BASE, `/categories/main/${id}`),
      data
    );
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};

export const deleteMainCategory = async (id: string) => {
  try {
    return await apiClient.delete(buildUrl(API_BASE, `/categories/main/${id}`));
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};

// Sub Category Services
export const fetchSubCategories = async () => {
  try {
    return await apiClient.get(buildUrl(API_BASE, "/categories/sub"));
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};

export const fetchSubCategoryById = async (id: string) => {
  try {
    return await apiClient.get(buildUrl(API_BASE, `/categories/sub/${id}`));
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};

export const createSubCategory = async (data: Partial<SubCategory>) => {
  try {
    return await apiClient.post(buildUrl(API_BASE, "/categories/sub"), data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};

export const updateSubCategory = async (
  id: string,
  data: Partial<SubCategory>
) => {
  try {
    return await apiClient.put(
      buildUrl(API_BASE, `/categories/sub/${id}`),
      data
    );
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};

export const deleteSubCategory = async (id: string) => {
  try {
    return await apiClient.delete(buildUrl(API_BASE, `/categories/sub/${id}`));
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};

export const fetchSubCategoriesByMainCategoryId = async (
  mainCategoryId: string
) => {
  try {
    return await apiClient.get(
      buildUrl(API_BASE, `/categories/sub/by-main/${mainCategoryId}`)
    );
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};

// Category Item Services
export const fetchCategoryItems = async () => {
  try {
    return await apiClient.get(buildUrl(API_BASE, "/categories/item"));
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};

export const fetchCategoryItemById = async (id: string) => {
  try {
    return await apiClient.get(buildUrl(API_BASE, `/categories/item/${id}`));
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};

export const createCategoryItem = async (data: {
  name: string;
  subCategoryId: string;
}) => {
  try {
    return await apiClient.post(buildUrl(API_BASE, "/categories/item"), {
      name: data.name?.trim(),
      subCategoryId:
        typeof data.subCategoryId === "string"
          ? data.subCategoryId
          : String(data.subCategoryId),
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};

export const updateCategoryItem = async (
  id: string,
  data: { name: string; subCategoryId: string }
) => {
  try {
    return await apiClient.put(
      buildUrl(API_BASE, `/categories/item/${id}`),
      data
    );
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};

export const deleteCategoryItem = async (id: string) => {
  try {
    return await apiClient.delete(buildUrl(API_BASE, `/categories/item/${id}`));
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};
