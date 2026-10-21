import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { FiX } from "react-icons/fi";

// Styled Components for Edit Category Modal matching user's screenshot
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
`;

const ModalTitle = styled.h2`
  margin: 0;
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

const StyledSelect = styled.select`
  padding: 9px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  color: #111827;
  background-color: #ffffff;
  outline: none;
  cursor: pointer;
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
 * EditCategoryModal - Modal matching user's screenshot
 * @param {boolean} isOpen - Whether modal is visible
 * @param {function} onClose - Function to close modal
 * @param {function} onSave - Function to save edited category
 * @param {object} category - Category object to edit { id, name, parentName }
 * @param {Array} parentOptions - Available parent category options
 * @param {Array} existingNames - List of all existing parent category names (for duplicate check)
 */
const EditCategoryModal = ({
  isOpen,
  onClose,
  onSave,
  category = null,
  parentOptions = [],
  existingNames = [],
}) => {
  const [categoryId, setCategoryId] = useState("");
  const [parentCategoryName, setParentCategoryName] = useState("");

  useEffect(() => {
    if (category) {
      // Show category_code (e.g. CAT006) not the raw UUID
      const displayCode = (category.category_code || category.id || "").replace(/^MAIN/i, "CAT");
      setCategoryId(displayCode);
      setParentCategoryName(category.name || "");
    }
  }, [category, isOpen]);

  if (!isOpen) return null;

  // Check if the name is unchanged from original
  const isNameUnchanged = parentCategoryName.trim() === (category?.name || "").trim();

  // Check if name already exists (exclude current category's original name)
  const isDuplicate = !isNameUnchanged && existingNames.some(
    (n) => n.trim().toLowerCase() === parentCategoryName.trim().toLowerCase()
  );

  const canSave = !isNameUnchanged && !isDuplicate && parentCategoryName.trim().length > 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSave) return;
    if (onSave) {
      onSave({
        ...category,
        // Always send the real UUID from the original category object,
        // NOT the display code (categoryId is only used for the read-only field)
        id: category?.id,
        name: parentCategoryName.trim(),
      });
    }
    onClose();
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalCard onClick={(e) => e.stopPropagation()}>
        <HeaderRow>
          <HeaderTitles>
            <ModalTitle>Edit Category</ModalTitle>
            <ModalSubtitle>Select a parent category name.</ModalSubtitle>
          </HeaderTitles>
          <CloseButton onClick={onClose} title="Close">
            <FiX />
          </CloseButton>
        </HeaderRow>

        <form onSubmit={handleSubmit}>
          <FormGrid>
            <FormGroup>
              <Label>Category ID</Label>
              <StyledInput
                type="text"
                value={categoryId}
                readOnly
                disabled
                style={{ backgroundColor: "#f9fafb", color: "#6b7280", cursor: "not-allowed" }}
              />
            </FormGroup>

            <FormGroup>
              <Label>
                Parent Category Name
                <span className="required-star">*</span>
              </Label>
              <StyledInput
                type="text"
                value={parentCategoryName}
                onChange={(e) => setParentCategoryName(e.target.value)}
                required
                placeholder="Category name"
              />
            </FormGroup>
          </FormGrid>

          <ActionsRow>
            <CancelButton type="button" onClick={onClose}>
              Cancel
            </CancelButton>
            <SaveButton
              type="submit"
              disabled={isNameUnchanged}
              style={isNameUnchanged ? { opacity: 0.5, cursor: "not-allowed" } : {}}
            >
              Save Changes
            </SaveButton>
          </ActionsRow>
        </form>
      </ModalCard>
    </ModalOverlay>
  );
};

export default EditCategoryModal;
