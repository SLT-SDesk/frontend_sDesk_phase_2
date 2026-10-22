import React from "react";
import { FaSearch } from "react-icons/fa";
import {
    ControlsWrapper,
    FiltersGroup,
    SelectBox,
    SearchBox,
    SearchInput,
} from "../SuperAdminCategoryStyles";

/**
 * CategoryControls - Controls bar with Parent Category selector and Search input
 * @param {Array} parentCategories - List of parent category objects / options
 * @param {string} selectedParent - Currently selected parent category id or name
 * @param {function} onParentChange - Callback when parent category changes
 * @param {string} searchQuery - Current search text
 * @param {function} onSearchChange - Callback when search text changes
 * @param {boolean} showParentFilter - Whether to render the parent category selector
 */
const CategoryControls = ({
    parentCategories = [],
    selectedParent = "",
    onParentChange,
    searchQuery = "",
    onSearchChange,
    showParentFilter = true,
}) => {
    return (
        <ControlsWrapper>
            {showParentFilter && (
                <FiltersGroup>
                    <span>Parent Category</span>
                    <SelectBox
                        value={selectedParent}
                        onChange={(e) => onParentChange && onParentChange(e.target.value)}
                    >
                        {parentCategories.map((p) => (
                            <option key={p.id || p.name} value={p.name || p.id}>
                                {p.name || p.id}
                            </option>
                        ))}
                    </SelectBox>
                </FiltersGroup>
            )}

            <SearchBox style={{ marginLeft: showParentFilter ? "auto" : "auto" }}>
                <FaSearch />
                <SearchInput
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                />
            </SearchBox>
        </ControlsWrapper>
    );
};

export default CategoryControls;
