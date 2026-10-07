import React, { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";

const EditSubCategoryModal = ({
  isOpen,
  onClose,
  parentCategoryName = "IT Help Desk",
  subCategory,
  subCategoryOptions = [],
  onSave,
}) => {
  const [subCategoryId, setSubCategoryId] = useState("");
  const [subCategoryName, setSubCategoryName] = useState("");

  useEffect(() => {
    if (subCategory) {
      setSubCategoryId(subCategory.id || "");
      setSubCategoryName(subCategory.name || "");
    }
  }, [subCategory]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subCategoryName.trim()) return;
    onSave({
      id: subCategoryId,
      name: subCategoryName.trim(),
    });
  };

  // Combine options to ensure current subCategoryName is included
  const options = Array.from(
    new Set([subCategory?.name, ...subCategoryOptions].filter(Boolean))
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[1px] animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-subcategory-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white rounded-2xl p-6 sm:p-7 shadow-2xl border border-gray-100 relative transition-all animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Close modal"
        >
          <IoClose size={22} />
        </button>

        {/* Parent Category Badge */}
        <div className="text-sm font-semibold text-[#2563EB] mb-2 tracking-wide">
          Parent Category - {parentCategoryName}
        </div>

        {/* Header */}
        <h3
          id="edit-subcategory-title"
          className="text-xl font-bold text-gray-900"
        >
          Edit Category
        </h3>
        <p className="text-sm text-gray-500 mt-1 mb-6">
          Select a sub category name.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {/* Sub Category ID Field */}
            <div>
              <label
                htmlFor="edit-sub-category-id"
                className="text-xs font-semibold text-gray-800 mb-1.5 block"
              >
                Sub Category ID
              </label>
              <input
                id="edit-sub-category-id"
                type="text"
                value={subCategoryId}
                onChange={(e) => setSubCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50/60 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="e.g. CAT004#1"
              />
            </div>

            {/* Sub Category Name Field */}
            <div>
              <label
                htmlFor="edit-sub-category-name"
                className="text-xs font-semibold text-gray-800 mb-1.5 block"
              >
                Sub Category Name <span className="text-red-500">*</span>
              </label>
              <select
                id="edit-sub-category-name"
                value={subCategoryName}
                onChange={(e) => setSubCategoryName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer"
              >
                <option value="" disabled>
                  Select Sub Category Name
                </option>
                {options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-medium text-white bg-[#1D4ED8] hover:bg-blue-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSubCategoryModal;
