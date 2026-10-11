import React from "react";
import { GoChecklist } from "react-icons/go";
import { FiArrowLeft } from "react-icons/fi";
import {
    TitleBarWrapper,
    TitleWithIcon,
    IconBox,
    BackButton,
    AddButton,
} from "../SuperAdminCategoryStyles";

/**
 * CategoryTitleBar - Child component for category title header and action buttons
 * @param {string} title - The title text (e.g. "IT Help Desk > Sub Category" or "Category List")
 * @param {string} buttonLabel - Action button label (e.g. "+ Add Sub Category")
 * @param {function} onButtonClick - Handler for action button click
 * @param {boolean} showBack - Whether to show back button
 * @param {function} onBackClick - Handler for back button
 */
const CategoryTitleBar = ({
    title = "Category List",
    buttonLabel = "+ Add Sub Category",
    onButtonClick,
    showBack = false,
    onBackClick,
}) => {
    return (
        <TitleBarWrapper>
            <TitleWithIcon>
                {showBack && (
                    <BackButton onClick={onBackClick} title="Back to Category List">
                        <FiArrowLeft size={16} /> Back
                    </BackButton>
                )}
                <IconBox>
                    <GoChecklist size={24} />
                </IconBox>
                <span>{title}</span>
            </TitleWithIcon>

            {buttonLabel && (
                <AddButton onClick={onButtonClick}>
                    {buttonLabel}
                </AddButton>
            )}
        </TitleBarWrapper>
    );
};

export default CategoryTitleBar;
