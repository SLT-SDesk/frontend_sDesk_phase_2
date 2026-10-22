import React from "react";
import CategoryItemRow from "./CategoryItemRow";
import {
    TableWrapper,
    Table,
    TableHead,
    TableBody,
    EmptyRowCell,
} from "../SuperAdminCategoryStyles";

/**
 * CategoryItemTable - Renders table of category items for a selected subcategory
 * @param {Array} items - List of category items
 * @param {string} subCategoryCode - Unique code of the selected subcategory (e.g. CAT004#1)
 * @param {function} onEdit - Edit handler
 * @param {function} onDelete - Delete handler
 */
const CategoryItemTable = ({ items = [], subCategoryCode = "CAT#1", onEdit, onDelete }) => {
    return (
        <TableWrapper>
            <Table>
                <TableHead>
                    <tr>
                        <th style={{ width: "25%" }}>Category Item ID</th>
                        <th style={{ width: "55%" }}>Category Item Name</th>
                        <th style={{ width: "20%" }}>Actions</th>
                    </tr>
                </TableHead>
                <TableBody>
                    {items.length > 0 ? (
                        items.map((item, index) => {
                            const displayId =
                                item.category_code &&
                                (item.category_code.split("#").length >= 3 || item.category_code.startsWith("ITEM"))
                                    ? item.category_code
                                    : `${subCategoryCode || "CAT#1"}#${index + 1}`;
                            return (
                                <CategoryItemRow
                                    key={item.id}
                                    item={item}
                                    displayId={displayId}
                                    index={index}
                                    onEdit={(catItem) => onEdit && onEdit(catItem, displayId)}
                                    onDelete={onDelete}
                                />
                            );
                        })
                    ) : (
                        <tr>
                            <EmptyRowCell colSpan="3">
                                No category items found
                            </EmptyRowCell>
                        </tr>
                    )}
                </TableBody>
            </Table>
        </TableWrapper>
    );
};

export default CategoryItemTable;
