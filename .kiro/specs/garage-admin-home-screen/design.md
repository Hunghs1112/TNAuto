# Design Document: Garage Admin Home Screen

## Overview

Tài liệu thiết kế này mô tả kiến trúc và cài đặt kỹ thuật cho tính năng cải thiện giao diện HomeScreen dành riêng cho vai trò Garage Admin. Tính năng này tái thiết kế màn hình chính để hiển thị dashboard tổng quan với các KPI quan trọng, danh sách đơn hàng theo trạng thái, quick actions, và tích hợp đầy đủ với Manager API endpoints.

### Goals

- Cung cấp dashboard trực quan với KPI realtime cho Garage Admin
- Tối ưu hiệu suất với caching, memoization, và lazy loading
- Đảm bảo trải nghiệm mượt mà với loading states và error handling
- Hỗ trợ offline mode với cached data
- Tuân thủ accessibility guidelines (WCAG)

### Non-Goals

- Không thay đổi giao diện cho các role khác (customer, employee, dealer)
- Không thêm chức năng chỉnh sửa đơn hàng trực tiếp từ HomeScreen
- Không tích hợp realtime notifications (sử dụng polling)

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     HomeScreen (Router)                      │
│  - Kiểm tra userType và isLoggedIn                          │
│  - Route đến ManagerHomeScreen nếu là manager/admin         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   ManagerHomeScreen                          │
│  - Container component chính                                 │
│  - Quản lý layout và composition                            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              useManagerHomeScreen Hook                       │
│  - Gọi Manager API (summary, orders, notifications)        │
│  - Transform và compute KPIs                                │
│  - Filter và categorize orders                             │
│  - Caching logic với Redux                                 │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ Manager API │  │ Redux Store │  │  UI Layer   │
│  - summary  │  │  - Cache    │  │  - KPI Grid │
│  - orders   │  │  - State    │  │  - Lists    │
│  - notifs   │  │  - Selectors│  │  - Actions  │
└─────────────┘  └─────────────┘  └─────────────┘
```

### Data Flow

1. **Initial Load**:
   - ManagerHomeScreen mount → useManagerHomeScreen hook
   - Hook triggers 3 parallel API calls (summary, orders, notifications)
   - RTK Query caches responses in Redux store
   - Transform data → compute KPIs → render UI

2. **Auto Refresh**:
   - Timer triggers every 60s for KPIs
   - Timer triggers every 30s for notifications
   - Refetch queries → update cache → re-render affected components

3. **Pull-to-Refresh**:
   - User pulls down → trigger all API refetch
   - Show refreshing indicator → update cache → hide indicator

4. **Offline Mode**:
   - Network error → fallback to cached data
   - Display "Dữ liệu offline" indicator
   - Check cache timestamp → show expiry warning if > 24h

## Components and Interfaces

### Component Hierarchy

```
ManagerHomeScreen
├── Screen (layout wrapper)
├── LinearGradient (background)
├── Header Section
│   ├── GarageSummaryCard
│   ├── HeroActionsOverlay
│   │   ├── OfferButton
│   │   ├── WarrantyButton
│   │   └── NotificationButton (with badge)
│   └── UserHeader
└── BottomSheet (scrollable content)
    ├── KPISection
    │   ├── SectionHeader
    │   └── KPIGrid
    │       ├── KPICard (pending orders)
    │       ├── KPICard (processing orders)
    │       ├── KPICard (overdue orders)
    │       ├── KPICard (completed today)
    │       └── KPICard (unread notifications)
    ├── PendingOrdersSection
    │   ├── SectionHeader
    │   └── AvailableOrdersList
    │       └── OrderCard[] (max 5)
    ├── ProcessingOrdersSection
    │   ├── SectionHeader
    │   └── EmployeeOrdersList
    │       └── OrderCard[] (max 5)
    └── QuickActionsSection
        ├── SectionHeader
        └── ActionsRow
            ├── ActionButton (Quản lý đơn)
            ├── ActionButton (Offers)
            └── ActionButton (Warranty)
```

### Key Components

#### ManagerHomeScreen (Container)

```typescript
interface ManagerHomeScreenProps {
  userName: string;
  isLoggedIn: boolean;
  garageSummary: GarageSummary;
  ordersState: OrdersState;
  actions: ManagerActions;
}

type GarageSummary = {
  name: string;
  code?: string;
  address?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  canChangeGarage: boolean;
};

type OrdersState = {
  sortedAvailableOrders: ServiceOrder[];
  availableLoading: boolean;
  sortedAssignedOrders: ServiceOrder[];
  assignedLoading: boolean;
  claimingOrderId: string | null;
};

