import React from "react";
import styled from "styled-components";
import { FiX } from "react-icons/fi";

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  backdrop-filter: blur(2px);
  padding: 16px;
`;

const ModalCard = styled.div`
  background: #ffffff;
  border-radius: 12px;
  width: 100%;
  max-width: 440px;
  padding: 32px 24px 28px 24px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  font-family: inherit;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const IconCircle = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid #ef4444;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ef4444;
  margin-bottom: 18px;
`;

const ModalTitle = styled.h2`
  margin: 0 0 8px 0;
  font-size: 16.5px;
  font-weight: 700;
  color: #dc2626;
`;

const ModalDescription = styled.p`
  margin: 0 0 24px 0;
  font-size: 13.5px;
  color: #4b5563;
  line-height: 1.5;
`;

const OkButton = styled.button`
  padding: 8px 40px;
  min-width: 100px;
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
 * ParentCategoryDeleteErrorModal - Modal shown when parent category deletion is unsuccessful
 * @param {boolean} isOpen - Whether modal is open
 * @param {function} onClose - Function to close modal
 * @param {string} title - Optional title override
 * @param {string} message - Optional message override
 */
const ParentCategoryDeleteErrorModal = ({
    isOpen,
    onClose,
    title = "Parent Category Delete Unsuccessfully",
    message = "The Parent Category could not be deleted.",
}) => {
    if (!isOpen) return null;

    return (
        <ModalOverlay onClick={onClose}>
            <ModalCard onClick={(e) => e.stopPropagation()}>
                <IconCircle>
                    <FiX strokeWidth={2.8} size={24} />
                </IconCircle>

                <ModalTitle>{title}</ModalTitle>
                <ModalDescription>{message}</ModalDescription>

                <OkButton type="button" onClick={onClose}>
                    OK
                </OkButton>
            </ModalCard>
        </ModalOverlay>
    );
};

export default ParentCategoryDeleteErrorModal;
