import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { FiX } from "react-icons/fi";

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
  padding: 16px;
`;

const ModalCard = styled.div`
  background: #ffffff;
  border-radius: 12px;
  width: 100%;
  max-width: 520px;
  padding: 24px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  position: relative;
  font-family: inherit;
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
`;

const HeaderTitles = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const ModalParentTitle = styled.p`
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: #2563eb;
`;

const ModalTitle = styled.h2`
  margin: 4px 0 0 0;
  font-size: 18px;
  font-weight: 700;
  color: #111827;
`;

const ModalSubtitle = styled.p`
  margin: 4px 0 0 0;
  font-size: 13px;
  color: #6b7280;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: color 0.15s ease;

  &:hover {
    color: #111827;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 28px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: #374151;

  .required-star {
    color: #ef4444;
    margin-left: 2px;
  }
`;

const StyledInputReadOnly = styled.input`
  padding: 9px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  color: #6b7280;
  background-color: #f9fafb;
  outline: none;
  cursor: not-allowed;
`;

const StyledInput = styled.input`
  padding: 9px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  color: #111827;
  background-color: #ffffff;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;

  &:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 1px #2563eb;
  }
`;

const ActionsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CancelButton = styled.button`
  padding: 8px 18px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background-color: #ffffff;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease;

  &:hover {
    background-color: #f3f4f6;
    border-color: #9ca3af;
  }
`;

const SaveButton = styled.button`
  padding: 8px 18px;
  border: none;
  border-radius: 6px;
  background-color: #2563eb;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s ease, transform 0.1s ease;

  &:hover {
    background-color: #1d4ed8;
  }

  &:active {
    transform: scale(0.98);
  }
`;

/**
 * EditCategoryItemModal - Modal for editing a category item
 * @param {boolean} isOpen - Whether modal is visible
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler ({ id, name })
 * @param {object} categoryItem - Category item to edit { id, name }
 * @param {string} parentCategoryName - Name of the parent category
 * @param {string} subCategoryName - Name of the subcategory
 */
const EditCategoryItemModal = ({
    isOpen,
    onClose,
    onSave,
    categoryItem = null,
    parentCategoryName = "",
    subCategoryName = "",
}) => {
    const [itemName, setItemName] = useState("");

    useEffect(() => {
        if (categoryItem) {
            setItemName(categoryItem.name || "");
        }
    }, [categoryItem, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!itemName.trim()) return;
        if (onSave) {
            onSave({ id: categoryItem?.id, name: itemName.trim() });
        }
        onClose();
    };

    return (
        <ModalOverlay onClick={onClose}>
            <ModalCard onClick={(e) => e.stopPropagation()}>
                <HeaderRow>
                    <HeaderTitles>
                        <ModalParentTitle>Parent Category - {parentCategoryName}</ModalParentTitle>
                        <ModalParentTitle>Sub Category - {subCategoryName}</ModalParentTitle>
                        <ModalTitle>Edit Category</ModalTitle>
                        <ModalSubtitle>Select a sub category name.</ModalSubtitle>
                    </HeaderTitles>
                    <CloseButton onClick={onClose} title="Close">
                        <FiX />
                    </CloseButton>
                </HeaderRow>

                <form onSubmit={handleSubmit}>
                    <FormGrid>
                        <FormGroup>
                            <Label>Category Item ID</Label>
                            <StyledInputReadOnly
                                type="text"
                                value={categoryItem?.id || ""}
                                disabled
                                readOnly
                            />
                        </FormGroup>

                        <FormGroup>
                            <Label>
                                Category Item Name
                                <span className="required-star">*</span>
                            </Label>
                            <StyledInput
                                type="text"
                                value={itemName}
                                onChange={(e) => setItemName(e.target.value)}
                                required
                                autoFocus
                            />
                        </FormGroup>
                    </FormGrid>

                    <ActionsRow>
                        <CancelButton type="button" onClick={onClose}>
                            Cancel
                        </CancelButton>
                        <SaveButton type="submit">
                            Save Changes
                        </SaveButton>
                    </ActionsRow>
                </form>
            </ModalCard>
        </ModalOverlay>
    );
};

export default EditCategoryItemModal;
