import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/axios";

const initialState = {
  connections: [],
  pendingConnections: [],
  followers: [],
  following: [],
};

// fetch connections
export const fetchConnections = createAsyncThunk(
  "connections/fetchConnections",
  async (token, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/api/user/connections", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        return data;
      } else {
        return rejectWithValue(data.message);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const connectionsSlice = createSlice({
  name: "connections",
  initialState,
  reducers: {},

  extraReducers: (builder) => {

    builder.addCase(fetchConnections.fulfilled, (state, action) => {
      if (action.payload) {

        state.connections = action.payload.connections || [];
        state.pendingConnections = action.payload.pendingConnections || [];
        state.followers = action.payload.followers || [];
        state.following = action.payload.following || [];

      }
    });

    builder.addCase(fetchConnections.rejected, (state) => {
      // agar API fail ho jaye to state reset
      state.connections = [];
      state.pendingConnections = [];
      state.followers = [];
      state.following = [];
    });

  },
});

export default connectionsSlice.reducer;