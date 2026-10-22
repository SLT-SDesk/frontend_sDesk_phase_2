import React from "react";
import { GoChecklist } from "react-icons/go";
import {
    TitleBarWrapper,
    TitleWithIcon,
    IconBox,
    AddButton,
} from "../SuperAdminCategoryStyles";

/**
 * CategoryTitleBar - Child component for category title header and action buttons
 * @param {string} title - The title text
 * @param {string} buttonLabel - Action button label
 * @param {function} onButtonClick - Handler for action button click
 */
const CategoryTitleBar = ({
    title = "Category List",
    buttonLabel = "+ Add Sub Category",
    onButtonClick,
}) => {
    return (
        <TitleBarWrapper>
            <TitleWithIcon>
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
