import React from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import {
    TableWrapper,
    Table,
    TableHead,
    TableBody,
    CategoryCodeCell,
    ActionButton,
    EmptyRowCell,
} from "../SuperAdminCategoryStyles";

/**
 * ParentCategoryTable - Child component for displaying parent categories list
 * @param {Array} items - List of parent categories
 * @param {function} onSelectParent - Callback when clicking a parent category to drilldown
 * @param {function} onEdit - Edit handler
 * @param {function} onDelete - Delete handler
 */
const ParentCategoryTable = ({
    items = [],
    onSelectParent,
    onEdit,
    onDelete,
}) => {
    return (
        <TableWrapper>
            <Table>
                <TableHead>
                    <tr>
                        <th style={{ width: "25%" }}>Category ID</th>
                        <th style={{ width: "55%" }}>Parent Category Name</th>
                        <th style={{ width: "20%" }}>Actions</th>
                    </tr>
                </TableHead>
                <TableBody>
                    {items.length > 0 ? (
                        items.map((cat) => (
                            <tr key={cat.id}>
                                <CategoryCodeCell
                                    style={{ cursor: "pointer" }}
                                    onClick={() => onSelectParent && onSelectParent(cat)}
                                    title="Click to view sub categories"
                                >
                                    {cat.id}
                                </CategoryCodeCell>
                                <td
                                    style={{ cursor: "pointer", fontWeight: 500 }}
                                    onClick={() => onSelectParent && onSelectParent(cat)}
                                    title="Click to view sub categories"
                                >
                                    {cat.name}
                                </td>
                                <td>
                                    <ActionButton
                                        $variant="edit"
                                        title="Edit Category"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEdit && onEdit(cat);
                                        }}
                                    >
                                        <FiEdit2 strokeWidth={2.5} size={15} />
                                    </ActionButton>
                                    <ActionButton
                                        $variant="delete"
                                        title="Delete Category"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete && onDelete(cat);
                                        }}
                                    >
                                        <FiTrash2 strokeWidth={2.5} size={15} />
                                    </ActionButton>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <EmptyRowCell colSpan="3">No categories found</EmptyRowCell>
                        </tr>
                    )}
                </TableBody>
            </Table>
        </TableWrapper>
    );
};

export default ParentCategoryTable;
