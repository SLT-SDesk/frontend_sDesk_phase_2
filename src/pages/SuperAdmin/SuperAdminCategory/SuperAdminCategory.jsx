import React, { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    CategoryContainer,
    DirectionBar,
    BreadcrumbLink,
    CardContainer,
} from "./SuperAdminCategoryStyles";

// Child components
import CategoryTitleBar from "./components/CategoryTitleBar";
import CategoryControls from "./components/CategoryControls";
import SubCategoryTable from "./components/SubCategoryTable";
import ParentCategoryTable from "./components/ParentCategoryTable";
import CategoryFooter from "./components/CategoryFooter";
import SubCategoryModal from "./components/SubCategoryModal";
import EditCategoryModal from "./components/EditCategoryModal";
import DeleteCategoryModal from "./components/DeleteCategoryModal";
import ParentCategoryDeleteErrorModal from "./components/ParentCategoryDeleteErrorModal";

// Redux actions
import {
    fetchMainCategoriesRequest,
    fetchSubCategoriesByMainCategoryIdRequest,
    createSubCategoryRequest,
    updateSubCategoryRequest,
    deleteSubCategoryRequest,
    updateMainCategoryRequest,
    deleteMainCategoryRequest,
} from "../../../redux/categories/categorySlice";

/**
 * SuperAdminCategory - Parent Component (API-connected)
 * Coordinates Redux state, filtering, and props passing to child components.
 */
