import React from "react";
import "./ChatbotModal.css";
import { IoMdChatbubbles, IoMdClose, IoMdHelpCircle } from "react-icons/io";

const ChatbotModal = ({ question, options, onSelect, onClose }) => {
    return (
        <div className="chatbot-modal-overlay">
            <div className="chatbot-modal-content">
                <div className="chatbot-modal-header">
                    <div className="chatbot-header-icon">
                        <IoMdChatbubbles />
                    </div>
                    <h3>SDesk Assistant</h3>
                    <button className="chatbot-modal-close" onClick={onClose} aria-label="Close">
                        <IoMdClose />
                    </button>
                </div>
                <div className="chatbot-modal-body">
                    <div className="chatbot-question-container">
                        <IoMdHelpCircle className="question-icon" />
                        <p className="chatbot-question">{question}</p>
                    </div>
                    <div className="chatbot-options-container">
                        {options.map((option, index) => {
                            const label = typeof option === "string" ? option : option.label;
                            const value = typeof option === "string" ? option : option;

                            return (
                                <button
                                    key={index}
                                    className="chatbot-option-btn"
                                    onClick={() => onSelect(value)}
                                >
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatbotModal;
