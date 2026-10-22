import React from "react";
import { FooterWrapper } from "../SuperAdminCategoryStyles";

/**
 * CategoryFooter - Child component rendering count text
 * @param {number} currentCount - Displayed count
 * @param {number} totalCount - Total items count
 * @param {string} itemType - Item descriptor (e.g. "categories" or "sub categories")
 */
const CategoryFooter = ({
    currentCount = 0,
    totalCount = 0,
    itemType = "categories",
}) => {
    const start = currentCount > 0 ? 1 : 0;
    return (
        <FooterWrapper>
            Showing {start}–{currentCount} of {totalCount} {itemType}
        </FooterWrapper>
    );
};

export default CategoryFooter;