const SuperAdminCategory = () => {
    const dispatch = useDispatch();

    // ── Redux state ────────────────────────────────────────────────────────────
    const mainCategories = useSelector((state) => state.categories.mainCategories);
    const mainCategoriesLoading = useSelector((state) => state.categories.loading);
    const subCategories = useSelector((state) => state.categories.subCategories);
    const subCategoriesLoading = useSelector((state) => state.categories.subCategoriesLoading);
    const subCategoriesError = useSelector((state) => state.categories.subCategoriesError);
    const createSubCategorySuccess = useSelector((state) => state.categories.createSubCategorySuccess);
    const createSubCategoryError = useSelector((state) => state.categories.createSubCategoryError);
    const updateSubCategorySuccess = useSelector((state) => state.categories.updateSubCategorySuccess);
    const updateSubCategoryError = useSelector((state) => state.categories.updateSubCategoryError);
    const deleteSubCategoryError = useSelector((state) => state.categories.deleteSubCategoryError);
    const updateMainCategoryError = useSelector((state) => state.categories.updateMainCategoryError);
    const deleteMainCategoryError = useSelector((state) => state.categories.deleteMainCategoryError);

    // ── Local UI state ─────────────────────────────────────────────────────────
    const [selectedParentId, setSelectedParentId] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusMessage, setStatusMessage] = useState(null); // { text, type: 'success'|'error' }

    // Subcategory Add/Edit modal
    const [isSubCategoryModalOpen, setIsSubCategoryModalOpen] = useState(false);
    const [editingSubCategory, setEditingSubCategory] = useState(null);

    // Parent category modals
    const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] = useState(false);
    const [isDeleteErrorModalOpen, setIsDeleteErrorModalOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);

    // ── On mount: fetch main categories ───────────────────────────────────────
    useEffect(() => {
        dispatch(fetchMainCategoriesRequest());
    }, [dispatch]);

    // ── When selectedParentId changes: fetch its sub categories ───────────────
    useEffect(() => {
        if (selectedParentId) {
            dispatch(fetchSubCategoriesByMainCategoryIdRequest(selectedParentId));
        }
    }, [dispatch, selectedParentId]);

    // ── React to Redux async results (show toast-style status) ────────────────
    useEffect(() => {
        const err =
            subCategoriesError ||
            createSubCategoryError ||
            updateSubCategoryError ||
            deleteSubCategoryError ||
            updateMainCategoryError ||
            deleteMainCategoryError;
        if (err) {
            const msg = err === "DUPLICATE_NAME"
                ? "A category with that name already exists."
                : err;
            showStatus(msg, "error");
        }
    }, [
        subCategoriesError,
        createSubCategoryError,
        updateSubCategoryError,
        deleteSubCategoryError,
        updateMainCategoryError,
        deleteMainCategoryError,
    ]);

    // ── Helpers ────────────────────────────────────────────────────────────────
    const showStatus = (text, type = "success") => {
        setStatusMessage({ text, type });
        setTimeout(() => setStatusMessage(null), 3500);
    };

    // Current selected parent object
    const currentParent = useMemo(
        () => mainCategories.find((c) => c.id === selectedParentId) || null,
        [mainCategories, selectedParentId]
    );

    const isSubCategoryView = Boolean(currentParent);

    // Filtered subcategories (client-side search over the Redux list)
    const displayedSubCategories = useMemo(() => {
        if (!currentParent) return [];
        if (!searchQuery.trim()) return subCategories;
        const q = searchQuery.toLowerCase().trim();
        return subCategories.filter(
            (item) =>
                (item.category_code || "").toLowerCase().includes(q) ||
                item.name.toLowerCase().includes(q)
        );
    }, [currentParent, subCategories, searchQuery]);

    // Filtered parent categories (client-side search)
    const displayedParentCategories = useMemo(() => {
        if (!searchQuery.trim()) return mainCategories;
        const q = searchQuery.toLowerCase().trim();
        return mainCategories.filter(
            (cat) =>
                (cat.category_code || "").toLowerCase().includes(q) ||
                cat.name.toLowerCase().includes(q)
        );
    }, [mainCategories, searchQuery]);

    // Dropdown options for the CategoryControls filter
    const dropdownOptions = useMemo(
        () => [{ id: "ALL", name: "All Categories" }, ...mainCategories],
        [mainCategories]
    );

    // ── Handlers ───────────────────────────────────────────────────────────────

    const handleDropdownChange = (selectedName) => {
        if (selectedName === "All Categories" || selectedName === "ALL") {
            setSelectedParentId(null);
        } else {
            const found = mainCategories.find(
                (p) => p.name === selectedName || p.id === selectedName
            );
            if (found) setSelectedParentId(found.id);
        }
        setSearchQuery("");
    };

    const handleSelectParentRow = (parentCategory) => {
        setSelectedParentId(parentCategory.id);
        setSearchQuery("");
    };

    const handleBackToAllCategories = () => {
        setSelectedParentId(null);
        setSearchQuery("");
    };

    // ── SubCategory Modal handlers ─────────────────────────────────────────────

    const handleAddClick = () => {
        setEditingSubCategory(null);
        setIsSubCategoryModalOpen(true);
    };

    const handleEditSubCategoryClick = (subCategory) => {
        setEditingSubCategory(subCategory);
        setIsSubCategoryModalOpen(true);
    };

    const handleDeleteSubCategoryClick = (subCategory) => {
        if (!currentParent) return;
        const confirmed = window.confirm(
            `Delete sub category "${subCategory.name}"? This cannot be undone.`
        );
        if (!confirmed) return;
        dispatch(
            deleteSubCategoryRequest({
                id: subCategory.id,
                mainCategoryId: currentParent.id,
            })
        );
        showStatus(`Sub category "${subCategory.name}" deleted.`);
    };

    /** Called by SubCategoryModal on Save (add or edit) */
    const handleSaveSubCategory = ({ name }) => {
        if (!currentParent) return;

        if (editingSubCategory) {
            // Edit mode
            dispatch(
                updateSubCategoryRequest({
                    id: editingSubCategory.id,
                    name,
                    mainCategoryId: currentParent.id,
                })
            );
            showStatus(`Sub category updated successfully.`);
        } else {
            // Add mode
            dispatch(
                createSubCategoryRequest({
                    name,
                    mainCategoryId: currentParent.id,
                })
            );
            showStatus(`Sub category "${name}" created.`);
        }
    };

    // ── Parent Category Modal handlers ─────────────────────────────────────────

    const handleOpenEditCategory = (category) => {
        setEditingCategory(category);
        setIsEditCategoryModalOpen(true);
    };

    const handleSaveEditedCategory = (updatedCat) => {
        dispatch(
            updateMainCategoryRequest({
                id: updatedCat.id || editingCategory?.id,
                name: updatedCat.name,
            })
        );
        showStatus(`Category "${updatedCat.name}" updated.`);
    };

    const handleOpenDeleteCategory = (category) => {
        setCategoryToDelete(category);
        setIsDeleteCategoryModalOpen(true);
    };

    /** Step 2 from DeleteCategoryModal – attempt the API delete */
    const handleConfirmDeleteCategory = (category) => {
        setIsDeleteCategoryModalOpen(false);
        dispatch(deleteMainCategoryRequest(category.id));
        // If the backend returns an error (e.g. has sub-categories), show error modal
        // We use a short delay so the saga has time to dispatch failure if any
        setTimeout(() => {
            if (deleteMainCategoryError) {
                setIsDeleteErrorModalOpen(true);
            }
        }, 800);
    };

    // ── Parent category names for EditCategoryModal dropdown ───────────────────
    const parentCategoryNames = useMemo(
        () => mainCategories.map((c) => c.name),
        [mainCategories]
    );

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <CategoryContainer>
            {/* Status toast */}
            {statusMessage && (
                <div
                    style={{
                        position: "fixed",
                        top: 20,
                        right: 24,
                        zIndex: 9999,
                        padding: "10px 20px",
                        borderRadius: 8,
                        fontWeight: 500,
                        fontSize: 14,
                        background: statusMessage.type === "error" ? "#fef2f2" : "#f0fdf4",
                        color: statusMessage.type === "error" ? "#dc2626" : "#16a34a",
                        border: `1px solid ${statusMessage.type === "error" ? "#fca5a5" : "#86efac"}`,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                >
                    {statusMessage.text}
                </div>
            )}

            {/* Direction Bar / Breadcrumbs */}
            <DirectionBar>
                Home {"> "}
                <BreadcrumbLink
                    $clickable={isSubCategoryView}
                    $active={!isSubCategoryView}
                    onClick={isSubCategoryView ? handleBackToAllCategories : undefined}
                >
                    Category List
                </BreadcrumbLink>
                {isSubCategoryView && (
                    <>
                        {" > "}
                        <strong>{currentParent.name}</strong>
                    </>
                )}
            </DirectionBar>

            {/* Main Card */}
            <CardContainer>
                {/* Title Bar */}
                <CategoryTitleBar
                    title={
                        isSubCategoryView
                            ? `${currentParent.name} > Sub Category`
                            : "Category List"
                    }
                    buttonLabel={isSubCategoryView ? "+ Add Sub Category" : "+ Add Category"}
                    onButtonClick={handleAddClick}
                    showBack={isSubCategoryView}
                    onBackClick={handleBackToAllCategories}
                />

                {/* Controls (Dropdown & Search) */}
                <CategoryControls
                    parentCategories={dropdownOptions}
                    selectedParent={currentParent ? currentParent.name : "All Categories"}
                    onParentChange={handleDropdownChange}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    showParentFilter={true}
                />

                {/* Table */}
                {isSubCategoryView ? (
                    <SubCategoryTable
                        items={displayedSubCategories}
                        loading={subCategoriesLoading}
                        onEdit={handleEditSubCategoryClick}
                        onDelete={handleDeleteSubCategoryClick}
                    />
                ) : (
                    <ParentCategoryTable
                        items={displayedParentCategories}
                        loading={mainCategoriesLoading}
                        onSelectParent={handleSelectParentRow}
                        onEdit={handleOpenEditCategory}
                        onDelete={handleOpenDeleteCategory}
                    />
                )}

                {/* Footer */}
                <CategoryFooter
                    currentCount={
                        isSubCategoryView
                            ? displayedSubCategories.length
                            : displayedParentCategories.length
                    }
                    totalCount={
                        isSubCategoryView
                            ? subCategories.length
                            : mainCategories.length
                    }
                    itemType="categories"
                />
            </CardContainer>

            {/* SubCategory Add / Edit Modal */}
            <SubCategoryModal
                isOpen={isSubCategoryModalOpen}
                onClose={() => setIsSubCategoryModalOpen(false)}
                onSave={handleSaveSubCategory}
                parentCategoryName={currentParent ? currentParent.name : ""}
                initialData={editingSubCategory}
            />

            {/* Edit Parent Category Modal */}
            <EditCategoryModal
                isOpen={isEditCategoryModalOpen}
                onClose={() => setIsEditCategoryModalOpen(false)}
                onSave={handleSaveEditedCategory}
                category={editingCategory}
                parentOptions={parentCategoryNames}
            />

            {/* Delete Parent Category Confirmation Modal */}
            <DeleteCategoryModal
                isOpen={isDeleteCategoryModalOpen}
                onClose={() => setIsDeleteCategoryModalOpen(false)}
                onConfirm={handleConfirmDeleteCategory}
                category={categoryToDelete}
            />

            {/* Delete Unsuccessful Modal (backend rejected delete) */}
            <ParentCategoryDeleteErrorModal
                isOpen={isDeleteErrorModalOpen}
                onClose={() => setIsDeleteErrorModalOpen(false)}
                title="Parent Category Delete Unsuccessful"
                message="The Parent Category could not be deleted. It may still have sub categories linked to it."
            />
        </CategoryContainer>
    );
};

export default SuperAdminCategory;
