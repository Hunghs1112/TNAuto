import { useMemo } from "react";
import { ServiceOrder } from "../../types/api.types";
import {
  useGetManagerHomeNotificationsQuery,
  useGetManagerHomeOrdersQuery,
  useGetManagerHomeSummaryQuery,
} from "../../services/managerApi";

type ManagerHomeHookInput = {
  isEnabled: boolean;
  fallbackAvailableOrders: ServiceOrder[];
  fallbackAssignedOrders: ServiceOrder[];
};

const PENDING_STATUSES = new Set(["received", "pending", "confirmed"]);
const PROCESSING_STATUSES = new Set(["in_progress", "processing", "ready_for_pickup"]);
const CLOSED_STATUSES = new Set(["completed", "cancelled", "canceled"]);

const toSafeDate = (value?: string | null) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const isSameLocalDate = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const dedupeById = (orders: ServiceOrder[]) => {
  const seen = new Set<string>();
  const result: ServiceOrder[] = [];

  orders.forEach((item) => {
    const id = String(item.id);
    if (seen.has(id)) {
      return;
    }

    seen.add(id);
    result.push(item);
  });

  return result;
};

export const useManagerHomeScreen = ({
  isEnabled,
  fallbackAvailableOrders,
  fallbackAssignedOrders,
}: ManagerHomeHookInput) => {
  const summaryQuery = useGetManagerHomeSummaryQuery(undefined, { skip: !isEnabled });
  const ordersQuery = useGetManagerHomeOrdersQuery(undefined, { skip: !isEnabled });
  const notificationsQuery = useGetManagerHomeNotificationsQuery(undefined, { skip: !isEnabled });

  const managerOrders = useMemo(() => {
    if (ordersQuery.data && ordersQuery.data.length > 0) {
      return ordersQuery.data;
    }

    return dedupeById([...fallbackAvailableOrders, ...fallbackAssignedOrders]);
  }, [fallbackAssignedOrders, fallbackAvailableOrders, ordersQuery.data]);

  const pendingOrders = useMemo(() => {
    return managerOrders.filter((order) => PENDING_STATUSES.has(String(order.status || "").toLowerCase()));
  }, [managerOrders]);

  const processingOrders = useMemo(() => {
    return managerOrders.filter((order) => PROCESSING_STATUSES.has(String(order.status || "").toLowerCase()));
  }, [managerOrders]);

  const overdueOrders = useMemo(() => {
    const now = new Date();
    return managerOrders.filter((order) => {
      const status = String(order.status || "").toLowerCase();
      if (CLOSED_STATUSES.has(status)) {
        return false;
      }

      const dueDate = toSafeDate(order.delivery_date);
      if (!dueDate) {
        return false;
      }

      return dueDate.getTime() < now.getTime();
    });
  }, [managerOrders]);

  const completedTodayCount = useMemo(() => {
    const today = new Date();

    const summaryValue = Number(summaryQuery.data?.stats?.completed_today);
    if (!Number.isNaN(summaryValue) && summaryValue >= 0) {
      return summaryValue;
    }

    return managerOrders.filter((order) => {
      const status = String(order.status || "").toLowerCase();
      if (status !== "completed") {
        return false;
      }

      const doneDate = toSafeDate(order.delivery_date || order.updated_at || order.created_at);
      return doneDate ? isSameLocalDate(doneDate, today) : false;
    }).length;
  }, [managerOrders, summaryQuery.data?.stats?.completed_today]);

  const alertsCount = useMemo(() => {
    const summaryValue = Number(summaryQuery.data?.stats?.alerts);
    if (!Number.isNaN(summaryValue) && summaryValue >= 0) {
      return summaryValue;
    }

    return notificationsQuery.data?.filter((item) => !item.is_read || item.is_read === 0).length || 0;
  }, [notificationsQuery.data, summaryQuery.data?.stats?.alerts]);

  const kpis = useMemo(
    () => [
      { key: "pending", label: "Don cho xu ly", value: pendingOrders.length },
      { key: "processing", label: "Don dang xu ly", value: processingOrders.length },
      { key: "overdue", label: "Don qua han", value: overdueOrders.length },
      { key: "today_done", label: "Hoan thanh hom nay", value: completedTodayCount },
      { key: "alerts", label: "Thong bao chua doc", value: alertsCount },
    ],
    [alertsCount, completedTodayCount, overdueOrders.length, pendingOrders.length, processingOrders.length],
  );

  return {
    kpis,
    pendingOrders,
    processingOrders,
    overdueOrders,
    isLoading: summaryQuery.isFetching || ordersQuery.isFetching || notificationsQuery.isFetching,
  };
};
