import React, { useState, useMemo } from "react";
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
import CategoryItemTable from "./components/CategoryItemTable";
import CategoryFooter from "./components/CategoryFooter";
import SubCategoryModal from "./components/SubCategoryModal";
import EditCategoryModal from "./components/EditCategoryModal";
import DeleteCategoryModal from "./components/DeleteCategoryModal";
import ParentCategoryDeleteErrorModal from "./components/ParentCategoryDeleteErrorModal";
import EditSubCategoryModal from "./components/EditSubCategoryModal";
import DeleteSubCategoryModal from "./components/DeleteSubCategoryModal";
import AddSubCategoryModal from "./components/AddSubCategoryModal";
import EditCategoryItemModal from "./components/EditCategoryItemModal";
import DeleteCategoryItemModal from "./components/DeleteCategoryItemModal";
import AddCategoryItemModal from "./components/AddCategoryItemModal";

// Initial mock dataset matching user's design & dataset
const INITIAL_PARENT_CATEGORIES = [
    { id: "CAT004", name: "IT Help Desk" },
    { id: "CAT005", name: "Facilities" },
    { id: "CAT006", name: "HR Services" },
    { id: "CAT007", name: "OLD Categories" },
    { id: "CAT008", name: "OLD Categories" },
    { id: "CAT009", name: "OLD Categories" },
    { id: "CAT010", name: "OLD Categories" },
    { id: "CAT011", name: "OLD Categories" },
    { id: "CAT012", name: "OLD Categories" },
];

const INITIAL_SUBCATEGORIES_MAP = {
    CAT004: [
        { id: "CAT004#1", name: "Email" },
        { id: "CAT004#2", name: "Cashiering" },
        { id: "CAT004#3", name: "Hardware" },
        { id: "CAT004#4", name: "Software" },
        { id: "CAT004#5", name: "Network" },
        { id: "CAT004#6", name: "Password Issues" },
        { id: "CAT004#7", name: "VDI Issues" },
        { id: "CAT004#8", name: "QMS" },
        { id: "CAT004#9", name: "Operating System" },
        { id: "CAT004#10", name: "Security" },
        { id: "CAT004#11", name: "Tier 3 Support" },
    ],
    CAT005: [
        { id: "CAT005#1", name: "Office Cleaning" },
        { id: "CAT005#2", name: "AC Maintenance" },
        { id: "CAT005#3", name: "Water Supply" },
        { id: "CAT005#4", name: "Furniture Repair" },
        { id: "CAT005#5", name: "Pest Control" },
    ],
    CAT006: [
        { id: "CAT006#1", name: "Leave Application" },
        { id: "CAT006#2", name: "Payslip Request" },
        { id: "CAT006#3", name: "ID Card Issuance" },
        { id: "CAT006#4", name: "Onboarding Query" },
        { id: "CAT006#5", name: "Resignation Process" },
    ],
};

const INITIAL_CATEGORY_ITEMS_MAP = {
    "CAT004#1": [
        { id: "CAT004#1/1", name: "E-Mail Not Receiving" },
        { id: "CAT004#1/2", name: "E-Mail Backup Required" },
        { id: "CAT004#1/3", name: "E-Mail Common Account password" },
        { id: "CAT004#1/4", name: "E-Mail Lost" },
        { id: "CAT004#1/5", name: "MailBox Filled" },
        { id: "CAT004#1/6", name: "New Email Account" },
        { id: "CAT004#1/7", name: "Email-TAB/Phone Configuration" },
        { id: "CAT004#1/8", name: "Outlook Patch Update" },
        { id: "CAT004#1/9", name: "Email Not Working" },
    ],
    "CAT004#2": [
        { id: "CAT004#2/1", name: "Cashiering System Login" },
        { id: "CAT004#2/2", name: "Cashiering Hardware Issue" },
        { id: "CAT004#2/3", name: "Cashiering Software Error" },
    ],
    "CAT004#3": [
        { id: "CAT004#3/1", name: "Laptop Issue" },
        { id: "CAT004#3/2", name: "Desktop Issue" },
        { id: "CAT004#3/3", name: "Printer Issue" },
        { id: "CAT004#3/4", name: "Monitor Issue" },
    ],
    "CAT004#4": [
        { id: "CAT004#4/1", name: "Software Installation" },
        { id: "CAT004#4/2", name: "Software Update" },
        { id: "CAT004#4/3", name: "License Issue" },
    ],
    "CAT004#5": [
        { id: "CAT004#5/1", name: "Network Down" },
        { id: "CAT004#5/2", name: "Slow Internet" },
        { id: "CAT004#5/3", name: "Wi-Fi Not Working" },
    ],
};

