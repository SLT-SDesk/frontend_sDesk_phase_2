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
 * @param {function} onEdit - Edit handler
 * @param {function} onDelete - Delete handler
 */
const CategoryItemTable = ({ items = [], onEdit, onDelete }) => {
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
                        items.map((item, index) => (
                            <CategoryItemRow
                                key={item.id}
                                item={item}
                                index={index}
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />
                        ))
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