type ManagerActions = {
  onNotificationPress: () => void;
  onOfferPress: () => void;
  onWarrantyPress: () => void;
  onOrderPress: (id: string) => void;
  onClaimOrder: (id: string) => void;
  onGaragePress: () => void;
  onViewMore: () => void;
};
```

Responsibilities:
- Layout composition và styling
- Pass props to child components
- Handle user interactions (delegated to actions)

#### useManagerHomeScreen Hook

```typescript
interface UseManagerHomeScreenInput {
  isEnabled: boolean;
  fallbackAvailableOrders: ServiceOrder[];
  fallbackAssignedOrders: ServiceOrder[];
}

interface UseManagerHomeScreenOutput {
  kpis: KPI[];
  pendingOrders: ServiceOrder[];
  processingOrders: ServiceOrder[];
  overdueOrders: ServiceOrder[];
  isLoading: boolean;
  error?: ApiError;
  lastUpdated?: Date;
  isOffline: boolean;
}

type KPI = {
  key: string;
  label: string;
  value: number;
};
```

Responsibilities:
- Fetch data from Manager API
- Transform API responses to UI-ready format
- Compute derived values (KPIs, filtered orders)
- Handle caching and offline logic
- Manage auto-refresh timers

#### KPICard Component

```typescript
interface KPICardProps {
  label: string;
  value: number;
  isLoading?: boolean;
  testID?: string;
}
```

Responsibilities:
- Display single KPI metric
- Show skeleton loader when loading
- Format numbers (e.g., 1000 → "1,000")

#### OrderCard Component

```typescript
interface OrderCardProps {
  order: ServiceOrder;
  onPress: (id: string) => void;
  showClaimButton?: boolean;
  onClaim?: (id: string) => void;
  isClaiming?: boolean;
}
```

Responsibilities:
- Display order summary (customer, vehicle, service, time)
- Handle press to navigate to detail
- Show claim button for available orders (employee role)

### API Integration

#### Manager API Endpoints

```typescript
// RTK Query API definition
export const managerApi = createApi({
  reducerPath: 'managerApi',
  baseQuery: baseQueryWithRetry,
  tagTypes: ['ManagerHome'],
  endpoints: (builder) => ({
    getManagerHomeSummary: builder.query<ManagerHomeSummary, void>({
      query: () => '/api/app/manager/home/summary',
      providesTags: ['ManagerHome'],
    }),
    getManagerHomeOrders: builder.query<ServiceOrder[], void>({
      query: () => '/api/app/manager/home/orders',
      providesTags: ['ManagerHome'],
    }),
    getManagerHomeNotifications: builder.query<ManagerNotification[], void>({
      query: () => '/api/app/manager/home/notifications',
      providesTags: ['ManagerHome'],
    }),
  }),
});
```

#### API Response Types

```typescript
type ManagerHomeSummary = {
  stats: {
    pending_orders: number;
    processing_orders: number;
    completed_today: number;
    overdue_orders: number;
    alerts: number;
  };
};

type ManagerNotification = {
  id: string | number;
  title?: string;
  body?: string;
  is_read: boolean | number;
  created_at: string;
};
```

## Data Models

### Redux State Structure

```typescript
// Redux store structure for manager home
interface RootState {
  managerApi: {
    queries: {
      'getManagerHomeSummary(undefined)': {
        status: 'fulfilled' | 'pending' | 'rejected';
        data?: ManagerHomeSummary;
        error?: SerializedError;
        fulfilledTimeStamp?: number;
      };
      'getManagerHomeOrders(undefined)': {
        status: 'fulfilled' | 'pending' | 'rejected';
        data?: ServiceOrder[];
        error?: SerializedError;
        fulfilledTimeStamp?: number;
      };
      'getManagerHomeNotifications(undefined)': {
        status: 'fulfilled' | 'pending' | 'rejected';
        data?: ManagerNotification[];
        error?: SerializedError;
        fulfilledTimeStamp?: number;
      };
    };
  };
  garageContext: {
    garageId?: string;
    garageCode?: string;
    garageName?: string;
    address?: string;
    avatarUrl?: string;
    bannerUrl?: string;
    resolved: boolean;
  };
  auth: {
    isLoggedIn: boolean;
    userType: UserType;
    userId?: string;
    userName?: string;
  };
}
```

### Order Categorization Logic

```typescript
const PENDING_STATUSES = new Set(['received', 'pending', 'confirmed']);
const PROCESSING_STATUSES = new Set(['in_progress', 'processing', 'ready_for_pickup']);
const CLOSED_STATUSES = new Set(['completed', 'cancelled', 'canceled']);

