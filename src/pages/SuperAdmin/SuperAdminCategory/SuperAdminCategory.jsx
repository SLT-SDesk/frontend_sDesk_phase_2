import React, { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    CategoryContainer,
    DirectionBar,
    BreadcrumbLink,
    CardContainer,
} from "./SuperAdminCategoryStyles";
import {
    fetchMainCategoriesRequest,
    fetchSubCategoriesByMainCategoryIdRequest,
    fetchCategoryItemsRequest,
    deleteCategoryItemRequest,
    createCategoryItemRequest,
    updateCategoryItemRequest,
    createCategoryRequest,
    createSubCategoryRequest,
    updateSubCategoryRequest,
    deleteSubCategoryRequest,
    updateMainCategoryRequest,
    deleteMainCategoryRequest,
} from "../../../redux/categories/categorySlice";

// Child components
import CategoryTitleBar from "./components/CategoryTitleBar";
import CategoryControls from "./components/CategoryControls";
import SubCategoryTable from "./components/SubCategoryTable";
import ParentCategoryTable from "./components/ParentCategoryTable";
import CategoryItemTable from "./components/CategoryItemTable";
import CategoryFooter from "./components/CategoryFooter";
import SubCategoryModal from "./components/SubCategoryModal";
import EditCategoryModal from "./components/EditCategoryModal";
import AddParentCategoryModal from "./components/AddParentCategoryModal";
import DeleteCategoryModal from "./components/DeleteCategoryModal";
import ParentCategoryDeleteErrorModal from "./components/ParentCategoryDeleteErrorModal";
import EditSubCategoryModal from "./components/EditSubCategoryModal";
import DeleteSubCategoryModal from "./components/DeleteSubCategoryModal";
import AddSubCategoryModal from "./components/AddSubCategoryModal";
import EditCategoryItemModal from "./components/EditCategoryItemModal";
import DeleteCategoryItemModal from "./components/DeleteCategoryItemModal";
import AddCategoryItemModal from "./components/AddCategoryItemModal";

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
    const categoryItems = useSelector((state) => state.categories.categoryItems || []);
    const createSubCategorySuccess = useSelector((state) => state.categories.createSubCategorySuccess);
    const createSubCategoryError = useSelector((state) => state.categories.createSubCategoryError);
    const updateSubCategorySuccess = useSelector((state) => state.categories.updateSubCategorySuccess);
    const updateSubCategoryError = useSelector((state) => state.categories.updateSubCategoryError);
    const deleteSubCategoryError = useSelector((state) => state.categories.deleteSubCategoryError);
    const updateMainCategoryError = useSelector((state) => state.categories.updateMainCategoryError);
    const deleteMainCategoryError = useSelector((state) => state.categories.deleteMainCategoryError);
    const createMainCategorySuccess = useSelector((state) => state.categories.createMainCategorySuccess);
    const createMainCategoryError = useSelector((state) => state.categories.createMainCategoryError);
    const createCategoryItemSuccess = useSelector((state) => state.categories.createCategoryItemSuccess);
    const createCategoryItemError = useSelector((state) => state.categories.createCategoryItemError);

    // ── Local UI state ─────────────────────────────────────────────────────────
    const [selectedParentId, setSelectedParentId] = useState(null);
    const [selectedSubCategoryId, setSelectedSubCategoryId] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusMessage, setStatusMessage] = useState(null); // { text, type: 'success'|'error' }

    // Subcategory modal
    const [isSubCategoryModalOpen, setIsSubCategoryModalOpen] = useState(false);
    const [editingSubCategory, setEditingSubCategory] = useState(null);

    // Category item modals
    const [isAddCategoryItemModalOpen, setIsAddCategoryItemModalOpen] = useState(false);
    const [isEditCategoryItemModalOpen, setIsEditCategoryItemModalOpen] = useState(false);
    const [editingCategoryItem, setEditingCategoryItem] = useState(null);
    const [isDeleteCategoryItemModalOpen, setIsDeleteCategoryItemModalOpen] = useState(false);
    const [categoryItemToDelete, setCategoryItemToDelete] = useState(null);
    const [isDeleteCategoryItemErrorModalOpen, setIsDeleteCategoryItemErrorModalOpen] = useState(false);

    // Sub category modals (legacy)
    const [isEditSubCategoryModalOpen, setIsEditSubCategoryModalOpen] = useState(false);
    const [editingSubCategoryItem, setEditingSubCategoryItem] = useState(null);
    const [isDeleteSubCategoryModalOpen, setIsDeleteSubCategoryModalOpen] = useState(false);
    const [subCategoryToDelete, setSubCategoryToDelete] = useState(null);
    const [isDeleteSubCategoryErrorModalOpen, setIsDeleteSubCategoryErrorModalOpen] = useState(false);

    // Parent category modals
    const [isAddParentCategoryModalOpen, setIsAddParentCategoryModalOpen] = useState(false);
    const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] = useState(false);
    const [isDeleteErrorModalOpen, setIsDeleteErrorModalOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);

    // ── On mount: fetch main categories and all category items ────────────────
    useEffect(() => {
        dispatch(fetchMainCategoriesRequest());
        dispatch(fetchCategoryItemsRequest());
    }, [dispatch]);

    // ── When selectedParentId changes: fetch its sub categories ───────────────
    useEffect(() => {
        if (selectedParentId) {
            dispatch(fetchSubCategoriesByMainCategoryIdRequest(selectedParentId));
        }
    }, [dispatch, selectedParentId]);

    // ── When selectedSubCategoryId changes: refresh category items ────────────
    useEffect(() => {
        if (selectedSubCategoryId) {
            dispatch(fetchCategoryItemsRequest());
        }
    }, [dispatch, selectedSubCategoryId]);

    // ── Re-fetch main categories after successful creation ────────────────────
    useEffect(() => {
        if (createMainCategorySuccess) {
            dispatch(fetchMainCategoriesRequest());
        }
    }, [createMainCategorySuccess, dispatch]);

    // ── Re-fetch subcategories after successful subcategory creation ───────────
    useEffect(() => {
        if (createSubCategorySuccess && selectedParentId) {
            dispatch(fetchSubCategoriesByMainCategoryIdRequest(selectedParentId));
        }
    }, [createSubCategorySuccess, dispatch, selectedParentId]);

    // ── Re-fetch category items after successful category item creation ───────
    useEffect(() => {
        if (createCategoryItemSuccess) {
            dispatch(fetchCategoryItemsRequest());
        }
    }, [createCategoryItemSuccess, dispatch]);

    // ── React to Redux async results (show toast-style status) ────────────────
    useEffect(() => {
        const err =
            subCategoriesError ||
            createSubCategoryError ||
            updateSubCategoryError ||
            deleteSubCategoryError ||
            updateMainCategoryError ||
            deleteMainCategoryError ||
            createMainCategoryError ||
            createCategoryItemError;
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
        createMainCategoryError,
        createCategoryItemError,
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

    // Current selected subcategory object
    const currentSubCategory = useMemo(() => {
        if (!currentParent || !selectedSubCategoryId) return null;
        return subCategories.find((s) => s.id === selectedSubCategoryId) || null;
    }, [currentParent, subCategories, selectedSubCategoryId]);

    const isSubCategoryView = Boolean(currentParent) && !currentSubCategory;
    const isCategoryItemView = Boolean(currentParent) && Boolean(currentSubCategory);

    // Formatted current parent category code (e.g. CAT004 or CAT001)
    const currentParentCode = useMemo(() => {
        if (!currentParent) return "";
        return (currentParent.category_code || currentParent.id || "").replace(/^MAIN/i, "CAT");
    }, [currentParent]);

    // Formatted current subcategory code (e.g. CAT004#1)
    const currentSubCategoryCode = useMemo(() => {
        if (!currentSubCategory || !currentParent) return "";
        if (currentSubCategory.category_code && currentSubCategory.category_code.includes("#")) {
            return currentSubCategory.category_code;
        }
        const idx = subCategories.findIndex((s) => s.id === currentSubCategory.id);
        return `${currentParentCode}#${idx >= 0 ? idx + 1 : 1}`;
    }, [currentSubCategory, currentParent, currentParentCode, subCategories]);

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

    // Filtered Category Items based on selected subcategory (from Redux)
    const displayedCategoryItems = useMemo(() => {
        if (!currentSubCategory) return [];
        const list = categoryItems.filter(
            (item) => item.subCategory?.id === currentSubCategory.id
        );
        if (!searchQuery.trim()) return list;
        const query = searchQuery.toLowerCase().trim();
        return list.filter(
            (item) =>
                (item.category_code || item.id || "").toLowerCase().includes(query) ||
                item.name.toLowerCase().includes(query)
        );
    }, [currentSubCategory, categoryItems, searchQuery]);

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
        setSelectedSubCategoryId(null);
        setSearchQuery("");
    };

    // Handler: Selecting SubCategory by clicking row (drills to category items)
    const handleSelectSubCategoryRow = (subCategory) => {
        setSelectedSubCategoryId(subCategory.id);
        setSearchQuery("");
    };

    // Handler: Return to All Categories
    const handleBackToAllCategories = () => {
        setSelectedParentId(null);
        setSelectedSubCategoryId(null);
        setSearchQuery("");
    };

    // Handler: Return to Subcategories view
    const handleBackToSubCategories = () => {
        setSelectedSubCategoryId(null);
        setSearchQuery("");
    };

    // Handler: Add Button Click — opens the correct add modal based on current view
    const handleAddClick = () => {
        if (isCategoryItemView) {
            setIsAddCategoryItemModalOpen(true);
        } else if (isSubCategoryView) {
            setEditingSubCategory(null);
            setIsSubCategoryModalOpen(true);
        } else {
            setIsAddParentCategoryModalOpen(true);
        }
    };

    // ── SubCategory Modal handlers ─────────────────────────────────────────────

    const handleEditSubCategoryClick = (subCategory, displayId) => {
        setEditingSubCategoryItem({ ...subCategory, displayId: displayId || subCategory.displayId });
        setIsEditSubCategoryModalOpen(true);
    };

    const handleDeleteSubCategoryClick = (subCategory) => {
        setSubCategoryToDelete(subCategory);
        setIsDeleteSubCategoryModalOpen(true);
    };

    /** Step 2 from DeleteSubCategoryModal – Sub category cannot be deleted, show error modal */
    const handleConfirmDeleteSubCategory = () => {
        setIsDeleteSubCategoryModalOpen(false);
        setIsDeleteSubCategoryErrorModalOpen(true);
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

    /** Called by EditSubCategoryModal on Save */
    const handleSaveEditedSubCategory = ({ id, name }) => {
        if (!currentParent) return;
        dispatch(
            updateSubCategoryRequest({
                id,
                name,
                mainCategoryId: currentParent.id,
            })
        );
        showStatus(`Sub category updated successfully.`);
    };

    // ── Category Item handlers ─────────────────────────────────────────────────

    // handleSaveNewCategoryItem: dispatches the real create action
    const handleSaveNewCategoryItem = ({ name }) => {
        if (!currentSubCategory) return;
        dispatch(
            createCategoryItemRequest({
                name,
                subCategoryId: currentSubCategory.id,
            })
        );
        showStatus(`Category item "${name}" created.`);
    };

    const handleEditCategoryItem = (item, displayId) => {
        setEditingCategoryItem({ ...item, displayId: displayId || item.displayId });
        setIsEditCategoryItemModalOpen(true);
    };

    // handleSaveEditedCategoryItem: dispatches the real update action
    const handleSaveEditedCategoryItem = ({ id, name }) => {
        if (!currentSubCategory) return;
        dispatch(
            updateCategoryItemRequest({
                id,
                name,
                subCategoryId: currentSubCategory.id,
            })
        );
        showStatus(`Category item updated.`);
    };

    const handleDeleteCategoryItem = (item) => {
        setCategoryItemToDelete(item);
        setIsDeleteCategoryItemModalOpen(true);
    };

    /** Step 2 from DeleteCategoryItemModal – Category item cannot be deleted, show error modal */
    const handleConfirmDeleteCategoryItem = () => {
        setIsDeleteCategoryItemModalOpen(false);
        setIsDeleteCategoryItemErrorModalOpen(true);
    };

    // ── Parent Category Modal handlers ─────────────────────────────────────────

    const existingParentCategoryIds = useMemo(() => {
        return (mainCategories || []).map((c) => c.category_code || c.id).filter(Boolean);
    }, [mainCategories]);

    const existingParentCategoryNames = useMemo(() => {
        return (mainCategories || []).map((c) => c.name).filter(Boolean);
    }, [mainCategories]);

    const nextParentCategoryId = useMemo(() => {
        const existingCodes = (mainCategories || []).map((c) => (c.category_code || c.id || ""));
        let maxNum = 0;
        existingCodes.forEach((code) => {
            const match = String(code).match(/\d+/);
            if (match) {
                const num = parseInt(match[0], 10);
                if (!isNaN(num) && num > maxNum) {
                    maxNum = num;
                }
            }
        });
        let nextNum = Math.max(maxNum + 1, (mainCategories || []).length + 1, 1);
        let candidate = `CAT${String(nextNum).padStart(3, "0")}`;
        while (existingCodes.some((code) => {
            const cStr = String(code).trim().toLowerCase();
            return cStr === candidate.toLowerCase() || cStr.replace(/^main/i, "cat") === candidate.toLowerCase();
        })) {
            nextNum += 1;
            candidate = `CAT${String(nextNum).padStart(3, "0")}`;
        }
        return candidate;
    }, [mainCategories]);

    const handleSaveNewParentCategory = ({ category_code, name }) => {
        // Only send { name } — backend auto-generates category_code
        dispatch(createCategoryRequest({ name }));
        showStatus(`Parent category "${name}" created.`);
    };

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

    /** Step 2 from DeleteCategoryModal – Parent category cannot be deleted, show error modal */
    const handleConfirmDeleteCategory = (category) => {
        setIsDeleteCategoryModalOpen(false);
        setIsDeleteErrorModalOpen(true);
    };

    // ── Derived helpers ────────────────────────────────────────────────────────

    const getTitle = () => {
        if (isCategoryItemView) {
            return `${currentParent.name} > ${currentSubCategory.name} > Category Item`;
        }
        if (isSubCategoryView) {
            return `${currentParent.name} > Sub Category`;
        }
        return "Category List";
    };

    const getButtonLabel = () => {
        if (isCategoryItemView) return "+ Add Category Item";
        if (isSubCategoryView) return "+ Add Sub Category";
        return "+ Add Category";
    };

    const getBackHandler = () => {
        if (isCategoryItemView) return handleBackToSubCategories;
        if (isSubCategoryView) return handleBackToAllCategories;
        return undefined;
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
                    $clickable={isSubCategoryView || isCategoryItemView}
                    $active={!isSubCategoryView && !isCategoryItemView}
                    onClick={(isSubCategoryView || isCategoryItemView) ? handleBackToAllCategories : undefined}
                >
                    Category List
                </BreadcrumbLink>
                {(isSubCategoryView || isCategoryItemView) && (
                    <>
                        {" > "}
                        <BreadcrumbLink
                            $clickable={isCategoryItemView}
                            $active={isSubCategoryView}
                            onClick={isCategoryItemView ? handleBackToSubCategories : undefined}
                        >
                            {currentParent.name}
                        </BreadcrumbLink>
                    </>
                )}
                {isCategoryItemView && (
                    <>
                        {" > "}
                        <strong>{currentSubCategory.name}</strong>
                    </>
                )}
            </DirectionBar>

            {/* Main Card */}
            <CardContainer>
                {/* Title Bar */}
                <CategoryTitleBar
                    title={getTitle()}
                    buttonLabel={getButtonLabel()}
                    onButtonClick={handleAddClick}
                    showBack={isSubCategoryView || isCategoryItemView}
                    onBackClick={getBackHandler()}
                />

                {/* Controls (Dropdown & Search) */}
                <CategoryControls
                    parentCategories={dropdownOptions}
                    selectedParent={currentParent ? currentParent.name : "All Categories"}
                    onParentChange={handleDropdownChange}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    showParentFilter={!isCategoryItemView}
                />

                {/* Table */}
                {isCategoryItemView ? (
                    <CategoryItemTable
                        items={displayedCategoryItems}
                        subCategoryCode={currentSubCategoryCode}
                        onEdit={handleEditCategoryItem}
                        onDelete={handleDeleteCategoryItem}
                    />
                ) : isSubCategoryView ? (
                    <SubCategoryTable
                        items={displayedSubCategories}
                        parentCategoryCode={currentParentCode}
                        loading={subCategoriesLoading}
                        onSelectSubCategory={handleSelectSubCategoryRow}
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
                        isCategoryItemView
                            ? displayedCategoryItems.length
                            : isSubCategoryView
                                ? displayedSubCategories.length
                                : displayedParentCategories.length
                    }
                    totalCount={
                        isCategoryItemView
                            ? categoryItems.filter((item) => item.subCategory?.id === currentSubCategory?.id).length
                            : isSubCategoryView
                                ? subCategories.length
                                : mainCategories.length
                    }
                    itemType={isCategoryItemView ? "category items" : "categories"}
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

            {/* Add Sub Category Modal (legacy) */}
            <AddSubCategoryModal
                isOpen={false}
                onClose={() => { }}
                onSave={handleSaveSubCategory}
                parentCategoryName={currentParent ? currentParent.name : ""}
            />

            {/* Add Category Item Modal */}
            <AddCategoryItemModal
                isOpen={isAddCategoryItemModalOpen}
                onClose={() => setIsAddCategoryItemModalOpen(false)}
                onSave={handleSaveNewCategoryItem}
                parentCategoryName={currentParent ? currentParent.name : ""}
                subCategoryName={currentSubCategory ? currentSubCategory.name : ""}
            />

            {/* Edit Category Item Modal */}
            <EditCategoryItemModal
                isOpen={isEditCategoryItemModalOpen}
                onClose={() => { setIsEditCategoryItemModalOpen(false); setEditingCategoryItem(null); }}
                onSave={handleSaveEditedCategoryItem}
                categoryItem={editingCategoryItem}
                parentCategoryName={currentParent ? currentParent.name : ""}
                subCategoryName={currentSubCategory ? currentSubCategory.name : ""}
            />

            {/* Delete Category Item Modal */}
            <DeleteCategoryItemModal
                isOpen={isDeleteCategoryItemModalOpen}
                onClose={() => { setIsDeleteCategoryItemModalOpen(false); setCategoryItemToDelete(null); }}
                onConfirm={handleConfirmDeleteCategoryItem}
                categoryItem={categoryItemToDelete}
            />

            {/* Category Item Delete Unsuccessful Modal */}
            <ParentCategoryDeleteErrorModal
                isOpen={isDeleteCategoryItemErrorModalOpen}
                onClose={() => { setIsDeleteCategoryItemErrorModalOpen(false); setCategoryItemToDelete(null); }}
                title="Category Item Delete Unsuccessfully"
                message="The Category Item could not be deleted."
            />

            {/* Edit SubCategory Modal (legacy) */}
            <EditSubCategoryModal
                isOpen={isEditSubCategoryModalOpen}
                onClose={() => { setIsEditSubCategoryModalOpen(false); setEditingSubCategoryItem(null); }}
                onSave={handleSaveEditedSubCategory}
                subCategory={editingSubCategoryItem}
                parentCategoryName={currentParent ? currentParent.name : ""}
                subCategoryOptions={subCategories}
            />

            {/* Delete SubCategory Modal */}
            <DeleteSubCategoryModal
                isOpen={isDeleteSubCategoryModalOpen}
                onClose={() => { setIsDeleteSubCategoryModalOpen(false); setSubCategoryToDelete(null); }}
                onConfirm={handleConfirmDeleteSubCategory}
                subCategory={subCategoryToDelete}
            />

            {/* Sub Category Delete Unsuccessful Modal */}
            <ParentCategoryDeleteErrorModal
                isOpen={isDeleteSubCategoryErrorModalOpen}
                onClose={() => { setIsDeleteSubCategoryErrorModalOpen(false); setSubCategoryToDelete(null); }}
                title="Sub Category Delete Unsuccessfully"
                message="The Sub Category could not be deleted."
            />

            {/* Add Parent Category Modal */}
            <AddParentCategoryModal
                isOpen={isAddParentCategoryModalOpen}
                onClose={() => setIsAddParentCategoryModalOpen(false)}
                onSave={handleSaveNewParentCategory}
                defaultCategoryId={nextParentCategoryId}
                existingCategoryIds={existingParentCategoryIds}
                existingCategoryNames={existingParentCategoryNames}
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
                onClose={() => {
                    setIsDeleteCategoryModalOpen(false);
                    setCategoryToDelete(null);
                }}
                onConfirm={handleConfirmDeleteCategory}
                category={categoryToDelete}
            />

            {/* Parent Category Delete Unsuccessfully Modal */}
            <ParentCategoryDeleteErrorModal
                isOpen={isDeleteErrorModalOpen}
                onClose={() => {
                    setIsDeleteErrorModalOpen(false);
                    setCategoryToDelete(null);
                }}
                title="Parent Category Delete Unsuccessfully"
                message="The Parent Category could not be deleted."
            />
        </CategoryContainer>
    );
};

export default SuperAdminCategory;
