import { useState, useCallback } from 'react';

export type RefreshableQuery = {
  refetch?: () => Promise<unknown>;
  isFetching?: boolean;
};

export function useRefreshQueries(queries: RefreshableQuery[]) {
  const [refreshing, setRefreshing] = useState(false);

  const actualRefreshing = refreshing || queries.some((q) => q.isFetching);

  const handleRefresh = useCallback(async () => {
    if (refreshing) return;

    const refetchFns = queries
      .map((q) => q.refetch)
      .filter((fn): fn is () => Promise<unknown> => typeof fn === 'function');

    if (refetchFns.length === 0) {
      return;
    }

    setRefreshing(true);
    try {
      await Promise.all(refetchFns.map((fn) => fn()));
    } finally {
      setRefreshing(false);
    }
  }, [refreshing, queries]);

  return { refreshing: actualRefreshing, onRefresh: handleRefresh };
}
