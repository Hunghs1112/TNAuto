// src/redux/selectors/index.ts
// Optimized selectors using reselect for memoization
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../types';

// Auth selectors
export const selectAuth = (state: RootState) => state.auth;
export const selectUserType = createSelector(
  [selectAuth],
  (auth) => auth.userType || 'customer'
);
export const selectUserId = createSelector(
  [selectAuth],
  (auth) => auth.userId || ''
);
export const selectUserName = createSelector(
  [selectAuth],
  (auth) => auth.userName || 'User'
);
export const selectUserPhone = createSelector(
  [selectAuth],
  (auth) => auth.userPhone || ''
);

// Notification selectors
export const selectNotification = (state: RootState) => state.notification;
export const selectUnreadCount = createSelector(
  [selectNotification],
  (notification) => notification.unreadCount
);
export const selectNotifications = createSelector(
  [selectNotification],
  (notification) => notification.notifications
);

// Services selectors
export const selectServices = (state: RootState) => state.services;
export const selectServicesList = createSelector(
  [selectServices],
  (services) => services.services
);

// Employee selectors
export const selectEmployee = (state: RootState) => state.employee;
export const selectCurrentEmployee = createSelector(
  [selectEmployee],
  (employee) => employee.currentEmployee
);

// Orders selectors
export const selectOrders = (state: RootState) => state.orders;
export const selectOrdersList = createSelector(
  [selectOrders],
  (orders) => orders.orders
);

// Memoized complex selectors
export const selectUserInfo = createSelector(
  [selectUserType, selectUserId, selectUserName, selectUserPhone],
  (userType, userId, userName, userPhone) => ({
    userType,
    userId,
    userName,
    userPhone,
  })
);

