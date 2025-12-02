import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Set user (called on login)
    setUser: (state, action) => {
      state.user = action.payload;
      state.error = null;
    },
    // Update specific user fields (e.g., after profile update)
    updateUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    // Clear user (called on logout)
    clearUser: (state) => {
      state.user = null;
      state.error = null;
    },
    // Set error
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setUser, updateUser, clearUser, setError } = userSlice.actions;
export default userSlice.reducer;
