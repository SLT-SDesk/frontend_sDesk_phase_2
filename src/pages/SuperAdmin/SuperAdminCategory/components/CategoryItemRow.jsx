import React from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import {
    CategoryCodeCell,
    ActionButton,
} from "../SuperAdminCategoryStyles";

/**
 * CategoryItemRow - Renders a single category item row
 * @param {object} item - Category item with { id, name }
 * @param {string} displayId - Formatted unique Category Item ID (e.g. CAT004#1#1)
 * @param {function} onEdit - Edit handler
 * @param {function} onDelete - Delete handler
 */
const CategoryItemRow = ({ item, displayId, index = 0, onEdit, onDelete }) => {
    const finalDisplayId = displayId || (item.category_code || `ITEM${String(index + 1).padStart(3, "0")}`);
    return (
        <tr>
            <CategoryCodeCell title={item.id}>
                {finalDisplayId}
            </CategoryCodeCell>
            <td>{item.name}</td>
            <td>
                <ActionButton $variant="edit" title="Edit" onClick={() => onEdit && onEdit(item)}>
                    <FiEdit2 strokeWidth={2.5} size={15} />
                </ActionButton>
                <ActionButton $variant="delete" title="Delete" onClick={() => onDelete && onDelete(item)}>
                    <FiTrash2 strokeWidth={2.5} size={15} />
                </ActionButton>
            </td>
        </tr>
    );
};

export default CategoryItemRow;
