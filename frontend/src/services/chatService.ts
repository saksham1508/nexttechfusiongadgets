import axios from 'axios';

declare const process: { env: { NODE_ENV: string; REACT_APP_API_URL: string } };

const getApiUrl = (): string => {
  const env = process.env.NODE_ENV;
  
  switch (env) {
    case 'production':
      return process.env.REACT_APP_API_URL || 'https://api.nexttechfusiongadgets.com';
    case 'development':
      return process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
    case 'test':
      return 'http://localhost:3001/api';
    default:
      return 'http://localhost:3000/api';
  }
};

const API_URL = getApiUrl();

export interface ChatMessage {
  id: string;
  message: string;
  response: string;
  timestamp: Date;
  intent?: string;
  requiresHuman?: boolean;
}

export interface ChatResponse {
  success: boolean;
  response: string;
  intent: {
    intent: string;
    category: string;
    urgency: string;
    keywords: string[];
    requiresHuman: boolean;
  };
  sessionId: string;
}

class ChatService {
  private getAuthHeader() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async sendMessage(message: string, sessionId: string): Promise<ChatResponse> {
    try {
      const response = await axios.post(
        `${API_URL}/chat/message`,
        { message, sessionId },
        { headers: this.getAuthHeader() }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to send message');
    }
  }

  async getChatHistory(sessionId: string): Promise<ChatMessage[]> {
    try {
      const response = await axios.get(
        `${API_URL}/chat/history/${sessionId}`,
        { headers: this.getAuthHeader() }
      );
      return response.data.history;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get chat history');
    }
  }

  generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default new ChatService();
