import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import chatService, { ChatMessage, ChatResponse } from '../../services/chatService';

interface ChatState {
  messages: ChatMessage[];
  sessionId: string;
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
  isTyping: boolean;
}

const initialState: ChatState = {
  messages: [],
  sessionId: '',
  isOpen: false,
  isLoading: false,
  error: null,
  isTyping: false,
};

// Async thunks
export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ message, sessionId }: { message: string; sessionId: string }) => {
    const response = await chatService.sendMessage(message, sessionId);
    return { message, response };
  }
);

export const loadChatHistory = createAsyncThunk(
  'chat/loadHistory',
  async (sessionId: string) => {
    return await chatService.getChatHistory(sessionId);
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    openChat: (state) => {
      state.isOpen = true;
      if (!state.sessionId) {
        state.sessionId = chatService.generateSessionId();
      }
    },
    closeChat: (state) => {
      state.isOpen = false;
    },
    toggleChat: (state) => {
      state.isOpen = !state.isOpen;
      if (state.isOpen && !state.sessionId) {
        state.sessionId = chatService.generateSessionId();
      }
    },
    clearMessages: (state) => {
      state.messages = [];
      state.sessionId = chatService.generateSessionId();
    },
    setTyping: (state, action: PayloadAction<boolean>) => {
      state.isTyping = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Send message
      .addCase(sendMessage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.isTyping = true;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isTyping = false;
        const { message, response } = action.payload;
        
        const newMessage: ChatMessage = {
          id: `msg_${Date.now()}`,
          message,
          response: response.response,
          timestamp: new Date(),
          intent: response.intent.intent,
          requiresHuman: response.intent.requiresHuman,
        };
        
        state.messages.push(newMessage);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.isTyping = false;
        state.error = action.error.message || 'Failed to send message';
      })
      // Load history
      .addCase(loadChatHistory.fulfilled, (state, action) => {
        state.messages = action.payload;
      });
  },
});

export const {
  openChat,
  closeChat,
  toggleChat,
  clearMessages,
  setTyping,
  clearError,
} = chatSlice.actions;

export default chatSlice.reducer;