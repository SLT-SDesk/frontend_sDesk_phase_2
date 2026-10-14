import React from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import {
    CategoryCodeCell,
    ActionButton,
} from "../SuperAdminCategoryStyles";

/**
 * SubCategoryRow - Child component representing an individual subcategory row
 * @param {object} item  - Subcategory item with { id, name, category_code }
 * @param {function} onEdit   - Callback when Edit button is clicked
 * @param {function} onDelete - Callback when Delete button is clicked
 */
const SubCategoryRow = ({ item, onEdit, onDelete }) => {
    return (
        <tr>
            <CategoryCodeCell>{item.category_code || item.id}</CategoryCodeCell>
            <td>{item.name}</td>
            <td>
                <ActionButton
                    $variant="edit"
                    title="Edit"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (onEdit) onEdit(item);
                    }}
                >
                    <FiEdit2 strokeWidth={2.5} size={15} />
                </ActionButton>
                <ActionButton
                    $variant="delete"
                    title="Delete"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (onDelete) onDelete(item);
                    }}
                >
                    <FiTrash2 strokeWidth={2.5} size={15} />
                </ActionButton>
            </td>
        </tr>
    );
};

export default SubCategoryRow;
