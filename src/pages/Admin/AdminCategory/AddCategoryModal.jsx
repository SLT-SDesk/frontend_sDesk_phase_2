import React, { useState } from "react";
import { IoClose } from "react-icons/io5";

const AddCategoryModal = ({
  isOpen,
  onClose,
  parentOptions = [],
  onAdd,
  suggestedId = "CAT013",
}) => {
  const [categoryId, setCategoryId] = useState(suggestedId);
  const [parentName, setParentName] = useState("");
  const [customName, setCustomName] = useState("");
  const [isCustom, setIsCustom] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalParentName = isCustom ? customName.trim() : parentName.trim();
    if (!finalParentName) return;

    onAdd({
      id: categoryId.trim() || suggestedId,
      parentName: finalParentName,
      subCategories: [],
    });
    setParentName("");
    setCustomName("");
    setIsCustom(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[1px] animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-category-title"
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

        {/* Header */}
        <h3 id="add-category-title" className="text-xl font-bold text-gray-900">
          Add Category
        </h3>
        <p className="text-sm text-gray-500 mt-1 mb-6">
          Enter details to create a new category.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {/* Category ID Field */}
            <div>
              <label
                htmlFor="add-category-id"
                className="text-xs font-semibold text-gray-800 mb-1.5 block"
              >
                Category ID <span className="text-red-500">*</span>
              </label>
              <input
                id="add-category-id"
                type="text"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="e.g. CAT013"
              />
            </div>

            {/* Parent Category Name Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="add-parent-name"
                  className="text-xs font-semibold text-gray-800 block"
                >
                  Parent Category Name <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustom(!isCustom)}
                  className="text-[11px] text-blue-600 hover:underline"
                >
                  {isCustom ? "Select Existing" : "Create New"}
                </button>
              </div>

              {isCustom ? (
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Enter new parent category"
                  required
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              ) : (
                <select
                  id="add-parent-name"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer"
                >
                  <option value="" disabled>
                    Select Parent Category
                  </option>
                  {parentOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              )}
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
              className="px-5 py-2.5 text-sm font-medium text-white bg-[#DC2626] hover:bg-red-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors"
            >
              Add Category
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCategoryModal;
