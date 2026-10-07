import React from "react";

const DeleteCategoryModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Category?",
  message = "Are you sure you want to delete this category? This action cannot be undone.",
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[1px] animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl p-6 sm:p-7 shadow-2xl border border-gray-100 transition-all transform scale-100 animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          id="delete-modal-title"
          className="text-lg sm:text-xl font-bold text-gray-900"
        >
          {title}
        </h3>

        <p className="text-sm text-gray-500 mt-2 mb-6 leading-relaxed">
          {message}
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-[#DC2626] hover:bg-red-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteCategoryModal;
