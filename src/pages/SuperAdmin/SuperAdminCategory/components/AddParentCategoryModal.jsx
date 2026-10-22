import React, { useState, useEffect, useMemo } from "react";
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
  max-width: 540px;
  padding: 24px 28px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  position: relative;
  font-family: inherit;
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #111827;
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

const StyledInput = styled.input`
  padding: 9px 12px;
  border: 1px solid ${(props) => (props.$hasError ? "#ef4444" : "#d1d5db")};
  border-radius: 8px;
  font-size: 14px;
  color: #111827;
  background-color: #ffffff;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;

  &:focus {
    border-color: ${(props) => (props.$hasError ? "#ef4444" : "#2563eb")};
    box-shadow: 0 0 0 1px ${(props) => (props.$hasError ? "#ef4444" : "#2563eb")};
  }

  &::placeholder {
    color: #9ca3af;
  }

  &:disabled,
  &[readonly] {
    background-color: #f9fafb;
    color: #6b7280;
    cursor: not-allowed;
    border-color: #e5e7eb;
  }
`;

const ErrorText = styled.span`
  font-size: 12px;
  color: #ef4444;
  margin-top: 2px;
`;

const ActionsRow = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
`;

const CancelButton = styled.button`
  padding: 8px 20px;
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

const AddButton = styled.button`
  padding: 8px 20px;
  border: none;
  border-radius: 6px;
  background-color: #0066cc;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s ease, transform 0.1s ease;

  &:hover {
    background-color: #0052a3;
  }

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

/**
 * AddParentCategoryModal - Modal for adding a new Parent Category
 * ID is auto-generated and read-only (user cannot edit it).
 *
 * @param {boolean} isOpen - Whether modal is visible
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler ({ category_code, name })
 * @param {string} defaultCategoryId - Auto-generated unique category ID
 * @param {Array} existingCategoryNames - Existing category names for duplicate check
 */
const AddParentCategoryModal = ({
  isOpen,
  onClose,
  onSave,
  defaultCategoryId = "",
  existingCategoryNames = [],
}) => {
  const [categoryName, setCategoryName] = useState("");

  useEffect(() => {
    if (isOpen) {
      setCategoryName("");
    }
  }, [isOpen]);

  const isNameDuplicate = useMemo(() => {
    const trimmed = categoryName.trim().toLowerCase();
    if (!trimmed) return false;
    return existingCategoryNames.some((name) => {
      if (!name) return false;
      return String(name).trim().toLowerCase() === trimmed;
    });
  }, [categoryName, existingCategoryNames]);

  if (!isOpen) return null;

  const canSubmit = categoryName.trim().length > 0 && !isNameDuplicate;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    if (onSave) {
      onSave({
        category_code: defaultCategoryId,
        name: categoryName.trim(),
      });
    }
    onClose();
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalCard onClick={(e) => e.stopPropagation()}>
        <HeaderRow>
          <ModalTitle>Add Parent Category</ModalTitle>
          <CloseButton onClick={onClose} title="Close">
            <FiX />
          </CloseButton>
        </HeaderRow>

        <form onSubmit={handleSubmit}>
          <FormGrid>
            <FormGroup>
              <Label>
                Parent Category ID
                <span className="required-star">*</span>
              </Label>
              <StyledInput
                type="text"
                value={defaultCategoryId || "Auto-generated"}
                readOnly
                disabled
                title="Category ID is auto-generated by the system"
              />
            </FormGroup>

            <FormGroup>
              <Label>
                Parent Category Name
                <span className="required-star">*</span>
              </Label>
              <StyledInput
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="e.g. IT Help Desk"
                required
                autoFocus
                $hasError={isNameDuplicate}
              />
              {isNameDuplicate && (
                <ErrorText>Category Name already exists.</ErrorText>
              )}
            </FormGroup>
          </FormGrid>

          <ActionsRow>
            <CancelButton type="button" onClick={onClose}>
              Cancel
            </CancelButton>
            <AddButton type="submit" disabled={!canSubmit}>
              Add Category
            </AddButton>
          </ActionsRow>
        </form>
      </ModalCard>
    </ModalOverlay>
  );
};

export default AddParentCategoryModal;
