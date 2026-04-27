// src/types/managerHome.ts
// Types and constants for Manager Home Screen feature

import { ServiceOrder } from './api.types';

// ==================== API Response Types ====================

/**
 * Statistics returned from Manager Home Summary API
 */
export interface ManagerSummaryStats {
  pending_orders?: number;
  processing_orders?: number;
  completed_today?: number;
  overdue_orders?: number;
  alerts?: number;
  [key: string]: number | string | null | undefined;
}

/**
 * Manager Home Summary response from API
 */
export interface ManagerHomeSummary {
  stats?: ManagerSummaryStats;
  [key: string]: unknown;
}

/**
 * Manager Notification from API
 */
export interface ManagerNotification {
  id: string | number;
  title?: string | null;
  body?: string | null;
  is_read?: boolean | number;
  created_at?: string;
  [key: string]: unknown;
}

// ==================== UI Component Types ====================

/**
 * Garage summary information for display
 */
export interface GarageSummary {
  name: string;
  code?: string;
  address?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  canChangeGarage: boolean;
}

/**
 * Orders state for Manager Home Screen
 */
export interface OrdersState {
  sortedAvailableOrders: ServiceOrder[];
  availableLoading: boolean;
  sortedAssignedOrders: ServiceOrder[];
  assignedLoading: boolean;
  claimingOrderId: string | null;
}

/**
 * Manager action handlers
 */
export interface ManagerActions {
  onNotificationPress: () => void;
  onOfferPress: () => void;
  onWarrantyPress: () => void;
  onOrderPress: (id: string) => void;
  onClaimOrder: (id: string) => void;
  onGaragePress: () => void;
  onViewMore: () => void;
}

/**
 * KPI (Key Performance Indicator) display data
 */
export interface KPI {
  key: string;
  label: string;
  value: number;
}

// ==================== Order Status Constants ====================

/**
 * Order statuses considered as "pending" (waiting to be processed)
 */
export const PENDING_STATUSES = new Set(['received', 'pending', 'confirmed']);

/**
 * Order statuses considered as "processing" (currently being worked on)
 */
export const PROCESSING_STATUSES = new Set(['in_progress', 'processing', 'ready_for_pickup']);

/**
 * Order statuses considered as "closed" (finished or cancelled)
 */
export const CLOSED_STATUSES = new Set(['completed', 'cancelled', 'canceled']);

// ==================== Cache Constants ====================

/**
 * Cache Time-To-Live: 24 hours in milliseconds
 */
export const CACHE_TTL = 24 * 60 * 60 * 1000;
