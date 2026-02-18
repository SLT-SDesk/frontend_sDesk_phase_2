import { call, put, takeLatest } from "redux-saga/effects";
import {
  fetchCategoriesFailure,
  fetchCategoriesRequest,
  fetchCategoriesSuccess,
  fetchMainCategoriesRequest,
  createCategoryRequest,
  createCategorySuccess,
  createCategoryFailure,
  fetchSubCategoriesByMainCategoryIdRequest,
  fetchSubCategoriesByMainCategoryIdSuccess,
  fetchSubCategoriesByMainCategoryIdFailure,
  createSubCategoryRequest,
  createCategoryItemRequest,
  fetchCategoryItemsRequest,
  fetchCategoryItemsSuccess,
  fetchCategoryItemsFailure,
  deleteCategoryItemRequest,
  deleteCategoryItemSuccess,
  deleteCategoryItemFailure,
  deleteSubCategoryRequest,
  deleteSubCategorySuccess,
  deleteSubCategoryFailure,
  updateCategoryItemRequest,
  updateCategoryItemSuccess,
  updateCategoryItemFailure,
  updateSubCategoryRequest,
  updateSubCategorySuccess,
  updateSubCategoryFailure,
  fetchSubCategoriesRequest,
  fetchSubCategoriesSuccess,
  fetchSubCategoriesFailure,
} from "./categorySlice";
import {
  createMainCategory,
  createSubCategory,
  fetchMainCategories,
  fetchSubCategories,
  fetchSubCategoriesByMainCategoryId,
  createCategoryItem,
  fetchCategoryItems,
  deleteCategoryItem,
  deleteSubCategory,
  updateCategoryItem,
  updateSubCategory,
} from "./categoryService";
import { PayloadAction } from "@reduxjs/toolkit";
import {
  CreateMainCategoryPayload,
  CreateSubCategoryPayload,
} from "./categoryTypes";

function* handleFetchCategories() {
  try {
    const categories = yield call(fetchMainCategories);
    yield put(fetchCategoriesSuccess(categories.data)); // Only dispatch serializable data
  } catch (error: any) {
    yield put(fetchCategoriesFailure(error.message));
  }
}

function* handleCreateCategory(
  action: PayloadAction<CreateMainCategoryPayload | CreateSubCategoryPayload>
) {
  try {
    let newCategory;
    // If mainCategoryId is present, it's a subcategory
    if ("mainCategoryId" in action.payload && action.payload.mainCategoryId) {
      newCategory = yield call(createSubCategory, action.payload);
    } else {
      newCategory = yield call(createMainCategory, action.payload);
    }
    yield put(createCategorySuccess(newCategory.data));
    yield put(fetchCategoriesRequest());
  } catch (error: any) {
    if (error && error.code === "DUPLICATE_NAME") {
      yield put(createCategoryFailure("DUPLICATE_NAME"));
    } else if (
      error &&
      error.message &&
      typeof error.message === "string" &&
      error.message.includes("already exists")
    ) {
      yield put(createCategoryFailure("DUPLICATE_NAME"));
    } else {
      yield put(
        createCategoryFailure(error.message || "Error creating category")
      );
    }
  }
}

function* handleFetchMainCategories() {
  try {
    const categories = yield call(fetchMainCategories);
    yield put({
      type: "categories/fetchMainCategoriesSuccess",
      payload: categories.data,
    });
  } catch (error) {
    yield put({
      type: "categories/fetchMainCategoriesFailure",
      payload: error.message,
    });
  }
}

function* handleFetchSubCategoriesByMainCategoryId(
  action: PayloadAction<string>
) {
  try {
    const response = yield call(
      fetchSubCategoriesByMainCategoryId,
      action.payload
    );
    yield put(fetchSubCategoriesByMainCategoryIdSuccess(response.data));
  } catch (error: any) {
    yield put(fetchSubCategoriesByMainCategoryIdFailure(error.message));
  }
}



function* handleCreateCategoryItem(
  action: PayloadAction<{ name: string; subCategoryId: string }>
) {
  try {
    const subCategoryId = String(action.payload.subCategoryId || "").trim();
    if (!subCategoryId) {
      yield put({
        type: "categories/createCategoryItemFailure",
        payload: "Sub Category is required",
      });
      return;
    }
    const response = yield call(createCategoryItem, {
      name: action.payload.name,
      subCategoryId,
    });
    yield put({
      type: "categories/createCategoryItemSuccess",
      payload: response.data,
    });
    
    // Refresh subcategories to update category item counts
    yield put(fetchSubCategoriesRequest());
    
  } catch (error) {
    if (error && error.code === "DUPLICATE_NAME") {
      yield put({
        type: "categories/createCategoryItemFailure",
        payload: "DUPLICATE_NAME",
      });
    } else if (
      error &&
      error.message &&
      typeof error.message === "string" &&
      error.message.includes("already exists")
    ) {
      yield put({
        type: "categories/createCategoryItemFailure",
        payload: "DUPLICATE_NAME",
      });
    } else {
      yield put({
        type: "categories/createCategoryItemFailure",
        payload: error.message || "Error creating category item",
      });
    }
  }
}

