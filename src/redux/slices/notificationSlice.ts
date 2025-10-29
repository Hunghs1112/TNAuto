// src/redux/slices/notificationSlice.ts (Updated: Added image_url to Notification interface)
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Notification {
  id: string;
  recipient_id: string;
  recipient_type: string;
  message: string;
  read: boolean;
  image_url?: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter(n => !n.read).length;
      console.log('notificationSlice: Set notifications, unreadCount:', state.unreadCount); // Debug
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
      console.log('notificationSlice: Added notification, new unreadCount:', state.unreadCount); // Debug
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount -= 1;
        console.log('notificationSlice: Marked as read, new unreadCount:', state.unreadCount); // Debug
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach(n => {
        n.read = true;
      });
      state.unreadCount = 0;
      console.log('notificationSlice: Marked all as read'); // Debug
    },
    deleteNotification: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        state.unreadCount -= 1;
      }
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
      console.log('notificationSlice: Deleted notification, new count:', state.notifications.length); // Debug
    },
    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
      console.log('notificationSlice: Set unreadCount:', state.unreadCount); // Debug
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
      console.log('notificationSlice: Cleared notifications'); // Debug
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
      console.log('notificationSlice: Set loading:', state.loading); // Debug
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      console.log('notificationSlice: Set error:', state.error); // Debug
    },
  },
});

export const { 
  setNotifications, 
  addNotification, 
  markAsRead, 
  markAllAsRead,
  deleteNotification,
  setUnreadCount,
  clearNotifications, 
  setLoading, 
  setError 
} = notificationSlice.actions;

export default notificationSlice.reducer;