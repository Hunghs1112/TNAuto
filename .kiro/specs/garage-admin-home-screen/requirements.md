# Requirements Document

## Introduction

Tài liệu này mô tả các yêu cầu cho tính năng cải thiện giao diện HomeScreen dành riêng cho vai trò Garage Admin trong ứng dụng React Native quản lý garage. Tính năng này sẽ thiết kế lại giao diện trang chủ để hiển thị các thông tin quản lý quan trọng, tích hợp đầy đủ các API quản lý, và tạo trải nghiệm trực quan, hợp lý cho người quản lý garage.

## Glossary

- **HomeScreen**: Màn hình chính hiển thị khi người dùng đăng nhập vào ứng dụng
- **Garage_Admin**: Vai trò người dùng có quyền quản lý toàn bộ hoạt động của garage
- **Manager_API**: Các API endpoint dành cho vai trò quản lý (manager/admin) bao gồm summary, orders, và notifications
- **KPI_Card**: Thẻ hiển thị chỉ số hiệu suất chính (Key Performance Indicator)
- **Dashboard**: Bảng điều khiển tổng quan hiển thị các thông tin và số liệu quan trọng
- **Service_Order**: Đơn hàng dịch vụ trong hệ thống
- **Quick_Action**: Nút bấm nhanh để truy cập các chức năng thường dùng
- **UI_Component**: Thành phần giao diện người dùng có thể tái sử dụng

## Requirements

### Requirement 1: Hiển thị Dashboard Tổng Quan

**User Story:** Là một Garage Admin, tôi muốn xem dashboard tổng quan với các KPI quan trọng, để tôi có thể nắm bắt tình hình hoạt động của garage một cách nhanh chóng.

#### Acceptance Criteria

1. WHEN THE Garage_Admin đăng nhập vào HomeScreen, THE Dashboard SHALL hiển thị 5 KPI cards bao gồm số đơn chờ xử lý, đơn đang xử lý, đơn quá hạn, đơn hoàn thành hôm nay, và thông báo chưa đọc
2. THE Dashboard SHALL gọi Manager_API endpoint `/api/app/manager/home/summary` để lấy dữ liệu KPI
3. WHEN Manager_API trả về dữ liệu thành công, THE Dashboard SHALL hiển thị các giá trị KPI trong vòng 500ms
4. IF Manager_API trả về lỗi, THEN THE Dashboard SHALL hiển thị giá trị fallback từ dữ liệu local và hiển thị thông báo lỗi
5. THE KPI_Card SHALL hiển thị giá trị số và nhãn mô tả bằng tiếng Việt
6. THE Dashboard SHALL tự động làm mới dữ liệu KPI mỗi 60 giây

### Requirement 2: Quản Lý Danh Sách Đơn Hàng

**User Story:** Là một Garage Admin, tôi muốn xem danh sách đơn hàng theo trạng thái, để tôi có thể theo dõi và quản lý tiến độ công việc.

#### Acceptance Criteria

1. THE HomeScreen SHALL hiển thị 2 danh sách đơn hàng: "Đơn mới chờ nhận" và "Đơn đang xử lý"
2. THE HomeScreen SHALL gọi Manager_API endpoint `/api/app/manager/home/orders` để lấy danh sách Service_Order
3. WHEN Manager_API trả về danh sách orders, THE HomeScreen SHALL phân loại orders theo status thành pending orders và processing orders
4. THE HomeScreen SHALL hiển thị tối đa 5 orders cho mỗi danh sách
5. WHEN Garage_Admin nhấn vào một Service_Order, THE HomeScreen SHALL điều hướng đến màn hình chi tiết order tương ứng
6. THE HomeScreen SHALL hiển thị thông tin cơ bản của order bao gồm tên khách hàng, biển số xe, dịch vụ, và thời gian
7. IF danh sách orders trống, THEN THE HomeScreen SHALL hiển thị thông báo "Chưa có đơn nào" với icon phù hợp

### Requirement 3: Tích Hợp Quick Actions

