export const getApiBaseUrl = (): string => {
    return (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:8000";
};

export const getChatbotApiBaseUrl = (): string => {
    return (import.meta as any).env?.VITE_CHATBOT_API_BASE_URL || "https://dpdlab1.slt.lk:8448";
};

export const buildUrl = (base: string, endpoint: string): string => {
    const baseUrl = base.endsWith('/') ? base.slice(0, -1) : base;
    const endpointUrl = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${baseUrl}${endpointUrl}`;
};

export const API_BASE = getApiBaseUrl();
export const CHATBOT_API_BASE = getChatbotApiBaseUrl();