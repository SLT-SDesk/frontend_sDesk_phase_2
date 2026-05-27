import { useState } from 'react';
import axios from 'axios';

import { CHATBOT_API_BASE, buildUrl } from '../utils/apiUtils';

const useChatbot = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [clarification, setClarification] = useState(null); // { question, options }
    const [analysisResult, setAnalysisResult] = useState(null); // { category, priority, etc. }

    const API_URL = buildUrl(CHATBOT_API_BASE, '/api/ticket');

    const analyzeDescription = async (description) => {
        if (!description || description.trim().length < 5) return;

        setLoading(true);
        setError(null);
        setClarification(null);
        setAnalysisResult(null);

        try {
            const response = await axios.post(API_URL, {
                action: 'create',
                description: description
            });

            const data = response.data;

            if (data.status === 'clarify' || data.status === 'troubleshoot') {
                setClarification({
                    question: data.question,
                    options: data.options || [],
                    status: data.status, // 'clarify' or 'troubleshoot'
                    flow_id: data.flow_id // for troubleshooting
                });
            } else if (data.status === 'success') {
                setAnalysisResult({
                    category: data.ticket.category,
                    priority: data.ticket.priority,
                    technician: data.ticket.technician,
                    description: data.ticket.description // Might be updated by troubleshooting
                });
            } else if (data.status === 'open_pdf') {
                // Handle PDF opening logic here or pass it up
                window.open(data.pdf_url, '_blank');
            }

        } catch (err) {
            console.error("Chatbot API Error:", err);
            setError("Failed to analyze description. Please select category manually.");
        } finally {
            setLoading(false);
        }
    };

    const respondToClarification = async (selection, currentDescription) => {
        setLoading(true);
        setError(null);

        // Construct payload based on what we have
        const payload = {
            action: 'clarify', // Default, but server handles 'troubleshoot' contextually via ID prefix
            description: currentDescription,
            selected_category: typeof selection === 'string' ? selection : selection.value,
            selected_label: typeof selection === 'string' ? selection : selection.label
        };

        try {
            const response = await axios.post(API_URL, payload);
            const data = response.data;

            if (data.status === 'clarify' || data.status === 'troubleshoot') {
                setClarification({
                    question: data.question,
                    options: data.options || [],
                    status: data.status,
                    flow_id: data.flow_id
                });
            } else if (data.status === 'success') {
                setClarification(null); // Clear modal
                setAnalysisResult({
                    category: data.ticket.category,
                    priority: data.ticket.priority,
                    technician: data.ticket.technician,
                    description: data.ticket.description
                });
            } else if (data.status === 'open_pdf') {
                setClarification(null);
                window.open(data.pdf_url, '_blank');
            }

        } catch (err) {
            console.error("Chatbot Clarification Error:", err);
            setError("Failed to process selection.");
        } finally {
            setLoading(false);
        }
    };

    const resetChatbot = () => {
        setClarification(null);
        setAnalysisResult(null);
        setError(null);
    };

    return {
        loading,
        error,
        clarification,
        analysisResult,
        analyzeDescription,
        respondToClarification,
        resetChatbot
    };
};

export default useChatbot;
