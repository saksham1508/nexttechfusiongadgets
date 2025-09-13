import React, { useState, useCallback, useMemo } from 'react';
import chatService from '../services/chatService';

// Define interfaces for chat state and messages
interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

interface ChatState {
  isOpen: boolean;
  messages: ChatMessage[];
  isTyping: boolean;
  error: string | null;
  isLoadingHistory: boolean;
  isLoading: boolean;
}

// Simplified custom hook for chat functionality
const useChat = () => {
  const [chatState, setChatState] = useState<ChatState>({
    isOpen: false,
    messages: [],
    isTyping: false,
    error: null,
    isLoadingHistory: false,
    isLoading: false,
  });

  // Persist a sessionId across messages in this session
  const sessionId = useMemo(() => {
    const existing = sessionStorage.getItem('chat_session_id');
    if (existing) return existing;
    const sid = chatService.generateSessionId();
    sessionStorage.setItem('chat_session_id', sid);
    return sid;
  }, []);

  // Function to send a message using backend API
  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const newMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
    };

    setChatState(prevState => ({
      ...prevState,
      messages: [...prevState.messages, newMessage],
      isLoading: true,
      isTyping: true,
      error: null,
    }));

    try {
      const result = await chatService.sendMessage(text, sessionId);
      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: result.response,
        timestamp: new Date().toISOString(),
      };
      setChatState(prevState => ({
        ...prevState,
        messages: [...prevState.messages, botMessage],
        isLoading: false,
        isTyping: false,
      }));
    } catch (err: any) {
      setChatState(prevState => ({
        ...prevState,
        error: err.message || 'Failed to send message.',
        isLoading: false,
        isTyping: false,
      }));
    }
  }, [sessionId]);

  // Function to load chat history from backend
  const handleLoadHistory = useCallback(async () => {
    setChatState(prevState => ({ ...prevState, isLoadingHistory: true, error: null }));
    try {
      const history = await chatService.getChatHistory(sessionId);
      setChatState(prevState => ({
        ...prevState,
        messages: history.map((h) => ({
          id: h.id || `hist-${Date.now()}`,
          sender: (h as any).sender || 'bot',
          text: h.response || h.message || '',
          timestamp: (h as any).timestamp || new Date().toISOString(),
        })),
        isLoadingHistory: false,
      }));
    } catch (err: any) {
      setChatState(prevState => ({
        ...prevState,
        error: err.message || 'Failed to load chat history.',
        isLoadingHistory: false,
      }));
    }
  }, [sessionId]);

  // Functions to control chat UI state
  const handleOpenChat = useCallback(() => {
    setChatState(prevState => ({ ...prevState, isOpen: true }));
  }, []);

  const handleCloseChat = useCallback(() => {
    setChatState(prevState => ({ ...prevState, isOpen: false }));
  }, []);

  const handleToggleChat = useCallback(() => {
    setChatState(prevState => ({ ...prevState, isOpen: !prevState.isOpen }));
  }, []);

  const handleClearMessages = useCallback(() => {
    setChatState(prevState => ({ ...prevState, messages: [] }));
  }, []);

  const handleSetTyping = useCallback((isTyping: boolean) => {
    setChatState(prevState => ({ ...prevState, isTyping }));
  }, []);

  const handleClearError = useCallback(() => {
    setChatState(prevState => ({ ...prevState, error: null }));
  }, []);

  // Return the chat state and action functions
  return {
    ...chatState,
    sendMessage: handleSendMessage,
    loadHistory: handleLoadHistory,
    openChat: handleOpenChat,
    closeChat: handleCloseChat,
    toggleChat: handleToggleChat,
    clearMessages: handleClearMessages,
    setTyping: handleSetTyping,
    clearError: handleClearError,
  };
};

export default useChat;
