import React from "react";
import SubCategoryRow from "./SubCategoryRow";
import {
    TableWrapper,
    Table,
    TableHead,
    TableBody,
    EmptyRowCell,
} from "../SuperAdminCategoryStyles";

/**
 * SubCategoryTable - Child component rendering table headers and list of subcategories
 * @param {Array} items - List of subcategories
 * @param {function} onEdit - Edit handler passed down to row
 * @param {function} onDelete - Delete handler passed down to row
 */
const SubCategoryTable = ({ items = [], onEdit, onDelete }) => {
    return (
        <TableWrapper>
            <Table>
                <TableHead>
                    <tr>
                        <th style={{ width: "25%" }}>Sub Category ID</th>
                        <th style={{ width: "55%" }}>Sub Category Name</th>
                        <th style={{ width: "20%" }}>Actions</th>
                    </tr>
                </TableHead>
                <TableBody>
                    {items.length > 0 ? (
                        items.map((subCat) => (
                            <SubCategoryRow
                                key={subCat.id}
                                item={subCat}
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />
                        ))
                    ) : (
                        <tr>
                            <EmptyRowCell colSpan="3">
                                No sub categories found
                            </EmptyRowCell>
                        </tr>
                    )}
                </TableBody>
            </Table>
        </TableWrapper>
    );
};

export default SubCategoryTable;
