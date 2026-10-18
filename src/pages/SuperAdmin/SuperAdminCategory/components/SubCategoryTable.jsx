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
 * @param {Array}    items               - List of subcategories from Redux
 * @param {boolean}  loading             - Loading state
 * @param {function} onSelectSubCategory - Callback when a subcategory row is clicked (drills down)
 * @param {function} onEdit              - Callback when Edit button is clicked on a row
 * @param {function} onDelete            - Callback when Delete button is clicked on a row
 */
const SubCategoryTable = ({ items = [], loading = false, onSelectSubCategory, onEdit, onDelete }) => {
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
                    {loading ? (
                        <tr>
                            <EmptyRowCell colSpan="3">Loading...</EmptyRowCell>
                        </tr>
                    ) : items.length > 0 ? (
                        items.map((subCat, index) => (
                            <SubCategoryRow
                                key={subCat.id}
                                item={subCat}
                                index={index}
                                onSelect={onSelectSubCategory}
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
