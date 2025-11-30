import axios from 'axios';

const API_URL = 'https://pharmnexus.onrender.com/api';

export const checkInteractions = async (drugs: string[]) => {
    const response = await axios.post(`${API_URL}/check_interactions`, { drugs });
    return response.data;
};

export const agentQuery = async (message: string, context?: any) => {
    const response = await axios.post(`${API_URL}/agent_query`, {
        message,
        current_drugs: context?.current_drugs || [],
        analysis_result: context?.analysis_result || null
    });
    return response.data;
};

export const getAnalytics = async () => {
    const response = await axios.get(`${API_URL}/analytics/summary`);
    return response.data;
};

export const connectAgentWebSocket = (
    onMessage: (data: any) => void,
    onError: (error: any) => void
) => {
    const ws = new WebSocket('wss://pharmnexus.onrender.com/agent/ws');

    ws.onopen = () => {
        console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        onMessage(data);
    };

    ws.onerror = (error) => {
        onError(error);
    };

    ws.onclose = () => {
        console.log('WebSocket disconnected');
    };

    return ws;
};

