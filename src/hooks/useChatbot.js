import { useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { CHATBOT_API_BASE, buildUrl } from '../utils/apiUtils';

const useChatbot = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [clarification, setClarification] = useState(null); // { question, options, status, flow_id }
    const [analysisResult, setAnalysisResult] = useState(null); // { category, priority, technician, description }
    const [isCompleted, setIsCompleted] = useState(false);

    const API_URL = buildUrl(CHATBOT_API_BASE, '/api/ticket');
    const isCompletedRef = useRef(false);

    const analyzeDescription = useCallback(async (description, reporterRole = '') => {
        if (!description || description.trim().length < 5) return;
        if (isCompletedRef.current) return;

        setLoading(true);
        setError(null);
        setClarification(null);

        try {
            const response = await axios.post(API_URL, {
                action: 'create',
                description: description.trim(),
                reporter_role: reporterRole
            });

            const data = response.data || {};
            const ticket = data.ticket || {};
            const detectedCategory = ticket.category || data.category;

            // Terminal state: Category is identified
            if (data.status === 'success' || detectedCategory) {
                isCompletedRef.current = true;
                setIsCompleted(true);
                setClarification(null);
                setAnalysisResult({
                    category: detectedCategory,
                    priority: ticket.priority || data.priority || ticket.priority_label,
                    technician: ticket.technician || data.technician,
                    description: ticket.description || description.trim()
                });
                return;
            }

            // Question / Clarification state
            if (data.status === 'clarify' || data.status === 'troubleshoot') {
                setClarification({
                    question: data.question,
                    options: data.options || data.suggestions || [],
                    status: data.status,
                    flow_id: data.flow_id || data.scenario
                });
            } else if (data.status === 'open_pdf') {
                isCompletedRef.current = true;
                setIsCompleted(true);
                setClarification(null);
                if (data.pdf_url) {
                    window.open(data.pdf_url, '_blank');
                }
            } else if (data.status === 'resolved') {
                isCompletedRef.current = true;
                setIsCompleted(true);
                setClarification(null);
            }
        } catch (err) {
            console.error("Chatbot API Error:", err);
            setError("Failed to analyze description. Please select category manually.");
        } finally {
            setLoading(false);
        }
    }, [API_URL]);

    const respondToClarification = useCallback(async (selection, currentDescription, reporterRole = '') => {
        if (isCompletedRef.current) return;

        setLoading(true);
        setError(null);

        const selectedVal = typeof selection === 'string' ? selection : (selection.value || selection.category || selection.label);
        const selectedLabel = typeof selection === 'string' ? selection : (selection.label || selection.category || selection.value);

        const payload = {
            action: 'clarify',
            description: currentDescription,
            reporter_role: reporterRole,
            selected_category: selectedVal,
            selected_label: selectedLabel
        };

        try {
            const response = await axios.post(API_URL, payload);
            const data = response.data || {};
            const ticket = data.ticket || {};
            const detectedCategory = ticket.category || data.category;

            // Terminal state: Category is identified
            if (data.status === 'success' || detectedCategory) {
                isCompletedRef.current = true;
                setIsCompleted(true);
                setClarification(null);
                setAnalysisResult({
                    category: detectedCategory,
                    priority: ticket.priority || data.priority || ticket.priority_label,
                    technician: ticket.technician || data.technician,
                    description: ticket.description || currentDescription
                });
                return;
            }

            // Next question / Clarification state
            if (data.status === 'clarify' || data.status === 'troubleshoot') {
                setClarification({
                    question: data.question,
                    options: data.options || data.suggestions || [],
                    status: data.status,
                    flow_id: data.flow_id || data.scenario
                });
            } else if (data.status === 'open_pdf') {
                isCompletedRef.current = true;
                setIsCompleted(true);
                setClarification(null);
                if (data.pdf_url) {
                    window.open(data.pdf_url, '_blank');
                }
            } else if (data.status === 'resolved') {
                isCompletedRef.current = true;
                setIsCompleted(true);
                setClarification(null);
            }
        } catch (err) {
            console.error("Chatbot Clarification Error:", err);
            setError("Failed to process selection.");
        } finally {
            setLoading(false);
        }
    }, [API_URL]);

    const resetChatbot = useCallback(() => {
        isCompletedRef.current = false;
        setIsCompleted(false);
        setClarification(null);
        setAnalysisResult(null);
        setError(null);
    }, []);

    return {
        loading,
        error,
        clarification,
        analysisResult,
        isCompleted,
        analyzeDescription,
        respondToClarification,
        resetChatbot
    };
};

export default useChatbot;