function* handleFetchCategoryItems() {
  try {
    const response = yield call(fetchCategoryItems);
    yield put(fetchCategoryItemsSuccess(response.data));
  } catch (error) {
    yield put(fetchCategoryItemsFailure(error.message));
  }
}

function* handleDeleteCategoryItem(action: PayloadAction<string>) {
  try {
    yield call(deleteCategoryItem, action.payload);
    yield put(deleteCategoryItemSuccess(action.payload));
    yield put(fetchSubCategoriesRequest());//refresh
  } catch (error: any) {
    yield put(deleteCategoryItemFailure(error.message || "Delete failed"));
  }
}
function* handleDeleteSubCategory(action: PayloadAction<string>) {
  try {
    yield call(deleteSubCategory, action.payload);
    yield put(deleteSubCategorySuccess(action.payload));

    // refresh lists
    yield put(fetchSubCategoriesRequest());
    yield put(fetchCategoryItemsRequest());
  } catch (error: any) {
    yield put(deleteSubCategoryFailure(error.message || "Delete failed"));
  }
}

function* handleUpdateCategoryItem(
  action: PayloadAction<{ id: string; name: string; subCategoryId: string }>
) {
  try {
    const { id, name, subCategoryId } = action.payload;
    // The backend expects subCategoryId as a key
    const response = yield call(updateCategoryItem, id, {
      name,
      subCategoryId,
    });
    yield put(updateCategoryItemSuccess(response.data));
    yield put(fetchSubCategoriesRequest());
  } catch (error: any) {
    yield put(updateCategoryItemFailure(error.message || "Update failed"));
  }
}

function* handleUpdateSubCategory(
  action: PayloadAction<{ id: string; name: string; mainCategoryId: string }>
) {
  try {
    const { id, name, mainCategoryId } = action.payload;

    const response: any = yield call(
      (id: string, data: any) => updateSubCategory(id, data),
      id,
      { name, mainCategoryId }
    );

    yield put(updateSubCategorySuccess(response.data));
    yield put(fetchSubCategoriesRequest());
    yield put(fetchMainCategoriesRequest());
  } catch (error: any) {
    yield put(updateSubCategoryFailure(error.message || "Update failed"));
  }
}




function* handleCreateSubCategory(
  action: PayloadAction<CreateSubCategoryPayload>
) {
  try {
    const newSubCategory = yield call(createSubCategory, action.payload);
    yield put({
      type: "categories/createSubCategorySuccess",
      payload: newSubCategory.data,
    });
    
    // Refresh subcategories list so UI shows the new subcategory
    yield put(fetchSubCategoriesRequest());
    
  } catch (error) {
    if (error && error.code === "DUPLICATE_NAME") {
      yield put({
        type: "categories/createSubCategoryFailure",
        payload: "DUPLICATE_NAME",
      });
    } else if (
      error &&
      error.message &&
      typeof error.message === "string" &&
      error.message.includes("already exists")
    ) {
      yield put({
        type: "categories/createSubCategoryFailure",
        payload: "DUPLICATE_NAME",
      });
    } else {
      yield put({
        type: "categories/createSubCategoryFailure",
        payload: error.message || "Error creating subcategory",
      });
    }
  }
}

function* handleFetchSubCategories() {
  try {
    const response = yield call(fetchSubCategories);
    yield put(fetchSubCategoriesSuccess(response.data));
  } catch (error: any) {
    yield put(fetchSubCategoriesFailure(error.message || "Error fetching subcategories"));
  }
}

export default function* categorySaga() {
  yield takeLatest(fetchCategoriesRequest.type, handleFetchCategories);
  yield takeLatest(createCategoryRequest.type, handleCreateCategory);
  yield takeLatest(fetchMainCategoriesRequest.type, handleFetchMainCategories);
  yield takeLatest(fetchSubCategoriesRequest.type, handleFetchSubCategories);
  yield takeLatest(
    fetchSubCategoriesByMainCategoryIdRequest.type,
    handleFetchSubCategoriesByMainCategoryId
  );
  yield takeLatest(createCategoryItemRequest.type, handleCreateCategoryItem);
  yield takeLatest(fetchCategoryItemsRequest.type, handleFetchCategoryItems);
  yield takeLatest(deleteCategoryItemRequest.type, handleDeleteCategoryItem);
  yield takeLatest(deleteSubCategoryRequest.type, handleDeleteSubCategory);
  yield takeLatest(updateCategoryItemRequest.type, handleUpdateCategoryItem);
  yield takeLatest(updateSubCategoryRequest.type, handleUpdateSubCategory);
  yield takeLatest(createSubCategoryRequest.type, handleCreateSubCategory);
}
