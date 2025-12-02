import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';

const store = configureStore({
  reducer: {
    user: userReducer,
  },
});

// Hydrate Redux store from localStorage on startup
const hydrateStore = () => {
  const token = localStorage.getItem('token');
  const id = localStorage.getItem('id');
  const name = localStorage.getItem('name');
  const email = localStorage.getItem('email');
  const branch = localStorage.getItem('branch');
  const cgpa = localStorage.getItem('cgpa');
  const role = localStorage.getItem('role');

  if (token && id) {
    store.dispatch({
      type: 'user/setUser',
      payload: {
        u_id: id,
        id: id,
        token,
        name,
        email,
        branch,
        cgpa: parseFloat(cgpa) || 0,
        role,
      },
    });
  }
};

// Call hydration on store creation
hydrateStore();

export default store;
