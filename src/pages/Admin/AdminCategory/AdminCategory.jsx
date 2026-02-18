import React, { useState } from "react";
import "./AdminCategory.css";
import { FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import { FaClipboardList } from "react-icons/fa";
import { TiExportOutline } from "react-icons/ti";
import { IoIosAddCircleOutline } from "react-icons/io";
import AdminAddCategory from "../../../components/AdminAddCategory/AdminAddCategory";
import ConfirmPopup from "../../../components/ConfirmPopup/ConfirmPopup";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCategoryItemsRequest,
  deleteCategoryItemRequest,
  deleteSubCategoryRequest,
  fetchMainCategoriesRequest,
  fetchSubCategoriesRequest,

} from "../../../redux/categories/categorySlice";
import * as XLSX from "xlsx";

const AdminCategory = () => {
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [deleteConfirmPopup, setDeleteConfirmPopup] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectShowOption, setSelectShowOption] = useState("All");
  const [successMessage, setSuccessMessage] = useState("");

  const dispatch = useDispatch();
  const categoryItems = useSelector((state) => state.categories.categoryItems);
  const mainCategories = useSelector((state) => state.categories.mainCategories);
  const subCategories = useSelector((state) => state.categories.subCategories);


  React.useEffect(() => {
    dispatch(fetchCategoryItemsRequest());
    dispatch(fetchMainCategoriesRequest());
    dispatch(fetchSubCategoriesRequest());
  }, [dispatch]);

  /// Build a set of subCategoryIds that already have items  
  const subIdsWithItems = new Set(
    categoryItems
      .map((item) => item.subCategory?.id)
      .filter(Boolean)
  );

  // Items rows (always show)
  const itemRows = categoryItems.map((item) => ({
    rowType: "item",
    id: item.id,
    key: `item-${item.id}`,
    catID: item.category_code,
    categoryName: item.name,
    subCategoryName: item.subCategory?.name || "",
    parentCategoryName: item.subCategory?.mainCategory?.name || "",
  }));

  // Subcategory rows (ONLY show if it has NO items)
  const subRows = subCategories
    .filter((sub) => !subIdsWithItems.has(sub.id))
    .map((sub) => ({
      rowType: "sub",
      id: sub.id,
      key: `sub-${sub.id}`,
      catID: sub.category_code || "",
      categoryName: "",
      subCategoryName: sub.name || "",
      parentCategoryName: sub.mainCategory?.name || "",
    }));

  // Final table rows
  const categories = [...itemRows, ...subRows];



  // Get unique parent category names for dropdown (from mainCategories)
  const parentCategoryOptions = Array.from(
    new Set(mainCategories.map((cat) => cat.name).filter(Boolean))
  );

  const handleEdit = (row) => {
    console.log("EDIT CLICKED:", row);
    if (row.rowType === "item") {
      const item = categoryItems.find((x) => x.id === row.id);

      if (!item) return;

      setEditCategory({
        id: item.id,
        name: item.name,
        parent: item.subCategory?.mainCategory?.id || "",
        sub: item.subCategory?.id || "",
        type: "grandchild",
      });
      setIsEditCategoryOpen(true);
    } else {
      // sub category edit
      const sub = subCategories.find((x) => x.id === row.id);

      if (!sub) return;

      setEditCategory({
        id: sub.id,
        name: sub.name,
        parent: sub.mainCategory?.id || "",
        sub: "",
        type: "sub",
      });
      setIsEditCategoryOpen(true);
    }
  };


  const handleDelete = (row) => {
    console.log("DELETE CLICKED:", row);
    setDeleteTarget(row);
    setDeleteConfirmPopup(true);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.rowType === "item") {
      dispatch(deleteCategoryItemRequest(deleteTarget.id));
      setSuccessMessage("Category item deleted successfully!");
    } else if (deleteTarget.rowType === "sub") {
      dispatch(deleteSubCategoryRequest(deleteTarget.id));
      setSuccessMessage("Sub category deleted successfully!");
    }

    setDeleteConfirmPopup(false);
    setDeleteTarget(null);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleChange = (e) => {
    setSelectShowOption(e.target.value);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleExport = () => {
    // Prepare data for export (use filteredCategories for current view, or categories for all)
    const exportData = filteredCategories.map((row) => ({
      "CAT ID": row.catID,
      "Category Name": row.categoryName,
      "Sub Category Name": row.subCategoryName,
      "Parent Category Name": row.parentCategoryName,
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Categories");
    XLSX.writeFile(workbook, "categories.xlsx");
  };

  const filteredCategories = categories.filter((category) => {
    const matchesSearch =
      category.catID.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.subCategoryName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      category.parentCategoryName
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    const matchesFilter =
      selectShowOption === "All" ||
      category.parentCategoryName === selectShowOption;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="AdminCategory-main-content">
      <div className="AdminCategory-direction-bar">Category List</div>
      <div className="AdminCategory-content2">
        <div className="AdminCategory-TitleBar">
          <div className="AdminCategory-TitleBar-NameAndIcon">
            <FaClipboardList size={20} />
            Category List
          </div>
          <div className="AdminCategory-TitleBar-buttons">
            <button
              className="AdminCategory-TitleBar-buttons-AddUser"
              onClick={() => setIsAddCategoryOpen(true)}
            >
              <IoIosAddCircleOutline />
              Add Category
            </button>
            <button
              className="AdminCategory-TitleBar-buttons-ExportData"
              onClick={handleExport}
            >
              <TiExportOutline />
              Export Data
            </button>
          </div>
        </div>
        <div className="AdminCategory-showSearchBar">
          <div className="AdminCategory-showSearchBar-Show">
            Show
            <select
              className="AdminCategory-showSearchBar-Show-select"
              value={selectShowOption}
              onChange={handleChange}
            >
              <option value="All">All</option>
              {parentCategoryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="AdminCategory-showSearchBar-SearchBar">
            <FaSearch />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearch}
              className="AdminCategory-showSearchBar-SearchBar-input"
            />
          </div>
        </div>
        <div className="AdminCategory-table">
          <table>
            <thead>
              <tr>
                <th>CAT ID</th>
                <th>Category Item Name</th>
                <th>Sub Category Name</th>
                <th>Parent Category Name</th>
                <th>Options</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                  <tr key={category.key || category.catID}>
                    <td>{category.catID}</td>
                    <td>{category.categoryName}</td>
                    <td>{category.subCategoryName}</td>
                    <td>{category.parentCategoryName}</td>
                    <td>
                      <button
                        className="AdminCategory-table-edit-btn"
                        onClick={() => handleEdit(category)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="AdminCategory-table-delete-btn"
                        onClick={() => handleDelete(category)}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    No categories found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {isAddCategoryOpen && (
        <AdminAddCategory
          onClose={() => setIsAddCategoryOpen(false)}
          onSubmit={() => {
            // TODO: handle new category with real data
            setSuccessMessage("Parent category added successfully!");
            setTimeout(() => setSuccessMessage(""), 3000);
          }}
        />
      )}
      {isEditCategoryOpen && (
        <AdminAddCategory
          isEdit
          editCategory={editCategory}
          onClose={() => setIsEditCategoryOpen(false)}
          onSubmit={() => {
            setIsEditCategoryOpen(false);
          }}
        />
      )}
      {deleteConfirmPopup && (
        <ConfirmPopup
          message={`Are you sure you want to delete this category?`}
          onConfirm={confirmDelete}
          onCancel={() => {
            setDeleteConfirmPopup(false);
            setDeleteTarget(null);
          }}
        />
      )}
      {successMessage && (
        <div className="AdminCategory-success-message">{successMessage}</div>
      )}
    </div>
  );
};

export default AdminCategory;