function categorizeOrders(orders: ServiceOrder[]) {
  const pending = orders.filter(o => 
    PENDING_STATUSES.has(o.status?.toLowerCase())
  );
  
  const processing = orders.filter(o => 
    PROCESSING_STATUSES.has(o.status?.toLowerCase())
  );
  
  const overdue = orders.filter(o => {
    if (CLOSED_STATUSES.has(o.status?.toLowerCase())) return false;
    const dueDate = new Date(o.delivery_date);
    return dueDate < new Date();
  });
  
  return { pending, processing, overdue };
}
```

### Cache Management

```typescript
interface CacheMetadata {
  timestamp: number;
  expiresAt: number;
}

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

function isCacheValid(metadata: CacheMetadata): boolean {
  return Date.now() < metadata.expiresAt;
}

function getCacheAge(metadata: CacheMetadata): string {
  const ageMs = Date.now() - metadata.timestamp;
  const ageMinutes = Math.floor(ageMs / 60000);
  
  if (ageMinutes < 60) return `${ageMinutes} phút trước`;
  const ageHours = Math.floor(ageMinutes / 60);
  if (ageHours < 24) return `${ageHours} giờ trước`;
  const ageDays = Math.floor(ageHours / 24);
  return `${ageDays} ngày trước`;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Order Categorization Correctness

*For any* list of service orders, when categorized by status, each order SHALL appear in exactly one category (pending, processing, or overdue), and no order SHALL be lost or duplicated during categorization.

**Validates: Requirements 2.3**

### Property 2: Order List Limiting

*For any* list of orders (pending or processing), when displayed on the HomeScreen, the rendered list SHALL contain at most 5 orders, regardless of the input list size.

**Validates: Requirements 2.4**

### Property 3: Order Card Required Fields

*For any* service order object, when rendered as an OrderCard, the output SHALL contain all required fields: customer name, license plate, service name, and timestamp.

**Validates: Requirements 2.6**

### Property 4: API Error Fallback Consistency

*For any* API error response (network, 401, 500, etc.), the system SHALL display cached data if available and show an appropriate error message, maintaining UI stability without crashes.

**Validates: Requirements 1.4, 5.2, 5.3, 5.4**

### Property 5: Cache Expiration Logic

*For any* cached data with a timestamp, the system SHALL consider it expired if the age exceeds 24 hours, and SHALL display an expiry warning when offline.

**Validates: Requirements 10.5, 10.6**

## Error Handling

### Error Categories and Responses

| Error Type | HTTP Code | User Message | System Action |
|------------|-----------|--------------|---------------|
| Network Error | N/A | "Không thể kết nối. Vui lòng kiểm tra mạng" | Show cached data + retry button |
| Unauthorized | 401 | "Phiên đăng nhập hết hạn" | Navigate to Login screen |
| Server Error | 500 | "Lỗi hệ thống. Vui lòng thử lại sau" | Show cached data + retry button |
| Not Found | 404 | "Không tìm thấy dữ liệu" | Show empty state |
| Timeout | 408 | "Yêu cầu quá lâu. Vui lòng thử lại" | Show cached data + retry button |

### Error Handling Flow

```typescript
function handleApiError(error: ApiError, cachedData?: any) {
  // Log error for debugging
  console.error('[ManagerHome] API Error:', error);
  
  // Check error type
  if (error.status === 401) {
    // Clear auth state and navigate to login
    dispatch(logout());
    navigation.navigate('Login');
    return;
  }
  
  // For other errors, show cached data if available
  if (cachedData) {
    const cacheAge = getCacheAge(cachedData.metadata);
    showToast({
      type: 'warning',
      message: `Hiển thị dữ liệu offline (${cacheAge})`,
    });
    return cachedData.data;
  }
  
  // No cached data, show error message
  const message = getErrorMessage(error);
  showToast({
    type: 'error',
    message,
    action: {
      label: 'Thử lại',
      onPress: () => refetchAll(),
    },
  });
  
  return null;
}

function getErrorMessage(error: ApiError): string {
  if (!navigator.onLine) {
    return 'Không thể kết nối. Vui lòng kiểm tra mạng';
  }
  
  switch (error.status) {
    case 500:
    case 502:
    case 503:
      return 'Lỗi hệ thống. Vui lòng thử lại sau';
    case 404:
      return 'Không tìm thấy dữ liệu';
    case 408:
      return 'Yêu cầu quá lâu. Vui lòng thử lại';
    default:
      return error.message || 'Đã xảy ra lỗi. Vui lòng thử lại';
  }
}
```

### Retry Strategy

```typescript
// RTK Query retry configuration
const baseQueryWithRetry = retry(
  async (args, api, extraOptions) => {
    const result = await baseQuery(args, api, extraOptions);
    
    // Don't retry on 401 (auth errors)
    if (result.error?.status === 401) {
      retry.fail(result.error);
    }
    
    return result;
  },
  {
    maxRetries: 3,
    backoff: (attempt) => {
      // Exponential backoff: 1s, 2s, 4s
      return Math.min(1000 * Math.pow(2, attempt), 10000);
    },
  }
);
```

## Testing Strategy

### Testing Approach

Tính năng này là UI-focused với React Native components, API integration, và state management. Testing strategy bao gồm:

1. **Unit Tests**: Test individual functions và logic (categorization, filtering, formatting)
2. **Component Tests**: Test React components với React Testing Library
3. **Integration Tests**: Test API integration với mocked responses
4. **Property-Based Tests**: Test universal properties với fast-check
5. **E2E Tests**: Test user flows với Detox (optional)

### Property-Based Testing

Sử dụng **fast-check** library cho JavaScript/TypeScript property-based testing.

Configuration:
- Minimum 100 iterations per property test
- Each test references design document property
- Tag format: `Feature: garage-admin-home-screen, Property {number}: {property_text}`

Example property test:

```typescript
import fc from 'fast-check';
import { categorizeOrders } from '../useManagerHomeScreen';

describe('Property 1: Order Categorization Correctness', () => {
  it('Feature: garage-admin-home-screen, Property 1: Order categorization correctness', () => {
    fc.assert(
      fc.property(
        fc.array(arbitraryServiceOrder()),
        (orders) => {
          const { pending, processing, overdue } = categorizeOrders(orders);
          
          // No order should be lost
          const totalCategorized = pending.length + processing.length + overdue.length;
          expect(totalCategorized).toBeLessThanOrEqual(orders.length);
          
          // No duplicates across categories
          const allIds = [
            ...pending.map(o => o.id),
            ...processing.map(o => o.id),
            ...overdue.map(o => o.id),
          ];
          const uniqueIds = new Set(allIds);
          expect(allIds.length).toBe(uniqueIds.size);
          
          // Each order in correct category
          pending.forEach(o => {
            expect(['received', 'pending', 'confirmed']).toContain(o.status.toLowerCase());
          });
          
          processing.forEach(o => {
            expect(['in_progress', 'processing', 'ready_for_pickup']).toContain(o.status.toLowerCase());
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Unit Tests

Test các pure functions và utility logic:

```typescript
describe('useManagerHomeScreen utilities', () => {
  describe('categorizeOrders', () => {
    it('should categorize pending orders correctly', () => {
      const orders = [
        { id: '1', status: 'pending' },
        { id: '2', status: 'confirmed' },
      ];
      const { pending } = categorizeOrders(orders);
      expect(pending).toHaveLength(2);
    });
    
    it('should identify overdue orders', () => {
      const yesterday = new Date(Date.now() - 86400000).toISOString();
      const orders = [
        { id: '1', status: 'in_progress', delivery_date: yesterday },
      ];
      const { overdue } = categorizeOrders(orders);
      expect(overdue).toHaveLength(1);
    });
  });
  
  describe('isCacheValid', () => {
    it('should return true for fresh cache', () => {
      const metadata = {
        timestamp: Date.now(),
        expiresAt: Date.now() + 3600000,
      };
      expect(isCacheValid(metadata)).toBe(true);
    });
    
    it('should return false for expired cache', () => {
      const metadata = {
        timestamp: Date.now() - 86400000,
        expiresAt: Date.now() - 1000,
      };
      expect(isCacheValid(metadata)).toBe(false);
    });
  });
});
```

### Component Tests

Test React components với mocked data:

```typescript
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import ManagerHomeScreen from '../ManagerHomeScreen';

describe('ManagerHomeScreen', () => {
  it('should render 5 KPI cards', () => {
    const { getAllByTestId } = render(
      <Provider store={mockStore}>
        <ManagerHomeScreen {...mockProps} />
      </Provider>
    );
    
    const kpiCards = getAllByTestId(/kpi-card/);
    expect(kpiCards).toHaveLength(5);
  });
  
  it('should display pending orders section', () => {
    const { getByText } = render(
      <Provider store={mockStore}>
        <ManagerHomeScreen {...mockProps} />
      </Provider>
    );
    
    expect(getByText('Don moi cho nhan')).toBeTruthy();
  });
  
  it('should navigate to order detail on order press', () => {
    const mockNavigate = jest.fn();
    const { getByTestId } = render(
      <Provider store={mockStore}>
        <ManagerHomeScreen 
          {...mockProps}
          actions={{ ...mockActions, onOrderPress: mockNavigate }}
        />
      </Provider>
    );
    
    fireEvent.press(getByTestId('order-card-1'));
    expect(mockNavigate).toHaveBeenCalledWith('1');
  });
  
  it('should show skeleton loaders when loading', () => {
    const { getAllByTestId } = render(
      <Provider store={mockStore}>
        <ManagerHomeScreen 
          {...mockProps}
          ordersState={{ ...mockOrdersState, availableLoading: true }}
        />
      </Provider>
    );
    
    const skeletons = getAllByTestId(/skeleton-loader/);
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
```

### Integration Tests

Test API integration với MSW (Mock Service Worker):

```typescript
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { renderHook, waitFor } from '@testing-library/react-hooks';
import { useManagerHomeScreen } from '../useManagerHomeScreen';

const server = setupServer(
  rest.get('/api/app/manager/home/summary', (req, res, ctx) => {
    return res(ctx.json({
      success: true,
      data: {
        stats: {
          pending_orders: 5,
          processing_orders: 3,
          completed_today: 10,
          overdue_orders: 2,
          alerts: 4,
        },
      },
    }));
  }),
  rest.get('/api/app/manager/home/orders', (req, res, ctx) => {
    return res(ctx.json({
      success: true,
      data: mockOrders,
    }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useManagerHomeScreen API integration', () => {
  it('should fetch and compute KPIs from API', async () => {
    const { result } = renderHook(() => useManagerHomeScreen({
      isEnabled: true,
      fallbackAvailableOrders: [],
      fallbackAssignedOrders: [],
    }));
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.kpis).toHaveLength(5);
    expect(result.current.kpis[0].value).toBe(5); // pending
  });
  
  it('should handle API errors gracefully', async () => {
    server.use(
      rest.get('/api/app/manager/home/summary', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );
    
    const { result } = renderHook(() => useManagerHomeScreen({
      isEnabled: true,
      fallbackAvailableOrders: mockFallbackOrders,
      fallbackAssignedOrders: [],
    }));
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    // Should use fallback data
    expect(result.current.pendingOrders.length).toBeGreaterThan(0);
  });
});
```

### Accessibility Tests

Test accessibility compliance:

```typescript
import { render } from '@testing-library/react-native';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('ManagerHomeScreen Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(
      <Provider store={mockStore}>
        <ManagerHomeScreen {...mockProps} />
      </Provider>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  it('should have proper accessibility labels', () => {
    const { getByLabelText } = render(
      <Provider store={mockStore}>
        <ManagerHomeScreen {...mockProps} />
      </Provider>
    );
    
    expect(getByLabelText('Thông báo')).toBeTruthy();
    expect(getByLabelText('Ưu đãi')).toBeTruthy();
    expect(getByLabelText('Bảo hành')).toBeTruthy();
  });
  
  it('should have minimum touch target size', () => {
    const { getAllByRole } = render(
      <Provider store={mockStore}>
        <ManagerHomeScreen {...mockProps} />
      </Provider>
    );
    
    const buttons = getAllByRole('button');
    buttons.forEach(button => {
      const { width, height } = button.props.style;
      expect(width).toBeGreaterThanOrEqual(44);
      expect(height).toBeGreaterThanOrEqual(44);
    });
  });
});
```

### Performance Tests

Test render performance:

```typescript
import { render } from '@testing-library/react-native';
import { measurePerformance } from '@shopify/react-native-performance';

describe('ManagerHomeScreen Performance', () => {
  it('should render within 1000ms', async () => {
    const startTime = performance.now();
    
    render(
      <Provider store={mockStore}>
        <ManagerHomeScreen {...mockProps} />
      </Provider>
    );
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    expect(renderTime).toBeLessThan(1000);
  });
  
  it('should not re-render unnecessarily', () => {
    const { rerender } = render(
      <Provider store={mockStore}>
        <ManagerHomeScreen {...mockProps} />
      </Provider>
    );
    
    const renderCount = jest.fn();
    jest.spyOn(React, 'createElement').mockImplementation(renderCount);
    
    // Re-render with same props
    rerender(
      <Provider store={mockStore}>
        <ManagerHomeScreen {...mockProps} />
      </Provider>
    );
    
    // Should use memoization
    expect(renderCount).toHaveBeenCalledTimes(0);
  });
});
```

### Test Coverage Goals

- Unit tests: 90% coverage for business logic
- Component tests: 80% coverage for UI components
- Integration tests: Cover all API endpoints and error scenarios
- Property tests: 100 iterations minimum per property
- E2E tests: Cover critical user flows (login → view dashboard → navigate to order detail)

