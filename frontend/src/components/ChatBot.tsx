import React, { useEffect, useRef } from 'react';
import * as LucideIcons from 'lucide-react';
import useChat from '../hooks/useChat';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

interface ChatMessageType {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

const ChatBot: React.FC = () => {
  const {
    messages,
    isOpen,
    isLoading,
    error,
    isTyping,
    sendMessage,
    toggleChat,
    closeChat,
    clearMessages,
    clearError,
  } = useChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = (message: string) => {
    sendMessage(message);
  };

  const quickQuestions = [
    "What are your best smartphones?",
    "I need help with my order",
    "Show me gaming laptops under $1000",
    "What's your return policy?",
    "I need technical support"
  ];

  if (!isOpen) {
    return (
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center z-50"
        aria-label="Open chat"
      >
        <LucideIcons.MessageCircle className="w-6 h-6" />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col z-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <LucideIcons.MessageCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold">NexFuga Assistant</h3>
            <p className="text-xs text-blue-100">
              {isTyping ? 'Typing...' : 'Online • Ready to help'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {messages.length > 0 && (
            <button
              onClick={clearMessages}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
              title="Clear chat"
            >
              <LucideIcons.Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={closeChat}
            className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
            title="Close chat"
          >
            <LucideIcons.X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Welcome Message */}
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <LucideIcons.MessageCircle className="w-8 h-8 text-white" />
            </div>
            <h4 className="font-semibold text-gray-800 mb-2">
              Welcome to NexFuga Support!
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              I'm here to help you find products, answer questions, and assist with your orders.
            </p>
            
            {/* Quick Questions */}
            <div className="space-y-2">
              <p className="text-xs text-gray-500 font-medium">Quick questions:</p>
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSendMessage(question)}
                  className="block w-full text-left text-xs bg-gray-50 hover:bg-gray-100 p-2 rounded border transition-colors"
                  disabled={isLoading}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
            <LucideIcons.AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-red-800">{error}</p>
              <button
                onClick={clearError}
                className="text-xs text-red-600 hover:text-red-800 mt-1"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Chat Messages */}
        {messages.map((message: ChatMessageType) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="max-w-xs lg:max-w-md px-4 py-2 bg-gray-100 rounded-lg rounded-bl-none">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">AI</span>
                </div>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <ChatInput
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        disabled={!!error}
      />
    </div>
  );
};

export default ChatBot;
