import React, { useState, useCallback } from 'react';

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

// This is a simplified mock for a chat API or service
const mockChatService = {
  sendMessage: async (messageText: string): Promise<ChatMessage> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    const botResponseText = `Echo: ${messageText}`;
    return {
      id: `bot-${Date.now()}`,
      sender: 'bot',
      text: botResponseText,
      timestamp: new Date().toISOString(),
    };
  },
  loadHistory: async (): Promise<ChatMessage[]> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return [
      { id: 'hist1', sender: 'bot', text: 'Welcome to the chat!', timestamp: new Date(Date.now() - 60000).toISOString() },
      { id: 'hist2', sender: 'user', text: 'Hello there!', timestamp: new Date(Date.now() - 50000).toISOString() },
      { id: 'hist3', sender: 'bot', text: 'How can I help you today?', timestamp: new Date(Date.now() - 40000).toISOString() },
    ];
  },
};

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

  // Function to send a message
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
      isTyping: true, // Simulate bot typing after user sends message
    }));

    try {
      const botResponse = await mockChatService.sendMessage(text);
      setChatState(prevState => ({
        ...prevState,
        messages: [...prevState.messages, botResponse],
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
  }, []);

  // Function to load chat history
  const handleLoadHistory = useCallback(async () => {
    setChatState(prevState => ({ ...prevState, isLoadingHistory: true, error: null }));
    try {
      const history = await mockChatService.loadHistory();
      setChatState(prevState => ({
        ...prevState,
        messages: history,
        isLoadingHistory: false,
      }));
    } catch (err: any) {
      setChatState(prevState => ({
        ...prevState,
        error: err.message || 'Failed to load chat history.',
        isLoadingHistory: false,
      }));
    }
  }, []);

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
