import { createSlice } from '@reduxjs/toolkit';

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: { items: [], unreadCount: 0 },
  reducers: {
    setNotifications: (state, action) => {
      state.items = action.payload.data;
      state.unreadCount = action.payload.unreadCount;
    },
    markAllRead: (state) => {
      state.items = state.items.map(n => ({ ...n, isRead: true }));
      state.unreadCount = 0;
    },
    addNotification: (state, action) => {
      state.items.unshift(action.payload);
      state.unreadCount += 1;
    }
  }
});

export const { setNotifications, markAllRead, addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