/**
 * SuperAdminCategory - Parent Component
 * Coordinates state management, filtering, and props passing to child components.
 */
const SuperAdminCategory = () => {
    // Navigation & Category Selection State
    // Default selected parent is "IT Help Desk" to match screenshot directly,
    // or can be switched to any parent category / all categories
    const [parentCategories, setParentCategories] = useState(INITIAL_PARENT_CATEGORIES);
    const [subCategoriesMap, setSubCategoriesMap] = useState(INITIAL_SUBCATEGORIES_MAP);
    const [categoryItemsMap, setCategoryItemsMap] = useState(INITIAL_CATEGORY_ITEMS_MAP);
    const [selectedParentId, setSelectedParentId] = useState(null); // Default: null (shows Category List)
    const [selectedSubCategoryId, setSelectedSubCategoryId] = useState(null); // Tracks 3rd level drill-down
    const [searchQuery, setSearchQuery] = useState("");

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAddSubCategoryModalOpen, setIsAddSubCategoryModalOpen] = useState(false);
    const [isAddCategoryItemModalOpen, setIsAddCategoryItemModalOpen] = useState(false);
    const [isEditCategoryItemModalOpen, setIsEditCategoryItemModalOpen] = useState(false);
    const [editingCategoryItem, setEditingCategoryItem] = useState(null);
    const [isDeleteCategoryItemModalOpen, setIsDeleteCategoryItemModalOpen] = useState(false);
    const [categoryItemToDelete, setCategoryItemToDelete] = useState(null);
    const [isDeleteCategoryItemErrorModalOpen, setIsDeleteCategoryItemErrorModalOpen] = useState(false);
    const [isEditSubCategoryModalOpen, setIsEditSubCategoryModalOpen] = useState(false);
    const [editingSubCategoryItem, setEditingSubCategoryItem] = useState(null);
    const [isDeleteSubCategoryModalOpen, setIsDeleteSubCategoryModalOpen] = useState(false);
    const [subCategoryToDelete, setSubCategoryToDelete] = useState(null);
    const [isDeleteSubCategoryErrorModalOpen, setIsDeleteSubCategoryErrorModalOpen] = useState(false);
    const [editingSubCategory, setEditingSubCategory] = useState(null);
    const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] = useState(false);
    const [isDeleteErrorModalOpen, setIsDeleteErrorModalOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);

    // Current selected parent object
    const currentParent = useMemo(() => {
        return parentCategories.find((c) => c.id === selectedParentId) || null;
    }, [parentCategories, selectedParentId]);

    // Current selected subcategory object
    const currentSubCategory = useMemo(() => {
        if (!currentParent || !selectedSubCategoryId) return null;
        const subList = subCategoriesMap[currentParent.id] || [];
        return subList.find((s) => s.id === selectedSubCategoryId) || null;
    }, [currentParent, subCategoriesMap, selectedSubCategoryId]);

    const isSubCategoryView = Boolean(currentParent) && !currentSubCategory;
    const isCategoryItemView = Boolean(currentParent) && Boolean(currentSubCategory);

    // Filtered Subcategories based on search
    const displayedSubCategories = useMemo(() => {
        if (!currentParent) return [];
        const list = subCategoriesMap[currentParent.id] || [];
        if (!searchQuery.trim()) return list;

        const query = searchQuery.toLowerCase().trim();
        return list.filter(
            (item) =>
                item.id.toLowerCase().includes(query) ||
                item.name.toLowerCase().includes(query)
        );
    }, [currentParent, subCategoriesMap, searchQuery]);

    // Filtered Category Items based on search
    const displayedCategoryItems = useMemo(() => {
        if (!currentSubCategory) return [];
        const list = categoryItemsMap[currentSubCategory.id] || [];
        if (!searchQuery.trim()) return list;

        const query = searchQuery.toLowerCase().trim();
        return list.filter(
            (item) =>
                item.id.toLowerCase().includes(query) ||
                item.name.toLowerCase().includes(query)
        );
    }, [currentSubCategory, categoryItemsMap, searchQuery]);

    // Filtered Parent Categories based on search
    const displayedParentCategories = useMemo(() => {
        if (!searchQuery.trim()) return parentCategories;
        const query = searchQuery.toLowerCase().trim();
        return parentCategories.filter(
            (cat) =>
                cat.id.toLowerCase().includes(query) ||
                cat.name.toLowerCase().includes(query)
        );
    }, [parentCategories, searchQuery]);

    // Dropdown list options for CategoryControls
    const dropdownOptions = useMemo(() => {
        return [
            { id: "ALL", name: "All Categories" },
            ...parentCategories,
        ];
    }, [parentCategories]);

    // Handler: Parent Category Dropdown Selection
    const handleDropdownChange = (selectedName) => {
        if (selectedName === "All Categories" || selectedName === "ALL") {
            setSelectedParentId(null);
        } else {
            const found = parentCategories.find((p) => p.name === selectedName || p.id === selectedName);
            if (found) {
                setSelectedParentId(found.id);
            }
        }
        setSearchQuery("");
    };

    // Handler: Selecting Parent Category by clicking row
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

    // Handler: Open Edit SubCategory Modal
    const handleEditSubCategoryClick = (subCategory) => {
        setEditingSubCategoryItem(subCategory);
        setIsEditSubCategoryModalOpen(true);
    };

    // Handler: Save Edited SubCategory
    const handleSaveEditedSubCategory = ({ id, name }) => {
        if (!currentParent) return;
        setSubCategoriesMap((prev) => {
            const parentList = prev[currentParent.id] || [];
            return {
                ...prev,
                [currentParent.id]: parentList.map((item) =>
                    item.id === (editingSubCategoryItem?.id || id)
                        ? { ...item, name }
                        : item
                ),
            };
        });
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
            setIsAddSubCategoryModalOpen(true);
        } else {
            setEditingSubCategory(null);
            setIsModalOpen(true);
        }
    };

    // Handler: Save New Category Item
    const handleSaveNewCategoryItem = ({ id, name }) => {
        if (!currentSubCategory) return;
        setCategoryItemsMap((prev) => {
            const subList = prev[currentSubCategory.id] || [];
            return {
                ...prev,
                [currentSubCategory.id]: [...subList, { id, name }],
            };
        });
    };

    // Handler: Edit Sub Category Click
    const handleEditClick = (subCategory) => {
        setEditingSubCategory(subCategory);
        setIsModalOpen(true);
    };

    // Handler: Delete Sub Category — opens confirmation modal
    const handleDeleteClick = (subCategory) => {
        setSubCategoryToDelete(subCategory);
        setIsDeleteSubCategoryModalOpen(true);
    };

    // Handler: Confirm Delete Sub Category — shows error modal (matching parent category delete flow)
    const handleConfirmDeleteSubCategory = () => {
        setIsDeleteSubCategoryModalOpen(false);
        setIsDeleteSubCategoryErrorModalOpen(true);
    };

    // Handler: Open Edit Category Item Modal
    const handleEditCategoryItem = (item) => {
        setEditingCategoryItem(item);
        setIsEditCategoryItemModalOpen(true);
    };

    // Handler: Save Edited Category Item
    const handleSaveEditedCategoryItem = ({ id, name }) => {
        if (!currentSubCategory) return;
        setCategoryItemsMap((prev) => {
            const subList = prev[currentSubCategory.id] || [];
            return {
                ...prev,
                [currentSubCategory.id]: subList.map((item) =>
                    item.id === (editingCategoryItem?.id || id)
                        ? { ...item, name }
                        : item
                ),
            };
        });
    };

    // Handler: Open Delete Category Item Modal
    const handleDeleteCategoryItem = (item) => {
        setCategoryItemToDelete(item);
        setIsDeleteCategoryItemModalOpen(true);
    };

    // Handler: Confirm Delete Category Item — shows error modal
    const handleConfirmDeleteCategoryItem = () => {
        setIsDeleteCategoryItemModalOpen(false);
        setIsDeleteCategoryItemErrorModalOpen(true);
    };

    // Handler: Save Modal (Add or Edit)
    const handleSaveSubCategory = ({ id, name }) => {
        if (!currentParent) return;

        setSubCategoriesMap((prev) => {
            const parentList = prev[currentParent.id] || [];
            if (editingSubCategory) {
                // Edit mode
                return {
                    ...prev,
                    [currentParent.id]: parentList.map((item) =>
                        item.id === editingSubCategory.id ? { ...item, id: id || item.id, name } : item
                    ),
                };
            } else {
                // Add mode: generate next id if not provided
                const nextId =
                    id || `${currentParent.id}#${parentList.length + 1}`;
                return {
                    ...prev,
                    [currentParent.id]: [...parentList, { id: nextId, name }],
                };
            }
        });
    };

    // Handler: Open Edit Category Modal
    const handleOpenEditCategory = (category) => {
        setEditingCategory(category);
        setIsEditCategoryModalOpen(true);
    };

    // Handler: Save Edited Category
    const handleSaveEditedCategory = (updatedCat) => {
        setParentCategories((prev) =>
            prev.map((c) =>
                c.id === (editingCategory?.id || updatedCat.id)
                    ? { ...c, id: updatedCat.id, name: updatedCat.name }
                    : c
            )
        );
    };

    // Handler: Open Delete Category Modal (Step 1: Confirmation)
    const handleOpenDeleteCategory = (category) => {
        setCategoryToDelete(category);
        setIsDeleteCategoryModalOpen(true);
    };

    // Handler: Confirm Delete Category (Step 2: Trigger Delete Unsuccessful popup)
    const handleConfirmDeleteCategory = (category) => {
        setIsDeleteCategoryModalOpen(false);
        setIsDeleteErrorModalOpen(true);
    };

    // Determine the current navigation level for rendering
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

    return (
        <CategoryContainer>
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
                {/* Child Component: Title Bar */}
                <CategoryTitleBar
                    title={getTitle()}
                    buttonLabel={getButtonLabel()}
                    onButtonClick={handleAddClick}
                    showBack={isSubCategoryView || isCategoryItemView}
                    onBackClick={getBackHandler()}
                />

                {/* Child Component: Controls (Dropdown & Search) */}
                <CategoryControls
                    parentCategories={dropdownOptions}
                    selectedParent={currentParent ? currentParent.name : "All Categories"}
                    onParentChange={handleDropdownChange}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    showParentFilter={!isCategoryItemView}
                />

                {/* Child Component: Table */}
                {isCategoryItemView ? (
                    <CategoryItemTable
                        items={displayedCategoryItems}
                        onEdit={handleEditCategoryItem}
                        onDelete={handleDeleteCategoryItem}
                    />
                ) : isSubCategoryView ? (
                    <SubCategoryTable
                        items={displayedSubCategories}
                        onSelectSubCategory={handleSelectSubCategoryRow}
                        onEditSubCategory={handleEditSubCategoryClick}
                        onDeleteSubCategory={handleDeleteClick}
                    />
                ) : (
                    <ParentCategoryTable
                        items={displayedParentCategories}
                        onSelectParent={handleSelectParentRow}
                        onEdit={handleOpenEditCategory}
                        onDelete={handleOpenDeleteCategory}
                    />
                )}

                {/* Child Component: Footer */}
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
                            ? (categoryItemsMap[currentSubCategory.id] || []).length
                            : isSubCategoryView
                                ? (subCategoriesMap[currentParent.id] || []).length
                                : parentCategories.length
                    }
                    itemType={isCategoryItemView ? "category items" : "categories"}
                />
            </CardContainer>

            {/* Child Component: Add Sub Category Modal */}
            <AddSubCategoryModal
                isOpen={isAddSubCategoryModalOpen}
                onClose={() => setIsAddSubCategoryModalOpen(false)}
                onSave={handleSaveSubCategory}
                parentCategoryName={currentParent ? currentParent.name : ""}
            />

            {/* Child Component: Add Category Item Modal */}
            <AddCategoryItemModal
                isOpen={isAddCategoryItemModalOpen}
                onClose={() => setIsAddCategoryItemModalOpen(false)}
                onSave={handleSaveNewCategoryItem}
                parentCategoryName={currentParent ? currentParent.name : ""}
                subCategoryName={currentSubCategory ? currentSubCategory.name : ""}
            />

            {/* Child Component: Edit Category Item Modal */}
            <EditCategoryItemModal
                isOpen={isEditCategoryItemModalOpen}
                onClose={() => { setIsEditCategoryItemModalOpen(false); setEditingCategoryItem(null); }}
                onSave={handleSaveEditedCategoryItem}
                categoryItem={editingCategoryItem}
                parentCategoryName={currentParent ? currentParent.name : ""}
                subCategoryName={currentSubCategory ? currentSubCategory.name : ""}
            />

            {/* Child Component: Delete Category Item Modal */}
            <DeleteCategoryItemModal
                isOpen={isDeleteCategoryItemModalOpen}
                onClose={() => { setIsDeleteCategoryItemModalOpen(false); setCategoryItemToDelete(null); }}
                onConfirm={handleConfirmDeleteCategoryItem}
                categoryItem={categoryItemToDelete}
            />

            {/* Child Component: Category Item Delete Unsuccessfully Modal */}
            <ParentCategoryDeleteErrorModal
                isOpen={isDeleteCategoryItemErrorModalOpen}
                onClose={() => { setIsDeleteCategoryItemErrorModalOpen(false); setCategoryItemToDelete(null); }}
                title="Category Item Delete Unsuccessfully"
                message="The Category Item could not be deleted."
            />

            {/* Child Component: Modal (Add/Edit via old flow) */}
            <SubCategoryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveSubCategory}
                parentCategoryName={currentParent ? currentParent.name : ""}
                initialData={editingSubCategory}
            />

            {/* Child Component: Edit SubCategory Modal */}
            <EditSubCategoryModal
                isOpen={isEditSubCategoryModalOpen}
                onClose={() => { setIsEditSubCategoryModalOpen(false); setEditingSubCategoryItem(null); }}
                onSave={handleSaveEditedSubCategory}
                subCategory={editingSubCategoryItem}
                parentCategoryName={currentParent ? currentParent.name : ""}
            />

            {/* Child Component: Delete SubCategory Modal */}
            <DeleteSubCategoryModal
                isOpen={isDeleteSubCategoryModalOpen}
                onClose={() => { setIsDeleteSubCategoryModalOpen(false); setSubCategoryToDelete(null); }}
                onConfirm={handleConfirmDeleteSubCategory}
                subCategory={subCategoryToDelete}
            />

            {/* Child Component: Sub Category Delete Unsuccessfully Modal */}
            <ParentCategoryDeleteErrorModal
                isOpen={isDeleteSubCategoryErrorModalOpen}
                onClose={() => { setIsDeleteSubCategoryErrorModalOpen(false); setSubCategoryToDelete(null); }}
                title="Sub Category Delete Unsuccessfully"
                message="The Sub Category could not be deleted."
            />

            {/* Child Component: Edit Parent Category Modal matching screenshot */}
            <EditCategoryModal
                isOpen={isEditCategoryModalOpen}
                onClose={() => setIsEditCategoryModalOpen(false)}
                onSave={handleSaveEditedCategory}
                category={editingCategory}
                parentOptions={["IT Help Desk", "Facilities", "HR Services", "OLD Categories"]}
            />

            {/* Child Component: Delete Parent Category Modal matching screenshot */}
            <DeleteCategoryModal
                isOpen={isDeleteCategoryModalOpen}
                onClose={() => setIsDeleteCategoryModalOpen(false)}
                onConfirm={handleConfirmDeleteCategory}
                category={categoryToDelete}
            />

            {/* Child Component: Parent Category Delete Unsuccessfully Modal matching screenshot */}
            <ParentCategoryDeleteErrorModal
                isOpen={isDeleteErrorModalOpen}
                onClose={() => setIsDeleteErrorModalOpen(false)}
                title="Parent Category Delete Unsuccessfully"
                message="The Parent Category could not be deleted."
            />
        </CategoryContainer>
    );
};

export default SuperAdminCategory;