**User Story:** Là một Garage Admin, tôi muốn truy cập nhanh các chức năng thường dùng, để tôi có thể thực hiện công việc hiệu quả hơn.

#### Acceptance Criteria

1. THE HomeScreen SHALL hiển thị section Quick_Action với 3 nút chính: "Quản lý đơn", "Offers", và "Warranty"
2. WHEN Garage_Admin nhấn nút "Quản lý đơn", THE HomeScreen SHALL điều hướng đến màn hình danh sách đơn hàng đầy đủ
3. WHEN Garage_Admin nhấn nút "Offers", THE HomeScreen SHALL điều hướng đến màn hình quản lý ưu đãi
4. WHEN Garage_Admin nhấn nút "Warranty", THE HomeScreen SHALL điều hướng đến màn hình quản lý bảo hành
5. THE Quick_Action SHALL hiển thị icon và text label cho mỗi nút
6. THE Quick_Action buttons SHALL có kích thước tối thiểu 44x44 điểm để đảm bảo khả năng tương tác

### Requirement 4: Hiển Thị Thông Tin Garage

**User Story:** Là một Garage Admin, tôi muốn xem thông tin garage hiện tại trên HomeScreen, để tôi có thể xác nhận đang quản lý đúng garage.

#### Acceptance Criteria

1. THE HomeScreen SHALL hiển thị GarageSummaryCard ở phần header với tên garage, địa chỉ, và avatar
2. WHEN garage context có dữ liệu, THE HomeScreen SHALL hiển thị tên garage từ garageContext state
3. THE GarageSummaryCard SHALL hiển thị avatar của garage nếu có avatarUrl
4. THE GarageSummaryCard SHALL hiển thị banner của garage nếu có bannerUrl
5. WHEN Garage_Admin là garage_admin role, THE GarageSummaryCard SHALL không cho phép thay đổi garage
6. THE HomeScreen SHALL hiển thị tên người dùng trong UserHeader component

### Requirement 5: Xử Lý Trạng Thái Loading và Error

**User Story:** Là một Garage Admin, tôi muốn thấy trạng thái loading và thông báo lỗi rõ ràng, để tôi biết hệ thống đang hoạt động hay gặp vấn đề.

#### Acceptance Criteria

1. WHILE Manager_API đang fetch dữ liệu, THE HomeScreen SHALL hiển thị skeleton loader cho KPI cards và order lists
2. WHEN Manager_API trả về lỗi network, THE HomeScreen SHALL hiển thị thông báo "Không thể kết nối. Vui lòng kiểm tra mạng"
3. WHEN Manager_API trả về lỗi 401 unauthorized, THE HomeScreen SHALL điều hướng người dùng về màn hình đăng nhập
4. WHEN Manager_API trả về lỗi 500 server error, THE HomeScreen SHALL hiển thị thông báo "Lỗi hệ thống. Vui lòng thử lại sau"
5. THE HomeScreen SHALL cung cấp nút "Thử lại" khi gặp lỗi để người dùng có thể refresh dữ liệu
6. WHEN người dùng kéo xuống để refresh, THE HomeScreen SHALL gọi lại tất cả Manager_API endpoints

### Requirement 6: Tối Ưu Hiệu Suất Giao Diện

**User Story:** Là một Garage Admin, tôi muốn giao diện HomeScreen phản hồi nhanh và mượt mà, để tôi có thể làm việc hiệu quả.

#### Acceptance Criteria

1. THE HomeScreen SHALL render lần đầu trong vòng 1000ms kể từ khi component mount
2. THE HomeScreen SHALL sử dụng React.memo cho các UI_Component con để tránh re-render không cần thiết
3. THE HomeScreen SHALL sử dụng useMemo để cache các computed values như filtered orders và formatted KPIs
4. THE HomeScreen SHALL sử dụng useCallback để memoize các event handlers
5. WHEN dữ liệu từ Manager_API thay đổi, THE HomeScreen SHALL chỉ re-render các components bị ảnh hưởng
6. THE HomeScreen SHALL lazy load images với placeholder để cải thiện perceived performance

