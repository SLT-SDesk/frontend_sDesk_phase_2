import React, { useState, useMemo } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { LuList, LuPlus, LuSearch } from "react-icons/lu";

const CategoryListTable = ({
  categories,
  parentOptions,
  onSelectCategory,
  onEditCategory,
  onDeleteCategory,
  onAddCategory,
}) => {
  const [selectedParent, setSelectedParent] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Filter categories based on search and parent filter
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const matchesParent =
        selectedParent === "All" || cat.parentName === selectedParent;
      const matchesSearch =
        cat.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.parentName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesParent && matchesSearch;
    });
  }, [categories, selectedParent, searchTerm]);

  // Pagination calculation
  const totalItems = filteredCategories.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCategories = filteredCategories.slice(startIndex, endIndex);

  const handleParentChange = (e) => {
    setSelectedParent(e.target.value);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-gray-200/90 p-5 sm:p-7">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
            <LuList className="w-5 h-5 text-blue-600" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Category List
          </h1>
        </div>

        <button
          type="button"
          onClick={onAddCategory}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#DC2626] hover:bg-red-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-red-400"
        >
          <LuPlus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Filter and Search Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 py-3">
        {/* Parent Category Filter */}
        <div className="flex items-center gap-2.5">
          <label
            htmlFor="parent-filter"
            className="text-sm font-medium text-gray-700 whitespace-nowrap"
          >
            Parent Category
          </label>
          <div className="relative">
            <select
              id="parent-filter"
              value={selectedParent}
              onChange={handleParentChange}
              className="appearance-none bg-white border border-gray-300 text-gray-800 text-sm rounded-lg pl-3.5 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-2xs cursor-pointer min-w-[120px]"
            >
              <option value="All">All</option>
              {parentOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-500">
              <svg
                className="w-4 h-4 fill-current"
                viewBox="0 0 20 20"
              >
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <LuSearch className="w-4 h-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-3.5 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-2xs transition-colors"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="mt-3 overflow-x-auto rounded-lg border border-gray-200/90">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-[#F1F5F9] text-gray-700">
            <tr>
              <th className="py-3.5 px-6 font-semibold tracking-wide border-b border-gray-200 text-left">
                Category ID
              </th>
              <th className="py-3.5 px-6 font-semibold tracking-wide border-b border-gray-200 text-left">
                Parent Category Name
              </th>
              <th className="py-3.5 px-6 font-semibold tracking-wide border-b border-gray-200 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {paginatedCategories.length > 0 ? (
              paginatedCategories.map((category) => (
                <tr
                  key={category.id}
                  className="hover:bg-slate-50/70 transition-colors"
                >
                  <td className="py-3.5 px-6">
                    <button
                      type="button"
                      onClick={() => onSelectCategory(category)}
                      className="font-semibold text-[#2563EB] hover:text-blue-800 hover:underline cursor-pointer transition-colors focus:outline-none"
                      title="Click to view sub-categories"
                    >
                      {category.id}
                    </button>
                  </td>
                  <td className="py-3.5 px-6 font-normal text-gray-700">
                    {category.parentName}
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <div className="inline-flex items-center gap-3 justify-end">
                      <button
                        type="button"
                        onClick={() => onEditCategory(category)}
                        className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors focus:outline-none"
                        title="Edit Category"
                      >
                        <FaEdit size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteCategory(category)}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors focus:outline-none"
                        title="Delete Category"
                      >
                        <FaTrash size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="3"
                  className="py-10 text-center text-gray-500 text-sm"
                >
                  No categories found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer / Pagination Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-2 text-sm text-gray-500">
        <div>
          {totalItems > 0 ? (
            <span>
              Showing {startIndex + 1}–{Math.min(endIndex, totalItems)} of{" "}
              {totalItems} categories
            </span>
          ) : (
            <span>Showing 0 categories</span>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="px-2 text-xs text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryListTable;
