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
export const selectAuthToken = createSelector(
  [selectAuth],
  (auth) => auth.token || ''
);
export const selectAuthMode = createSelector(
  [selectAuth],
  (auth) => auth.authMode || ''
);

// Garage selectors
export const selectGarageContext = (state: RootState) => state.garageContext;
export const selectGarageCode = createSelector(
  [selectGarageContext],
  (garageContext) => garageContext.activeGarageCode || garageContext.garageCode || ''
);
export const selectGarageName = createSelector(
  [selectGarageContext],
  (garageContext) => garageContext.garageName || ''
);
export const selectGarageAvatarUrl = createSelector(
  [selectGarageContext],
  (garageContext) => {
    const activeGarageCode = garageContext.activeGarageCode || garageContext.garageCode;
    const activeGarage = (garageContext.savedGarages || []).find(
      (garage) => garage.garageCode === activeGarageCode,
    );

    return garageContext.avatarUrl || activeGarage?.avatarUrl || '';
  }
);
export const selectGarageBannerUrl = createSelector(
  [selectGarageContext],
  (garageContext) => {
    const activeGarageCode = garageContext.activeGarageCode || garageContext.garageCode;
    const activeGarage = (garageContext.savedGarages || []).find(
      (garage) => garage.garageCode === activeGarageCode,
    );

    return garageContext.bannerUrl || activeGarage?.bannerUrl || '';
  }
);
export const selectSavedGarages = createSelector(
  [selectGarageContext],
  (garageContext) => garageContext.savedGarages || []
);
export const selectActiveGarage = createSelector(
  [selectGarageContext, selectGarageCode],
  (garageContext, garageCode) => {
    if (!garageCode) {
      return null;
    }

    const savedGarage = (garageContext.savedGarages || []).find((garage) => garage.garageCode === garageCode);

    if (savedGarage) {
      return savedGarage;
    }

    return {
      garageId: garageContext.garageId,
      garageCode: garageCode,
      garageName: garageContext.garageName,
      address: garageContext.address,
      avatarUrl: garageContext.avatarUrl,
      bannerUrl: garageContext.bannerUrl,
      status: garageContext.status,
      isLocked: false,
      lockReason: '',
    };
  }
);
export const selectGarageResolved = createSelector(
  [selectGarageContext],
  (garageContext) => garageContext.resolved
);
export const selectHasGarageContext = createSelector(
  [selectGarageCode, selectGarageResolved],
  (garageCode, resolved) => Boolean(garageCode && resolved)
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
  [selectUserType, selectUserId, selectUserName, selectUserPhone, selectGarageCode, selectGarageName],
  (userType, userId, userName, userPhone, garageCode, garageName) => ({
    userType,
    userId,
    userName,
    userPhone,
    garageCode,
    garageName,
  })
);
