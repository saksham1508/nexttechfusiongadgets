import axios from 'axios';
import { API_URL } from '../config/api';

const getApiUrl = (): string => {
  return API_URL.replace('/api', ''); // Remove /api suffix for chat service
};

const CHAT_API_URL = getApiUrl();

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
        `${CHAT_API_URL}/chat/message`,
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
        `${CHAT_API_URL}/chat/history/${sessionId}`,
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
