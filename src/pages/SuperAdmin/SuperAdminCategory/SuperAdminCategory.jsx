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
import CategoryFooter from "./components/CategoryFooter";
import SubCategoryModal from "./components/SubCategoryModal";

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
    const [selectedParentId, setSelectedParentId] = useState("CAT004"); // Default: IT Help Desk
    const [searchQuery, setSearchQuery] = useState("");

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSubCategory, setEditingSubCategory] = useState(null);

    // Current selected parent object
    const currentParent = useMemo(() => {
        return parentCategories.find((c) => c.id === selectedParentId) || null;
    }, [parentCategories, selectedParentId]);

    const isSubCategoryView = Boolean(currentParent);

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
        setSearchQuery("");
    };

    // Handler: Return to All Categories
    const handleBackToAllCategories = () => {
        setSelectedParentId(null);
        setSearchQuery("");
    };

    // Handler: Add Sub Category Button Click
    const handleAddClick = () => {
        setEditingSubCategory(null);
        setIsModalOpen(true);
    };

    // Handler: Edit Sub Category Click
    const handleEditClick = (subCategory) => {
        setEditingSubCategory(subCategory);
        setIsModalOpen(true);
    };

    // Handler: Delete Sub Category
    const handleDeleteClick = (subCategory) => {
        if (!currentParent) return;
        const confirmed = window.confirm(
            `Are you sure you want to delete sub category "${subCategory.name}" (${subCategory.id})?`
        );
        if (!confirmed) return;

        setSubCategoriesMap((prev) => {
            const parentList = prev[currentParent.id] || [];
            return {
                ...prev,
                [currentParent.id]: parentList.filter((item) => item.id !== subCategory.id),
            };
        });
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

    return (
        <CategoryContainer>
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
                {/* Child Component: Title Bar */}
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

                {/* Child Component: Controls (Dropdown & Search) */}
                <CategoryControls
                    parentCategories={dropdownOptions}
                    selectedParent={currentParent ? currentParent.name : "All Categories"}
                    onParentChange={handleDropdownChange}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    showParentFilter={true}
                />

                {/* Child Component: Table */}
                {isSubCategoryView ? (
                    <SubCategoryTable
                        items={displayedSubCategories}
                        onEdit={handleEditClick}
                        onDelete={handleDeleteClick}
                    />
                ) : (
                    <ParentCategoryTable
                        items={displayedParentCategories}
                        onSelectParent={handleSelectParentRow}
                        onEdit={(cat) => alert(`Edit parent category: ${cat.name}`)}
                        onDelete={(cat) => alert(`Delete parent category: ${cat.name}`)}
                    />
                )}

                {/* Child Component: Footer */}
                <CategoryFooter
                    currentCount={
                        isSubCategoryView
                            ? displayedSubCategories.length
                            : displayedParentCategories.length
                    }
                    totalCount={
                        isSubCategoryView
                            ? (subCategoriesMap[currentParent.id] || []).length
                            : parentCategories.length
                    }
                    itemType="categories"
                />
            </CardContainer>

            {/* Child Component: Modal */}
            <SubCategoryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveSubCategory}
                parentCategoryName={currentParent ? currentParent.name : ""}
                initialData={editingSubCategory}
            />
        </CategoryContainer>
    );
};

export default SuperAdminCategory;
