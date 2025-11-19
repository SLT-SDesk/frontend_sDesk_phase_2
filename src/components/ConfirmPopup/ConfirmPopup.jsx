import React from 'react';
import './ConfirmPopup.css';
import { IoIosClose } from 'react-icons/io';

const ConfirmPopup = ({ message, onConfirm, onCancel }) => {
    return (
        <div className="ConfirmPopup-modal">
            <div className="ConfirmPopup-content">
                <div className="ConfirmPopup-header">
                    <h2>Confirm Action</h2>
                    <button onClick={onCancel}>
                        <IoIosClose size={30} />
                    </button>
                </div>
                <div className="ConfirmPopup-body">
                    <p>{message}</p>
                </div>
                <div className="ConfirmPopup-footer">
                    <button className="ConfirmPopup-cancel" onClick={onCancel}>
                        Cancel
                    </button>
                    <button className="ConfirmPopup-confirm" onClick={onConfirm}>
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmPopup;