import React from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import {
    CategoryCodeCell,
    ActionButton,
} from "../SuperAdminCategoryStyles";

/**
 * SubCategoryRow - Child component representing an individual subcategory row
 * @param {object} item - Subcategory item with { id, name }
 * @param {function} onEdit - Edit handler
 * @param {function} onDelete - Delete handler
 */
const SubCategoryRow = ({ item, onEdit, onDelete }) => {
    return (
        <tr>
            <CategoryCodeCell>{item.id}</CategoryCodeCell>
            <td>{item.name}</td>
            <td>
                <ActionButton
                    $variant="edit"
                    title="Edit Sub Category"
                    onClick={() => onEdit && onEdit(item)}
                >
                    <FiEdit2 strokeWidth={2.5} size={15} />
                </ActionButton>
                <ActionButton
                    $variant="delete"
                    title="Delete Sub Category"
                    onClick={() => onDelete && onDelete(item)}
                >
                    <FiTrash2 strokeWidth={2.5} size={15} />
                </ActionButton>
            </td>
        </tr>
    );
};

export default SubCategoryRow;
