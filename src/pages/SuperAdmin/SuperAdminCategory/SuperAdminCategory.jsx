import React, { useState, useEffect } from "react";
import "./SuperAdminCategory.css";
import { FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import { FaClipboardList } from "react-icons/fa";
import { IoIosAddCircleOutline } from "react-icons/io";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { GoChecklist } from "react-icons/go";

const SuperAdminCategory = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedParent, setSelectedParent] = useState("All");

    // Fallback / Mock Data to precisely match the user's screenshot format.
    // In a real scenario, this gets populated from an API or Redux via useSelector.
    const [categories, setCategories] = useState([
        { id: "CAT004", name: "IT Help Desk" },
        { id: "CAT005", name: "OLD Categories" },
        { id: "CAT006", name: "OLD Categories" },
        { id: "CAT007", name: "OLD Categories" },
        { id: "CAT008", name: "OLD Categories" },
        { id: "CAT009", name: "OLD Categories" },
        { id: "CAT010", name: "OLD Categories" },
        { id: "CAT011", name: "OLD Categories" },
        { id: "CAT012", name: "OLD Categories" },
    ]);

    const handleSearch = (e) => setSearchQuery(e.target.value);
    const handleDropdown = (e) => setSelectedParent(e.target.value);

    const filteredCategories = categories.filter((cat) => {
        const matchesSearch =
            cat.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cat.name.toLowerCase().includes(searchQuery.toLowerCase());

        // Expand this logic if selecting specific parents matters in full implementation
        const matchesFilter = selectedParent === "All" || cat.name === selectedParent;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="SuperAdminCategory-container">
            {/* Top Banner mapping to the screenshot */}
            <div className="SuperAdminCategory-direction-bar">
                Home {"> "} <strong>Category List</strong>
            </div>

            {/* Main Card Content */}
            <div className="SuperAdminCategory-content2">
                <div className="SuperAdminCategory-TitleBar">
                    <div className="SuperAdminCategory-TitleBar-NameAndIcon">
                        <div className="SuperAdminCategory-icon-box">
                            <GoChecklist size={24} />
                        </div>
                        Category List
                    </div>
                    <button className="SuperAdminCategory-TitleBar-buttons-AddUser">
                        <span>+</span> Add Category
                    </button>
                </div>

                {/* Search & Filter Controls */}
                <div className="SuperAdminCategory-controls">
                    <div className="SuperAdminCategory-filters">
                        <span>Parent Category</span>
                        <select value={selectedParent} onChange={handleDropdown}>
                            <option value="All">All</option>
                            <option value="IT Help Desk">IT Help Desk</option>
                            <option value="OLD Categories">OLD Categories</option>
                        </select>
                    </div>
                    <div className="SuperAdminCategory-search">
                        <FaSearch />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={handleSearch}
                        />
                    </div>
                </div>

                {/* Categories Table */}
                <div className="SuperAdminCategory-table-wrapper">
                    <table className="SuperAdminCategory-table">
                        <thead>
                            <tr>
                                <th>Category ID</th>
                                <th>Parent Category Name</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCategories.length > 0 ? (
                                filteredCategories.map((category, index) => (
                                    <tr key={index}>
                                        <td className="cat-id">{category.id}</td>
                                        <td>{category.name}</td>
                                        <td>
                                            <button className="SuperAdminCategory-action-btn edit-btn" title="Edit">
                                                <FiEdit2 strokeWidth={2.5} size={15} />
                                            </button>
                                            <button className="SuperAdminCategory-action-btn delete-btn" title="Delete">
                                                <FiTrash2 strokeWidth={2.5} size={15} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" style={{ textAlign: "center", padding: "20px" }}>
                                        No categories found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer Pagination Stats */}
                <div className="SuperAdminCategory-footer">
                    Showing {filteredCategories.length > 0 ? 1 : 0}-{filteredCategories.length} of {categories.length} categories
                </div>
            </div>
        </div>
    );
};

export default SuperAdminCategory;
