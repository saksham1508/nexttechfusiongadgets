import React from 'react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

interface ChatMessageProps {
  message: ChatMessage;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (message.sender === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-xs lg:max-w-md px-4 py-2 bg-blue-600 text-white rounded-lg rounded-br-none">
          <p className="text-sm">{message.text}</p>
          <p className="text-xs text-blue-100 mt-1">{formatTime(message.timestamp)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-xs lg:max-w-md px-4 py-2 bg-gray-100 text-gray-800 rounded-lg rounded-bl-none">
        <div className="flex items-center mb-2">
          <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-2">
            <span className="text-white text-xs font-bold">AI</span>
          </div>
          <span className="text-xs text-gray-500">NexFuga Assistant</span>
        </div>
        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
        <p className="text-xs text-gray-500 mt-2">{formatTime(message.timestamp)}</p>
      </div>
    </div>
  );
};

export default ChatMessage;