### Requirement 7: Responsive Layout và Accessibility

**User Story:** Là một Garage Admin, tôi muốn giao diện HomeScreen hiển thị tốt trên các kích thước màn hình và hỗ trợ accessibility, để tôi có thể sử dụng trên nhiều thiết bị.

#### Acceptance Criteria

1. THE HomeScreen SHALL sử dụng responsive layout với spacing và sizing từ design system
2. THE HomeScreen SHALL hiển thị đúng trên các màn hình từ 320px đến 768px chiều rộng
3. THE HomeScreen SHALL sử dụng SafeAreaView để tránh notch và system UI
4. THE UI_Component SHALL có contrast ratio tối thiểu 4.5:1 giữa text và background
5. THE Interactive elements SHALL có kích thước tối thiểu 44x44 điểm theo WCAG guidelines
6. THE HomeScreen SHALL hỗ trợ screen reader với accessibilityLabel và accessibilityHint phù hợp
7. THE HomeScreen SHALL hỗ trợ dynamic font sizing theo system settings

### Requirement 8: Tích Hợp Notifications

**User Story:** Là một Garage Admin, tôi muốn xem số lượng thông báo chưa đọc và truy cập nhanh vào danh sách thông báo, để tôi không bỏ lỡ thông tin quan trọng.

#### Acceptance Criteria

1. THE HomeScreen SHALL hiển thị notification icon ở header với badge số lượng thông báo chưa đọc
2. THE HomeScreen SHALL gọi Manager_API endpoint `/api/app/manager/home/notifications` để lấy danh sách thông báo
3. WHEN có thông báo chưa đọc, THE HomeScreen SHALL hiển thị badge màu đỏ với số lượng
4. WHEN Garage_Admin nhấn vào notification icon, THE HomeScreen SHALL điều hướng đến màn hình Notification
5. THE HomeScreen SHALL cập nhật số lượng thông báo chưa đọc mỗi 30 giây
6. WHEN có thông báo mới, THE HomeScreen SHALL hiển thị animation nhẹ trên notification icon

### Requirement 9: Phân Quyền Hiển Thị

**User Story:** Là một Garage Admin, tôi muốn chỉ thấy các chức năng và dữ liệu mà tôi có quyền truy cập, để giao diện không bị rối và bảo mật được đảm bảo.

#### Acceptance Criteria

1. WHEN userType là "garage_admin", THE HomeScreen SHALL hiển thị ManagerHomeScreen component
2. WHEN userType là "garage_manager", THE HomeScreen SHALL hiển thị ManagerHomeScreen component
3. WHEN userType không phải "garage_admin" hoặc "garage_manager", THE HomeScreen SHALL hiển thị giao diện tương ứng với role đó
4. THE ManagerHomeScreen SHALL chỉ gọi Manager_API khi userType được xác thực là manager hoặc admin
5. THE HomeScreen SHALL kiểm tra isLoggedIn trước khi hiển thị dữ liệu cá nhân
6. IF người dùng chưa đăng nhập, THEN THE HomeScreen SHALL hiển thị giao diện public với nút đăng nhập

### Requirement 10: Caching và Offline Support

**User Story:** Là một Garage Admin, tôi muốn vẫn xem được dữ liệu cơ bản khi mất kết nối internet, để tôi có thể tiếp tục làm việc trong điều kiện mạng không ổn định.

#### Acceptance Criteria

1. THE HomeScreen SHALL cache dữ liệu từ Manager_API trong Redux store
2. WHEN mất kết nối internet, THE HomeScreen SHALL hiển thị dữ liệu cached với indicator "Dữ liệu offline"
3. THE HomeScreen SHALL tự động sync dữ liệu khi kết nối internet được khôi phục
4. THE cached data SHALL có timestamp để người dùng biết dữ liệu cũ bao lâu
5. THE HomeScreen SHALL giữ cached data trong tối đa 24 giờ
6. WHEN cached data hết hạn và không có internet, THE HomeScreen SHALL hiển thị thông báo "Dữ liệu đã cũ. Vui lòng kết nối internet"

