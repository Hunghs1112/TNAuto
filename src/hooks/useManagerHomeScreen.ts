import { useMemo, useEffect } from 'react';
import { useGetManagerHomeSummaryQuery } from '../services/managerApi';
import { ServiceOrder } from '../types/api.types';
import { CLOSED_STATUSES, KPI, ManagerHomeSummary, PENDING_STATUSES, PROCESSING_STATUSES } from '../types/managerHome';

interface UseManagerHomeScreenInput {
  isEnabled: boolean;
}

interface UseManagerHomeScreenOutput {
  kpis: KPI[];
  isLoading: boolean;
  error?: unknown;
  refetchSummary: () => void;
}

function categorizeOrders(orders: ServiceOrder[]) {
  const now = new Date();
  const pending = orders.filter((order) => PENDING_STATUSES.has(order.status?.toLowerCase()));
  const processing = orders.filter((order) => PROCESSING_STATUSES.has(order.status?.toLowerCase()));
  const overdue = orders.filter((order) => {
    if (CLOSED_STATUSES.has(order.status?.toLowerCase())) {
      return false;
    }

    if (order.delivery_date) {
      const deliveryDate = new Date(order.delivery_date);
      return deliveryDate < now;
    }

    return false;
  });

  return { pending, processing, overdue };
}

function computeKPIs(summary: ManagerHomeSummary | null | undefined): KPI[] {
  const stats = summary?.stats || {};

  return [
    {
      key: 'pending',
      label: 'Don cho xu ly',
      value: Number(stats.pending_orders) || 0,
    },
    {
      key: 'processing',
      label: 'Don dang xu ly',
      value: Number(stats.processing_orders) || 0,
    },
    {
      key: 'overdue',
      label: 'Don qua han',
      value: Number(stats.overdue_orders) || 0,
    },
    {
      key: 'completed_today',
      label: 'Hoan thanh hom nay',
      value: Number(stats.completed_today) || 0,
    },
    {
      key: 'notifications',
      label: 'Canh bao',
      value: Number(stats.alerts) || 0,
    },
  ];
}

export function useManagerHomeScreen({
  isEnabled,
}: UseManagerHomeScreenInput): UseManagerHomeScreenOutput {
  const {
    data: summaryData,
    isLoading: summaryLoading,
    error: summaryError,
    refetch: refetchSummary,
  } = useGetManagerHomeSummaryQuery(undefined, {
    skip: !isEnabled,
  });

  const kpis = useMemo(
    () => computeKPIs(summaryData),
    [summaryData],
  );

  useEffect(() => {
    if (!isEnabled) return;

    const summaryInterval = setInterval(() => {
      refetchSummary();
    }, 60000);

    return () => {
      clearInterval(summaryInterval);
    };
  }, [isEnabled, refetchSummary]);

  return {
    kpis,
    isLoading: summaryLoading,
    error: summaryError,
    refetchSummary,
  };
}

export { categorizeOrders, computeKPIs };
