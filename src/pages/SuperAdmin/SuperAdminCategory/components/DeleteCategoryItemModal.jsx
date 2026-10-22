import React from "react";
import styled from "styled-components";

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
  max-width: 440px;
  padding: 24px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  font-family: inherit;
`;

const ModalTitle = styled.h2`
  margin: 0 0 10px 0;
  font-size: 18px;
  font-weight: 700;
  color: #111827;
`;

const ModalDescription = styled.p`
  margin: 0 0 24px 0;
  font-size: 13.5px;
  line-height: 1.5;
  color: #4b5563;
`;

const ActionsRow = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
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

const DeleteConfirmButton = styled.button`
  padding: 8px 20px;
  border: none;
  border-radius: 6px;
  background-color: #dc2626;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s ease, transform 0.1s ease;

  &:hover {
    background-color: #b91c1c;
  }

  &:active {
    transform: scale(0.98);
  }
`;

/**
 * DeleteCategoryItemModal - Confirmation modal for deleting a category item
 * @param {boolean} isOpen
 * @param {function} onClose
 * @param {function} onConfirm
 * @param {object} categoryItem - Category item being deleted
 */
const DeleteCategoryItemModal = ({ isOpen, onClose, onConfirm, categoryItem = null }) => {
    if (!isOpen) return null;

    return (
        <ModalOverlay onClick={onClose}>
            <ModalCard onClick={(e) => e.stopPropagation()}>
                <ModalTitle>Delete Category Item?</ModalTitle>
                <ModalDescription>
                    Are you sure you want to delete this category item? This action cannot be
                    undone.
                </ModalDescription>
                <ActionsRow>
                    <CancelButton type="button" onClick={onClose}>
                        Cancel
                    </CancelButton>
                    <DeleteConfirmButton
                        type="button"
                        onClick={() => {
                            if (onConfirm) onConfirm(categoryItem);
                            onClose();
                        }}
                    >
                        Delete
                    </DeleteConfirmButton>
                </ActionsRow>
            </ModalCard>
        </ModalOverlay>
    );
};

export default DeleteCategoryItemModal;
