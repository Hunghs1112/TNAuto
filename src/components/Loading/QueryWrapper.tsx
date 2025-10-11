// src/components/Loading/QueryWrapper.tsx - Wrapper for handling query states
import React from 'react';
import { UseQueryHookResult } from '@reduxjs/toolkit/query/react';
import ScreenLoader from './ScreenLoader';
import ErrorView from './ErrorView';
import EmptyView from './EmptyView';

interface QueryWrapperProps<T> {
  /**
   * RTK Query hook result (from useGetXXXQuery)
   */
  query: UseQueryHookResult<T, any>;
  
  /**
   * Children to render when data is loaded successfully
   */
  children: (data: T) => React.ReactNode;
  
  /**
   * Custom loading component (optional)
   */
  loadingComponent?: React.ReactNode;
  
  /**
   * Custom error component (optional)
   */
  errorComponent?: React.ReactNode;
  
  /**
   * Custom error message (optional)
   */
  errorMessage?: string;
  
  /**
   * Check if data is empty and show empty state (optional)
   */
  checkEmpty?: (data: T) => boolean;
  
  /**
   * Custom empty component (optional)
   */
  emptyComponent?: React.ReactNode;
  
  /**
   * Custom empty message (optional)
   */
  emptyMessage?: string;
  
  /**
   * Icon for empty state (optional)
   */
  emptyIcon?: string;
}

/**
 * Wrapper component that handles all query states (loading, error, empty, success)
 * 
 * Usage:
 * ```tsx
 * const query = useGetProductsQuery();
 * 
 * return (
 *   <QueryWrapper
 *     query={query}
 *     errorMessage="Lỗi tải sản phẩm"
 *     checkEmpty={(data) => data.length === 0}
 *     emptyMessage="Chưa có sản phẩm nào"
 *     emptyIcon="cube-outline"
 *   >
 *     {(products) => (
 *       <FlatList data={products} ... />
 *     )}
 *   </QueryWrapper>
 * );
 * ```
 */
export default function QueryWrapper<T>({
  query,
  children,
  loadingComponent,
  errorComponent,
  errorMessage,
  checkEmpty,
  emptyComponent,
  emptyMessage,
  emptyIcon,
}: QueryWrapperProps<T>) {
  const { data, isLoading, error, refetch } = query;

  // Show loading state
  if (isLoading) {
    return <>{loadingComponent || <ScreenLoader />}</>;
  }

  // Show error state
  if (error) {
    return (
      <>
        {errorComponent || (
          <ErrorView 
            message={errorMessage || 'Đã xảy ra lỗi khi tải dữ liệu'}
            onRetry={refetch}
          />
        )}
      </>
    );
  }

  // Show empty state (if checkEmpty is provided)
  if (data && checkEmpty && checkEmpty(data)) {
    return (
      <>
        {emptyComponent || (
          <EmptyView 
            message={emptyMessage || 'Không có dữ liệu'}
            icon={emptyIcon}
          />
        )}
      </>
    );
  }

  // Show success state with data
  if (data) {
    return <>{children(data)}</>;
  }

  // Fallback: show error if no data
  return (
    <ErrorView 
      message="Không thể tải dữ liệu"
      onRetry={refetch}
    />
  );
}

