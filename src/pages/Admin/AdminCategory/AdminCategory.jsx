import React, { useState } from "react";
import "./AdminCategory.css";
import {
  initialCategories,
  defaultParentCategoryOptions,
  defaultSubCategoryNameOptions,
} from "./mockCategoryData";
import CategoryListTable from "./CategoryListTable";
import SubCategoryListTable from "./SubCategoryListTable";
import EditCategoryModal from "./EditCategoryModal";
import EditSubCategoryModal from "./EditSubCategoryModal";
import DeleteCategoryModal from "./DeleteCategoryModal";
import AddCategoryModal from "./AddCategoryModal";
import AddSubCategoryModal from "./AddSubCategoryModal";

const AdminCategory = () => {
  // Main Categories State
  const [categories, setCategories] = useState(initialCategories);

  // Active Category for Drill Down (Sub Categories view)
  const [activeCategory, setActiveCategory] = useState(null);

  // Modal States
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);

  const [isEditSubCategoryOpen, setIsEditSubCategoryOpen] = useState(false);
  const [subCategoryToEdit, setSubCategoryToEdit] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'category' | 'subcategory', data: ... }

  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isAddSubCategoryOpen, setIsAddSubCategoryOpen] = useState(false);

  // Toast / Feedback message
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  // Derive all unique parent category options
  const parentOptions = Array.from(
    new Set([
      ...defaultParentCategoryOptions,
      ...categories.map((c) => c.parentName).filter(Boolean),
    ])
  );

  // --- Handlers for Main Category ---
  const handleSelectCategory = (cat) => {
    setActiveCategory(cat);
  };

  const handleBackToCategories = () => {
    setActiveCategory(null);
  };

  const handleOpenEditCategory = (cat) => {
    setCategoryToEdit(cat);
    setIsEditCategoryOpen(true);
  };

  const handleSaveEditCategory = (updatedData) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryToEdit.id
          ? { ...cat, id: updatedData.id, parentName: updatedData.parentName }
          : cat
      )
    );

    // If active category was edited, update activeCategory as well
    if (activeCategory && activeCategory.id === categoryToEdit.id) {
      setActiveCategory((prev) => ({
        ...prev,
        id: updatedData.id,
        parentName: updatedData.parentName,
      }));
    }

    setIsEditCategoryOpen(false);
    setCategoryToEdit(null);
    showNotification("Category updated successfully!");
  };

  const handleOpenDeleteCategory = (cat) => {
    setDeleteTarget({ type: "category", data: cat });
    setIsDeleteModalOpen(true);
  };

  const handleAddCategory = (newCat) => {
    setCategories((prev) => [...prev, newCat]);
    setIsAddCategoryOpen(false);
    showNotification(`Category ${newCat.id} added successfully!`);
  };

  // --- Handlers for Sub Category ---
  const handleOpenEditSubCategory = (subCat) => {
    setSubCategoryToEdit(subCat);
    setIsEditSubCategoryOpen(true);
  };

  const handleSaveEditSubCategory = (updatedData) => {
    if (!activeCategory) return;

    const updatedSubCategories = (activeCategory.subCategories || []).map(
      (sub) =>
        sub.id === subCategoryToEdit.id
          ? { ...sub, id: updatedData.id, name: updatedData.name }
          : sub
    );

    const updatedParent = {
      ...activeCategory,
      subCategories: updatedSubCategories,
    };

    setActiveCategory(updatedParent);
    setCategories((prev) =>
      prev.map((cat) => (cat.id === activeCategory.id ? updatedParent : cat))
    );

    setIsEditSubCategoryOpen(false);
    setSubCategoryToEdit(null);
    showNotification("Sub-category updated successfully!");
  };

  const handleOpenDeleteSubCategory = (subCat) => {
    setDeleteTarget({ type: "subcategory", data: subCat });
    setIsDeleteModalOpen(true);
  };

  const handleAddSubCategory = (newSubCat) => {
    if (!activeCategory) return;

    const updatedSubCategories = [
      ...(activeCategory.subCategories || []),
      newSubCat,
    ];

    const updatedParent = {
      ...activeCategory,
      subCategories: updatedSubCategories,
    };

    setActiveCategory(updatedParent);
    setCategories((prev) =>
      prev.map((cat) => (cat.id === activeCategory.id ? updatedParent : cat))
    );

    setIsAddSubCategoryOpen(false);
    showNotification(`Sub-category ${newSubCat.id} added successfully!`);
  };

  // --- Confirm Delete Handler ---
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === "category") {
      const targetId = deleteTarget.data.id;
      setCategories((prev) => prev.filter((c) => c.id !== targetId));
      if (activeCategory && activeCategory.id === targetId) {
        setActiveCategory(null);
      }
      showNotification("Category deleted successfully!");
    } else if (deleteTarget.type === "subcategory") {
      const subTargetId = deleteTarget.data.id;
      if (activeCategory) {
        const updatedSubs = (activeCategory.subCategories || []).filter(
          (s) => s.id !== subTargetId
        );
        const updatedParent = {
          ...activeCategory,
          subCategories: updatedSubs,
        };
        setActiveCategory(updatedParent);
        setCategories((prev) =>
          prev.map((cat) =>
            cat.id === activeCategory.id ? updatedParent : cat
          )
        );
      }
      showNotification("Sub-category deleted successfully!");
    }

    setIsDeleteModalOpen(false);
    setDeleteTarget(null);
  };

  // Compute next suggested IDs
  const nextCategoryId = `CAT${String(categories.length + 4).padStart(3, "0")}`;
  const nextSubCategoryId = activeCategory
    ? `${activeCategory.id}#${(activeCategory.subCategories?.length || 0) + 1}`
    : "CAT004#1";

  return (
    <div className="AdminCategory-main-wrapper">
      {/* Direction Bar matching Figma */}
      <div className="AdminCategory-direction-bar">
        <span
          className="breadcrumb-parent"
          onClick={handleBackToCategories}
        >
          Home
        </span>
        <span>&gt;</span>
        <span
          className={activeCategory ? "breadcrumb-parent" : "breadcrumb-current"}
          onClick={handleBackToCategories}
        >
          Category List
        </span>
        {activeCategory && (
          <>
            <span>&gt;</span>
            <span className="breadcrumb-current">
              {activeCategory.parentName}
            </span>
          </>
        )}
      </div>

      <div className="AdminCategory-content-container">
        {/* Toast Notification */}
        {notification && (
          <div className="fixed top-14 right-6 z-60 animate-toast">
            <div className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium">
              <span>✓</span>
              <span>{notification.message}</span>
            </div>
          </div>
        )}

        {/* Views */}
        {!activeCategory ? (
          /* Main Category View (Image 1) */
          <CategoryListTable
            categories={categories}
            parentOptions={parentOptions}
            onSelectCategory={handleSelectCategory}
            onEditCategory={handleOpenEditCategory}
            onDeleteCategory={handleOpenDeleteCategory}
            onAddCategory={() => setIsAddCategoryOpen(true)}
          />
        ) : (
          /* Sub Category View (Image 4) */
          <SubCategoryListTable
            parentCategory={activeCategory}
            onBack={handleBackToCategories}
            onEditSubCategory={handleOpenEditSubCategory}
            onDeleteSubCategory={handleOpenDeleteSubCategory}
            onAddSubCategory={() => setIsAddSubCategoryOpen(true)}
          />
        )}
      </div>

      {/* Edit Category Modal (Image 2) */}
      <EditCategoryModal
        isOpen={isEditCategoryOpen}
        onClose={() => {
          setIsEditCategoryOpen(false);
          setCategoryToEdit(null);
        }}
        category={categoryToEdit}
        parentOptions={parentOptions}
        onSave={handleSaveEditCategory}
      />

      {/* Edit Sub Category Modal (Image 5) */}
      <EditSubCategoryModal
        isOpen={isEditSubCategoryOpen}
        onClose={() => {
          setIsEditSubCategoryOpen(false);
          setSubCategoryToEdit(null);
        }}
        parentCategoryName={activeCategory?.parentName || "IT Help Desk"}
        subCategory={subCategoryToEdit}
        subCategoryOptions={defaultSubCategoryNameOptions}
        onSave={handleSaveEditSubCategory}
      />

      {/* Delete Confirmation Modal (Image 3) */}
      <DeleteCategoryModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
        title={
          deleteTarget?.type === "subcategory"
            ? "Delete Category?"
            : "Delete Category?"
        }
        message={
          deleteTarget?.type === "subcategory"
            ? "Are you sure you want to delete this category? This action cannot be undone."
            : "Are you sure you want to delete this category? This action cannot be undone."
        }
      />

      {/* Add Category Modal */}
      <AddCategoryModal
        isOpen={isAddCategoryOpen}
        onClose={() => setIsAddCategoryOpen(false)}
        parentOptions={parentOptions}
        onAdd={handleAddCategory}
        suggestedId={nextCategoryId}
      />

      {/* Add Sub Category Modal */}
      <AddSubCategoryModal
        isOpen={isAddSubCategoryOpen}
        onClose={() => setIsAddSubCategoryOpen(false)}
        parentCategoryName={activeCategory?.parentName || "IT Help Desk"}
        onAdd={handleAddSubCategory}
        suggestedId={nextSubCategoryId}
        options={defaultSubCategoryNameOptions}
      />
    </div>
  );
};

export default AdminCategory;
