# Implementation Plan: Garage Admin Home Screen

## Overview

Kế hoạch triển khai tính năng cải thiện giao diện HomeScreen cho Garage Admin. Tính năng này bao gồm dashboard tổng quan với KPI cards, danh sách đơn hàng theo trạng thái, quick actions, và tích hợp đầy đủ với Manager API endpoints. Triển khai sử dụng React Native, Redux Toolkit, và RTK Query với TypeScript.

## Tasks

- [x] 1. Thiết lập Manager API với RTK Query
  - Tạo file `src/services/managerApi.ts` với RTK Query API definition
  - Định nghĩa 3 endpoints: `getManagerHomeSummary`, `getManagerHomeOrders`, `getManagerHomeNotifications`
  - Cấu hình retry logic với exponential backoff (1s, 2s, 4s)
  - Thêm tag types `['ManagerHome']` cho cache invalidation
  - _Requirements: 1.2, 2.2, 8.2_

- [ ]* 1.1 Viết unit tests cho Manager API configuration
  - Test retry logic với mocked failed requests
  - Test cache invalidation khi refetch
  - _Requirements: 1.2, 5.2_

- [x] 2. Tạo TypeScript types và interfaces
  - Tạo file `src/types/managerHome.ts` với các types: `ManagerHomeSummary`, `ManagerNotification`, `GarageSummary`, `OrdersState`, `ManagerActions`, `KPI`
  - Định nghĩa constants cho order statuses: `PENDING_STATUSES`, `PROCESSING_STATUSES`, `CLOSED_STATUSES`
  - Định nghĩa cache constants: `CACHE_TTL = 24 * 60 * 60 * 1000`
  - _Requirements: 1.1, 2.3, 10.5_

- [ ] 3. Implement useManagerHomeScreen hook
  - [x] 3.1 Tạo file `src/hooks/useManagerHomeScreen.ts` với hook logic
    - Gọi 3 Manager API queries song song
    - Transform API responses thành UI-ready format
    - Compute KPIs từ summary data
    - Categorize orders theo status (pending, processing, overdue)
    - Limit orders list tối đa 5 items
    - Handle loading states và errors
    - _Requirements: 1.2, 1.3, 2.2, 2.3, 2.4_

  - [ ]* 3.2 Viết property test cho order categorization
    - **Property 1: Order Categorization Correctness**
    - **Validates: Requirements 2.3**
    - Sử dụng fast-check với 100 iterations
    - Test mỗi order chỉ xuất hiện trong đúng 1 category
    - Test không có order bị mất hoặc duplicate

  - [ ]* 3.3 Viết property test cho order list limiting
    - **Property 2: Order List Limiting**
    - **Validates: Requirements 2.4**
    - Test output list luôn có tối đa 5 orders bất kể input size

  - [x] 3.4 Implement auto-refresh logic
    - Setup timer refresh KPIs mỗi 60 giây
    - Setup timer refresh notifications mỗi 30 giây
    - Cleanup timers khi component unmount
    - _Requirements: 1.6, 8.5_

  - [ ]* 3.5 Viết unit tests cho useManagerHomeScreen
    - Test KPI computation từ summary data
    - Test order filtering và categorization
    - Test auto-refresh timers
    - Test cleanup on unmount
    - _Requirements: 1.2, 2.3, 6.5_

- [ ] 4. Implement cache management utilities
  - [x] 4.1 Tạo file `src/utils/cacheManager.ts`
    - Implement `isCacheValid(metadata)` function
    - Implement `getCacheAge(metadata)` function trả về string tiếng Việt
    - Implement `getCachedData(queryKey)` function
    - _Requirements: 10.1, 10.4, 10.5_

  - [ ]* 4.2 Viết property test cho cache expiration logic
    - **Property 5: Cache Expiration Logic**
    - **Validates: Requirements 10.5, 10.6**
    - Test cache expired khi age > 24h
    - Test cache valid khi age < 24h

  - [ ]* 4.3 Viết unit tests cho cache utilities
    - Test `isCacheValid` với fresh và expired cache
    - Test `getCacheAge` format output tiếng Việt
    - _Requirements: 10.4, 10.5_

- [x] 5. Checkpoint - Đảm bảo core logic hoạt động
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement KPICard component
  - [x] 6.1 Tạo file `src/components/ManagerHome/KPICard.tsx`
    - Nhận props: `label`, `value`, `isLoading`, `testID`
    - Hiển thị skeleton loader khi `isLoading = true`
    - Format số với dấu phẩy (1000 → "1,000")
    - Apply styling từ design system
    - _Requirements: 1.1, 1.5, 5.1_

  - [ ]* 6.2 Viết component tests cho KPICard
    - Test hiển thị label và value đúng
    - Test skeleton loader khi loading
    - Test number formatting
    - Test accessibility labels
    - _Requirements: 1.1, 7.6_

