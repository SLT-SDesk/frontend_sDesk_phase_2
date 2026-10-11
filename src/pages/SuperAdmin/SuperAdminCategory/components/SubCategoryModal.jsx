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
 * @param {boolean} isOpen - Whether modal is visible
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler ({ id, name })
 * @param {string} parentCategoryName - Name of current parent category
 * @param {object} initialData - Optional data if editing
 */
const SubCategoryModal = ({
    isOpen,
    onClose,
    onSave,
    parentCategoryName = "",
    initialData = null,
}) => {
    const [subCategoryName, setSubCategoryName] = useState("");
    const [customId, setCustomId] = useState("");

    useEffect(() => {
        if (initialData) {
            setSubCategoryName(initialData.name || "");
            setCustomId(initialData.id || "");
        } else {
            setSubCategoryName("");
            setCustomId("");
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!subCategoryName.trim()) return;

        onSave({
            id: customId || initialData?.id,
            name: subCategoryName.trim(),
        });
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
                        <FormGroup>
                            <label>Parent Category</label>
                            <input type="text" value={parentCategoryName} disabled readOnly />
                        </FormGroup>

                        {initialData && (
                            <FormGroup>
                                <label>Sub Category ID</label>
                                <input
                                    type="text"
                                    value={customId}
                                    onChange={(e) => setCustomId(e.target.value)}
                                    required
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
