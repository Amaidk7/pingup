import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/axios";

const initialState = {
  messages: [],
};

// fetch messages
export const fetchMessages = createAsyncThunk(
  "messages/fetchMessages",
  async ({ token, userId }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(
        "/api/message/get",
        { to_user_id: userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) return data.messages;
      return rejectWithValue(data.message);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    addMessage: (state, action) => {
      // duplicate check
      const exists = state.messages.find((m) => m._id === action.payload._id);
      if (!exists) {
        state.messages.push(action.payload);
      }
    },
    removeMessage: (state, action) => {
      state.messages = state.messages.filter((m) => m._id !== action.payload);
    },
    resetMessages: (state) => {
      state.messages = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchMessages.fulfilled, (state, action) => {
      state.messages = action.payload || [];
    });
  },
});

export const { addMessage, removeMessage, resetMessages } = messagesSlice.actions;
export default messagesSlice.reducer;