- [ ] 7. Implement OrderCard component
  - [x] 7.1 Tạo file `src/components/ManagerHome/OrderCard.tsx`
    - Nhận props: `order`, `onPress`, `showClaimButton`, `onClaim`, `isClaiming`
    - Hiển thị customer name, license plate, service name, timestamp
    - Handle press event để navigate
    - Apply styling với minimum touch target 44x44
    - _Requirements: 2.5, 2.6, 7.5_

  - [ ]* 7.2 Viết property test cho OrderCard required fields
    - **Property 3: Order Card Required Fields**
    - **Validates: Requirements 2.6**
    - Test output luôn chứa customer name, license plate, service name, timestamp

  - [ ]* 7.3 Viết component tests cho OrderCard
    - Test hiển thị order info đúng
    - Test onPress callback
    - Test minimum touch target size
    - Test accessibility
    - _Requirements: 2.5, 2.6, 7.5, 7.6_

- [ ] 8. Implement error handling utilities
  - [x] 8.1 Tạo file `src/utils/errorHandler.ts`
    - Implement `handleApiError(error, cachedData)` function
    - Implement `getErrorMessage(error)` function trả về message tiếng Việt
    - Handle các error types: network, 401, 500, 404, 408
    - Integrate với toast notifications
    - _Requirements: 5.2, 5.3, 5.4, 5.5_

  - [ ]* 8.2 Viết property test cho API error fallback
    - **Property 4: API Error Fallback Consistency**
    - **Validates: Requirements 1.4, 5.2, 5.3, 5.4**
    - Test system hiển thị cached data khi có error
    - Test không crash với bất kỳ error type nào

  - [ ]* 8.3 Viết unit tests cho error handler
    - Test error message mapping cho từng error type
    - Test fallback to cached data
    - Test 401 error navigation to login
    - _Requirements: 5.2, 5.3, 5.4_

- [x] 9. Implement KPISection component
  - Tạo file `src/components/ManagerHome/KPISection.tsx`
  - Render SectionHeader với title "Tổng quan"
  - Render KPIGrid với 5 KPICard components
  - Apply responsive layout với proper spacing
  - _Requirements: 1.1, 7.1, 7.2_

- [ ]* 9.1 Viết component tests cho KPISection
  - Test render 5 KPI cards
  - Test responsive layout
  - _Requirements: 1.1, 7.2_

- [ ] 10. Implement OrdersList components
  - [x] 10.1 Tạo file `src/components/ManagerHome/AvailableOrdersList.tsx`
    - Render danh sách pending orders
    - Limit tối đa 5 orders
    - Hiển thị empty state nếu không có orders
    - Show skeleton loaders khi loading
    - _Requirements: 2.1, 2.4, 2.7, 5.1_

  - [x] 10.2 Tạo file `src/components/ManagerHome/EmployeeOrdersList.tsx`
    - Render danh sách processing orders
    - Limit tối đa 5 orders
    - Hiển thị empty state nếu không có orders
    - Show skeleton loaders khi loading
    - _Requirements: 2.1, 2.4, 2.7, 5.1_

  - [ ]* 10.3 Viết component tests cho OrdersList
    - Test render orders correctly
    - Test limit 5 orders
    - Test empty state
    - Test skeleton loaders
    - _Requirements: 2.4, 2.7, 5.1_

- [x] 11. Checkpoint - Đảm bảo UI components hoạt động
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Implement QuickActionsSection component
  - Tạo file `src/components/ManagerHome/QuickActionsSection.tsx`
  - Render 3 action buttons: "Quản lý đơn", "Offers", "Warranty"
  - Mỗi button có icon và text label
  - Minimum touch target 44x44
  - Handle navigation cho mỗi action
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 7.5_

- [ ]* 12.1 Viết component tests cho QuickActionsSection
  - Test render 3 buttons
  - Test navigation callbacks
  - Test minimum touch target size
  - Test accessibility
  - _Requirements: 3.1, 3.6, 7.5, 7.6_

- [x] 13. Implement NotificationButton component
  - Tạo file `src/components/ManagerHome/NotificationButton.tsx`
  - Hiển thị notification icon với badge
  - Badge hiển thị số lượng unread notifications
  - Badge màu đỏ khi có unread > 0
  - Handle press để navigate to Notification screen
  - Animation nhẹ khi có notification mới
  - _Requirements: 8.1, 8.3, 8.4, 8.6_

- [ ]* 13.1 Viết component tests cho NotificationButton
  - Test badge hiển thị đúng số lượng
  - Test badge color khi có/không có unread
  - Test navigation callback
  - _Requirements: 8.3, 8.4_

- [x] 14. Implement GarageSummaryCard component
  - Tạo file `src/components/ManagerHome/GarageSummaryCard.tsx`
  - Hiển thị garage name, address, avatar, banner
  - Load images với placeholder (lazy loading)
  - Disable garage switching cho garage_admin role
  - Apply responsive layout
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 6.6_

