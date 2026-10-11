import styled from "styled-components";

export const CategoryContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  min-height: 90vh;
  background-color: #f3f4f6;
  font-family: inherit;
`;

export const DirectionBar = styled.div`
  display: flex;
  align-items: center;
  background: #3f51b5;
  color: #e0e7ff;
  height: 48px;
  padding-left: 20px;
  font-size: 14px;
  font-weight: 500;
  margin: 0px 0px 20px 0px;

  strong {
    color: white;
    margin-left: 5px;
  }
`;

export const BreadcrumbLink = styled.span`
  color: ${(props) => (props.$active ? "#ffffff" : "#c7d2fe")};
  font-weight: ${(props) => (props.$active ? "600" : "400")};
  cursor: ${(props) => (props.$clickable ? "pointer" : "default")};
  margin: 0 4px;
  transition: color 0.15s ease;

  &:hover {
    ${(props) => props.$clickable && `text-decoration: underline; color: #ffffff;`}
  }
`;

export const CardContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow: hidden;
  background-color: #ffffff;
  border-radius: 8px;
  margin: 0 20px 20px 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

export const TitleBarWrapper = styled.div`
  display: flex;
  flex-direction: row;
  height: 70px;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f3f4f6;
  padding: 0 24px;
`;

export const TitleWithIcon = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  font-size: 22px;
  font-weight: 700;
  color: #111827;
`;

export const IconBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: #e0e7ff;
  color: #4f46e5;
  border-radius: 8px;
`;

export const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background-color: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  color: #374151;
  font-size: 13px;
  font-weight: 500;
  padding: 6px 12px;
  cursor: pointer;
  margin-right: 8px;
  transition: all 0.2s ease;

  &:hover {
    background-color: #e5e7eb;
    color: #111827;
  }
`;

export const AddButton = styled.button`
  display: flex;
  align-items: center;
  border-radius: 6px;
  border: none;
  padding: 8px 16px;
  gap: 6px;
  font-weight: 600;
  font-size: 14px;
  background-color: #ef4444;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.1s ease;

  &:hover {
    background-color: #dc2626;
  }

  &:active {
    transform: scale(0.98);
  }
`;

export const ControlsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  height: 60px;
  align-items: center;
  width: 100%;
  background-color: white;
  justify-content: space-between;
  padding: 0 24px;
  border-bottom: 1px solid #f3f4f6;
  gap: 16px;
`;

export const FiltersGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
`;

export const SelectBox = styled.select`
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background-color: white;
  color: #111827;
  font-size: 14px;
  outline: none;
  min-width: 160px;
  cursor: pointer;

  &:focus {
    border-color: #4f46e5;
  }
`;

export const SearchBox = styled.div`
  display: flex;
  align-items: center;
  background-color: white;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 6px 12px;
  width: 260px;
  margin-left: auto;

  svg {
    color: #9ca3af;
    margin-right: 8px;
    flex-shrink: 0;
  }
`;

export const SearchInput = styled.input`
  border: none;
  outline: none;
  font-size: 14px;
  width: 100%;
  color: #111827;
  background: transparent;

  &::placeholder {
    color: #9ca3af;
  }
`;

export const TableWrapper = styled.div`
  flex: 1;
  overflow-y: auto;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
`;

export const TableHead = styled.thead`
  tr {
    background-color: #f3f4f6;
  }

  th {
    padding: 12px 24px;
    font-weight: 600;
    font-size: 13px;
    color: #374151;
    border-bottom: 2px solid #e5e7eb;
  }
`;

export const TableBody = styled.tbody`
  tr {
    transition: background-color 0.15s ease;

    &:hover {
      background-color: #f9fafb;
    }
  }

  td {
    padding: 12px 24px;
    font-size: 14px;
    color: #4b5563;
    border-bottom: 1px solid #e5e7eb;
  }
`;

export const CategoryCodeCell = styled.td`
  padding: 12px 24px;
  font-size: 14px;
  border-bottom: 1px solid #e5e7eb;
  color: #2563eb;
  font-weight: 600;
`;

export const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  margin-right: 12px;
  padding: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s ease, transform 0.1s ease;

  color: ${(props) => (props.$variant === "delete" ? "#ef4444" : "#3b82f6")};

  &:hover {
    color: ${(props) => (props.$variant === "delete" ? "#dc2626" : "#2563eb")};
    transform: scale(1.1);
  }
`;

export const EmptyRowCell = styled.td`
  text-align: center;
  padding: 32px 24px;
  color: #6b7280;
  font-size: 14px;
  border-bottom: 1px solid #e5e7eb;
`;

export const FooterWrapper = styled.div`
  padding: 16px 24px;
  font-size: 13px;
  color: #6b7280;
  border-top: 1px solid #e5e7eb;
  background-color: white;
`;

/* Modal styled components */
export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(17, 24, 39, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
`;

export const ModalDialog = styled.div`
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
`;

export const ModalCloseBtn = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  color: #9ca3af;
  cursor: pointer;

  &:hover {
    color: #4b5563;
  }
`;

export const ModalBody = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: 13px;
    font-weight: 500;
    color: #374151;
  }

  input, select {
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
    color: #111827;
    outline: none;

    &:focus {
      border-color: #4f46e5;
      box-shadow: 0 0 0 1px #4f46e5;
    }
  }
`;

export const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 20px;
  background-color: #f9fafb;
  border-top: 1px solid #e5e7eb;
`;

export const ModalCancelBtn = styled.button`
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    background-color: #f3f4f6;
  }
`;

export const ModalSubmitBtn = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background-color: #ef4444;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background-color: #dc2626;
  }
`;
