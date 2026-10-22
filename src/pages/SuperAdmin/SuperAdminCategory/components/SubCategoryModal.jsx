import React, { useState, useEffect } from "react";
import {
    ModalOverlay,
    ModalDialog,
    ModalHeader,
    ModalCloseBtn,
    ModalBody,
    FormGroup,
    ModalFooter,
    ModalCancelBtn,
    ModalSubmitBtn,
} from "../SuperAdminCategoryStyles";

/**
 * SubCategoryModal - Modal for adding or editing a subcategory
 * @param {boolean} isOpen             - Whether modal is visible
 * @param {function} onClose           - Close handler
 * @param {function} onSave            - Save handler ({ name }) — id & mainCategoryId handled by parent
 * @param {string}   parentCategoryName - Name of current parent category
 * @param {object}   initialData       - Optional data if editing (full subcategory object from API)
 */
const SubCategoryModal = ({
    isOpen,
    onClose,
    onSave,
    parentCategoryName = "",
    initialData = null,
}) => {
    const [subCategoryName, setSubCategoryName] = useState("");

    useEffect(() => {
        if (initialData) {
            setSubCategoryName(initialData.name || "");
        } else {
            setSubCategoryName("");
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!subCategoryName.trim()) return;
        onSave({ name: subCategoryName.trim() });
        onClose();
    };

    return (
        <ModalOverlay onClick={onClose}>
            <ModalDialog onClick={(e) => e.stopPropagation()}>
                <ModalHeader>
                    <span>{initialData ? "Edit Sub Category" : "Add Sub Category"}</span>
                    <ModalCloseBtn onClick={onClose}>&times;</ModalCloseBtn>
                </ModalHeader>

                <form onSubmit={handleSubmit}>
                    <ModalBody>
                        {/* Parent category (read-only context) */}
                        <FormGroup>
                            <label>Parent Category</label>
                            <input type="text" value={parentCategoryName} disabled readOnly />
                        </FormGroup>

                        {/* Show category_code in edit mode (read-only, API-managed) */}
                        {initialData && (
                            <FormGroup>
                                <label>Sub Category ID</label>
                                <input
                                    type="text"
                                    value={initialData.category_code || initialData.id || ""}
                                    readOnly
                                    disabled
                                />
                            </FormGroup>
                        )}

                        <FormGroup>
                            <label>Sub Category Name</label>
                            <input
                                type="text"
                                placeholder="Enter sub category name (e.g. Email, Cashiering)"
                                value={subCategoryName}
                                onChange={(e) => setSubCategoryName(e.target.value)}
                                required
                                autoFocus
                            />
                        </FormGroup>
                    </ModalBody>

                    <ModalFooter>
                        <ModalCancelBtn type="button" onClick={onClose}>
                            Cancel
                        </ModalCancelBtn>
                        <ModalSubmitBtn type="submit">
                            {initialData ? "Update" : "Save"}
                        </ModalSubmitBtn>
                    </ModalFooter>
                </form>
            </ModalDialog>
        </ModalOverlay>
    );
};

export default SubCategoryModal;
