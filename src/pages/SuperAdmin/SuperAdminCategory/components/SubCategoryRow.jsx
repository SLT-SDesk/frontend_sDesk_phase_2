import React from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import {
    CategoryCodeCell,
    ActionButton,
} from "../SuperAdminCategoryStyles";

/**
 * SubCategoryRow - Child component representing an individual subcategory row
 * @param {object} item - Subcategory item with { id, name }
 */
const SubCategoryRow = ({ item }) => {
    return (
        <tr>
            <CategoryCodeCell>{item.id}</CategoryCodeCell>
            <td>{item.name}</td>
            <td>
                <ActionButton $variant="edit" title="Edit">
                    <FiEdit2 strokeWidth={2.5} size={15} />
                </ActionButton>
                <ActionButton $variant="delete" title="Delete">
                    <FiTrash2 strokeWidth={2.5} size={15} />
                </ActionButton>
            </td>
        </tr>
    );
};

export default SubCategoryRow;
