import React from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import {
    CategoryCodeCell,
    ActionButton,
} from "../SuperAdminCategoryStyles";

/**
 * SubCategoryRow - Child component representing an individual subcategory row
 * @param {object} item - Subcategory item with { id, name }
 * @param {function} onSelect - Callback when row is clicked (drills down to category items)
 * @param {function} onEdit - Callback when edit button is clicked
 * @param {function} onDelete - Callback when delete button is clicked
 */
const SubCategoryRow = ({ item, onSelect, onEdit, onDelete }) => {
    return (
        <tr
            onClick={() => onSelect && onSelect(item)}
            style={{ cursor: onSelect ? "pointer" : "default" }}
        >
            <CategoryCodeCell>{item.id}</CategoryCodeCell>
            <td>{item.name}</td>
            <td>
                <ActionButton
                    $variant="edit"
                    title="Edit"
                    onClick={(e) => { e.stopPropagation(); onEdit && onEdit(item); }}
                >
                    <FiEdit2 strokeWidth={2.5} size={15} />
                </ActionButton>
                <ActionButton
                    $variant="delete"
                    title="Delete"
                    onClick={(e) => { e.stopPropagation(); onDelete && onDelete(item); }}
                >
                    <FiTrash2 strokeWidth={2.5} size={15} />
                </ActionButton>
            </td>
        </tr>
    );
};

export default SubCategoryRow;