- [ ]* 14.1 Viết component tests cho GarageSummaryCard
  - Test hiển thị garage info
  - Test disable switching cho admin role
  - Test image lazy loading
  - _Requirements: 4.1, 4.5, 6.6_

- [ ] 15. Implement ManagerHomeScreen container
  - [x] 15.1 Tạo file `src/screens/ManagerHomeScreen.tsx`
    - Setup layout với Screen wrapper, LinearGradient background
    - Integrate useManagerHomeScreen hook
    - Compose tất cả child components: Header, KPISection, OrdersList, QuickActions
    - Implement pull-to-refresh functionality
    - Handle offline indicator
    - Apply SafeAreaView và responsive layout
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.6, 7.1, 7.2, 7.3, 10.2_

  - [ ] 15.2 Implement memoization cho performance
    - Wrap child components với React.memo
    - Use useMemo cho computed values (filtered orders, formatted KPIs)
    - Use useCallback cho event handlers
    - _Requirements: 6.2, 6.3, 6.4, 6.5_

  - [ ]* 15.3 Viết integration tests cho ManagerHomeScreen
    - Test API integration với MSW mocked responses
    - Test error handling với mocked errors
    - Test pull-to-refresh
    - Test offline mode với cached data
    - _Requirements: 1.2, 5.2, 5.6, 10.2_

  - [ ]* 15.4 Viết component tests cho ManagerHomeScreen
    - Test render all sections
    - Test navigation callbacks
    - Test loading states
    - Test error states
    - _Requirements: 1.1, 2.1, 5.1_

- [ ] 16. Implement role-based routing trong HomeScreen
  - Modify file `src/screens/HomeScreen.tsx`
  - Check userType từ auth state
  - Route to ManagerHomeScreen nếu userType là "garage_admin" hoặc "garage_manager"
  - Route to appropriate screen cho các roles khác
  - Check isLoggedIn trước khi hiển thị personal data
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [ ]* 16.1 Viết unit tests cho role-based routing
  - Test routing cho garage_admin
  - Test routing cho garage_manager
  - Test routing cho other roles
  - Test redirect khi chưa login
  - _Requirements: 9.1, 9.2, 9.3, 9.6_

- [ ] 17. Implement offline support và sync logic
  - [ ] 17.1 Tạo file `src/utils/offlineManager.ts`
    - Implement network status detection
    - Implement auto-sync khi network restored
    - Implement cache timestamp tracking
    - Display offline indicator khi mất mạng
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.6_

  - [ ]* 17.2 Viết integration tests cho offline support
    - Test hiển thị cached data khi offline
    - Test auto-sync khi online
    - Test expired cache warning
    - _Requirements: 10.2, 10.3, 10.6_

- [ ] 18. Checkpoint - Đảm bảo tích hợp hoàn chỉnh
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 19. Implement accessibility enhancements
  - Add accessibilityLabel và accessibilityHint cho tất cả interactive elements
  - Verify contrast ratio tối thiểu 4.5:1
  - Test với screen reader
  - Support dynamic font sizing
  - _Requirements: 7.4, 7.5, 7.6, 7.7_

- [ ]* 19.1 Viết accessibility tests
  - Test no accessibility violations với jest-axe
  - Test proper accessibility labels
  - Test minimum touch target sizes
  - _Requirements: 7.4, 7.5, 7.6_

- [ ] 20. Performance optimization và testing
  - [ ] 20.1 Optimize render performance
    - Verify initial render < 1000ms
    - Implement image lazy loading với placeholders
    - Optimize re-renders với memoization
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [ ]* 20.2 Viết performance tests
    - Test initial render time < 1000ms
    - Test no unnecessary re-renders
    - _Requirements: 6.1, 6.5_

- [ ] 21. Final integration và polish
  - Verify tất cả API endpoints hoạt động đúng
  - Test error scenarios (network error, 401, 500, 404, 408)
  - Test auto-refresh timers (60s cho KPIs, 30s cho notifications)
  - Verify responsive layout trên các screen sizes (320px - 768px)
  - Test pull-to-refresh functionality
  - Verify offline mode với cached data
  - _Requirements: 1.2, 1.6, 5.2, 5.3, 5.4, 5.6, 7.2, 8.5, 10.2_

- [ ] 22. Final checkpoint - Đảm bảo tất cả tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks đánh dấu `*` là optional (testing tasks) và có thể skip để MVP nhanh hơn
- Mỗi task reference đến specific requirements để đảm bảo traceability
- Property tests validate universal correctness properties từ design document
- Unit tests và component tests validate specific examples và edge cases
- Integration tests verify API integration và error handling
- Accessibility tests đảm bảo WCAG compliance
- Performance tests verify render time và optimization
- Checkpoints đảm bảo incremental validation tại các điểm quan trọng
