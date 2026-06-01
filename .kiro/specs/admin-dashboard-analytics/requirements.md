# Requirements Document

## Introduction

Tính năng **Admin Dashboard Analytics** xây dựng lại giao diện quản lý gara (Admin Dashboard) cho ứng dụng TNAuto (React Native 0.81, TypeScript). Mục tiêu là thay thế màn hình `GarageManagementScreen` hiện tại — chỉ hiển thị số liệu tĩnh dạng card — bằng một dashboard trực quan với biểu đồ thống kê có thể lọc theo các khoảng thời gian: ngày, 3 ngày, 7 ngày, tháng, năm.

Phạm vi bao gồm:
- **Frontend**: Thêm thư viện biểu đồ, xây dựng lại `GarageManagementScreen`, tạo các component biểu đồ tái sử dụng.
- **Backend**: Bổ sung endpoint analytics mới `/api/app/admin/analytics` hỗ trợ query theo khoảng thời gian, trả về dữ liệu chuỗi thời gian (time-series) cho đơn hàng, khách hàng mới, và doanh thu.
- **Thư viện chart**: Tích hợp `react-native-gifted-charts` (tương thích RN 0.81, dùng `react-native-svg` đã có sẵn).

---

## Glossary

- **Dashboard**: Màn hình `GarageManagementScreen` — trang chính của khu vực quản trị gara.
- **Analytics_API**: Endpoint backend mới `/api/app/admin/analytics` trả về dữ liệu thống kê theo khoảng thời gian.
- **Time_Period**: Khoảng thời gian lọc dữ liệu, nhận một trong các giá trị: `1d` (ngày), `3d` (3 ngày), `7d` (7 ngày), `1m` (tháng), `1y` (năm).
- **Time_Series_Point**: Một điểm dữ liệu trong chuỗi thời gian, gồm nhãn ngày (`label`) và giá trị số (`value`).
- **KPI_Card**: Thẻ tóm tắt hiển thị một chỉ số tổng hợp (tổng đơn, khách mới, v.v.) kèm xu hướng so với kỳ trước.
- **Chart_Component**: Component React Native hiển thị biểu đồ đường hoặc biểu đồ cột dùng `react-native-gifted-charts`.
- **Period_Selector**: Thanh chọn khoảng thời gian gồm 5 nút: Ngày / 3 Ngày / 7 Ngày / Tháng / Năm.
- **Garage_Manager**: Người dùng có vai trò quản lý gara (`manager` role), được phép truy cập Dashboard.
- **RTK_Query**: Redux Toolkit Query — thư viện quản lý data-fetching đang dùng trong dự án.
- **adminGarageApi**: RTK Query API slice hiện tại trong `src/services/adminGarageApi.ts`.

---

## Requirements

### Requirement 1: Chọn khoảng thời gian thống kê

**User Story:** Là một Garage_Manager, tôi muốn chọn khoảng thời gian thống kê (ngày, 3 ngày, 7 ngày, tháng, năm), để tôi có thể xem xu hướng kinh doanh theo từng giai đoạn phù hợp.

#### Acceptance Criteria

1. THE Dashboard SHALL hiển thị một Period_Selector gồm đúng 5 tùy chọn: `1d`, `3d`, `7d`, `1m`, `1y` với nhãn tiếng Việt tương ứng: "Ngày", "3 Ngày", "7 Ngày", "Tháng", "Năm".
2. WHEN Garage_Manager nhấn vào một tùy chọn trong Period_Selector, THE Dashboard SHALL cập nhật trạng thái `activePeriod` thành giá trị Time_Period tương ứng và hiển thị phản hồi thị giác (visual feedback) ngay lập tức; WHILE thiết bị đang tải nặng, THE Dashboard SHALL hiển thị chỉ báo loading thay vì bắt buộc hoàn thành trong 100ms.
3. WHEN `activePeriod` thay đổi, THE Dashboard SHALL gọi lại Analytics_API với tham số `period` mới và hiển thị trạng thái loading trong khi chờ phản hồi.
4. THE Period_Selector SHALL đánh dấu trực quan (highlight) tùy chọn đang được chọn để phân biệt với các tùy chọn còn lại.
5. THE Dashboard SHALL khởi tạo với `activePeriod` mặc định là `7d` khi màn hình được mở lần đầu.

---

### Requirement 2: Hiển thị KPI tổng hợp theo kỳ

**User Story:** Là một Garage_Manager, tôi muốn xem các chỉ số KPI tổng hợp (tổng đơn, khách mới, đơn hoàn thành, đơn đang xử lý) cho khoảng thời gian đã chọn, để tôi nắm bắt nhanh tình hình hoạt động.

#### Acceptance Criteria

1. WHEN Analytics_API trả về dữ liệu thành công, THE Dashboard SHALL hiển thị tối thiểu 4 KPI_Card: tổng đơn hàng, khách hàng mới, đơn hoàn thành, đơn đang xử lý — tất cả tính trong Time_Period đang chọn.
2. THE KPI_Card SHALL hiển thị giá trị số nguyên không âm cho mỗi chỉ số.
3. WHEN giá trị kỳ hiện tại lớn hơn kỳ trước của một KPI_Card cụ thể, THE KPI_Card SHALL hiển thị chỉ báo xu hướng tăng (màu xanh, icon mũi tên lên) cho riêng KPI_Card đó.
4. WHEN giá trị kỳ hiện tại nhỏ hơn kỳ trước của một KPI_Card cụ thể, THE KPI_Card SHALL hiển thị chỉ báo xu hướng giảm (màu đỏ, icon mũi tên xuống) cho riêng KPI_Card đó.
5. WHEN giá trị kỳ hiện tại bằng kỳ trước của một KPI_Card cụ thể, THE KPI_Card SHALL hiển thị chỉ báo trung tính (màu xám, không có mũi tên) cho riêng KPI_Card đó; IF cả giá trị kỳ hiện tại lẫn kỳ trước đều bằng 0, THEN THE KPI_Card SHALL hiển thị chỉ báo trung tính.
6. IF Analytics_API trả về lỗi, THEN THE Dashboard SHALL hiển thị thông báo lỗi ngắn gọn và nút "Thử lại" thay cho các KPI_Card.

---

### Requirement 3: Biểu đồ đơn hàng theo thời gian

**User Story:** Là một Garage_Manager, tôi muốn xem biểu đồ số lượng đơn hàng theo từng mốc thời gian trong kỳ đã chọn, để tôi nhận ra xu hướng và các ngày cao điểm.

#### Acceptance Criteria

1. WHEN Analytics_API trả về dữ liệu thành công, THE Chart_Component SHALL hiển thị biểu đồ cột (bar chart) thể hiện số lượng đơn hàng theo từng Time_Series_Point trong kỳ đang chọn.
2. THE Chart_Component SHALL hiển thị nhãn trục X là ngày/giờ phù hợp với Time_Period: giờ cho `1d`, ngày cho `3d`/`7d`, tuần cho `1m`, tháng cho `1y`.
3. WHEN Time_Period là `1d`, THE Analytics_API SHALL trả về tối thiểu 24 Time_Series_Point (mỗi giờ một điểm).
4. WHEN Time_Period là `7d`, THE Analytics_API SHALL trả về đúng 7 Time_Series_Point (mỗi ngày một điểm).
5. WHEN Time_Period là `1m`, THE Analytics_API SHALL trả về tối thiểu 4 Time_Series_Point (mỗi tuần một điểm).
6. WHEN Time_Period là `1y`, THE Analytics_API SHALL trả về đúng 12 Time_Series_Point (mỗi tháng một điểm).
7. IF tất cả Time_Series_Point trong kỳ đều có `value` bằng 0, THEN THE Chart_Component SHALL hiển thị biểu đồ cột rỗng (tất cả cột bằng 0) kèm thông báo "Không có đơn hàng trong kỳ này" bên dưới biểu đồ; IF Analytics_API không trả về Time_Series_Point nào (mảng rỗng), THEN THE Chart_Component SHALL hiển thị thông báo "Không có dữ liệu" mà không hiển thị biểu đồ.
8. THE Chart_Component SHALL hỗ trợ cuộn ngang (horizontal scroll) khi số lượng Time_Series_Point vượt quá chiều rộng màn hình.

---

### Requirement 4: Biểu đồ khách hàng mới theo thời gian

**User Story:** Là một Garage_Manager, tôi muốn xem biểu đồ số lượng khách hàng mới theo từng mốc thời gian, để tôi đánh giá hiệu quả thu hút khách.

#### Acceptance Criteria

1. WHEN Analytics_API trả về dữ liệu thành công, THE Chart_Component SHALL hiển thị biểu đồ đường (line chart) thể hiện số khách hàng mới theo từng Time_Series_Point trong kỳ đang chọn.
2. THE Chart_Component SHALL sử dụng cùng cấu trúc trục X như biểu đồ đơn hàng (Requirement 3, tiêu chí 2).
3. THE Chart_Component SHALL hiển thị điểm dữ liệu (data point dot) tại mỗi Time_Series_Point trên đường biểu đồ.
4. THE Chart_Component SHALL hiển thị biểu đồ đường cho mọi trường hợp kể cả khi tất cả Time_Series_Point đều có `value` bằng 0, để thể hiện rõ không có khách hàng mới trong kỳ đó.

---

### Requirement 5: Backend Analytics API — endpoint thống kê theo khoảng thời gian

**User Story:** Là một Garage_Manager, tôi muốn ứng dụng lấy được dữ liệu thống kê theo khoảng thời gian từ server, để các biểu đồ phản ánh đúng dữ liệu thực tế của gara.

#### Acceptance Criteria

1. THE Analytics_API SHALL cung cấp endpoint `GET /api/app/admin/analytics` nhận tham số query `period` với các giá trị hợp lệ: `1d`, `3d`, `7d`, `1m`, `1y`.
2. WHEN `period` hợp lệ được cung cấp, THE Analytics_API SHALL trả về response JSON gồm: `kpi` (object tổng hợp) và `series` (object chứa các mảng Time_Series_Point cho `orders` và `new_customers`).
3. THE Analytics_API SHALL lọc dữ liệu theo `garage_id` của Garage_Manager đang xác thực, không trả về dữ liệu của gara khác.
4. IF tham số `period` không hợp lệ hoặc bị thiếu, THEN THE Analytics_API SHALL trả về HTTP 400 với một thông báo lỗi duy nhất mô tả tất cả các vấn đề validation, bao gồm danh sách các giá trị hợp lệ; việc kiểm tra tham số SHALL được thực hiện trước khi kiểm tra xác thực (authentication).
5. IF Garage_Manager đã vượt qua validation tham số nhưng không có quyền truy cập, THEN THE Analytics_API SHALL trả về HTTP 401.
6. THE Analytics_API SHALL trả về response trong vòng 2000ms cho mọi giá trị `period` hợp lệ với dữ liệu gara thông thường (dưới 10.000 đơn hàng).
7. THE Analytics_API SHALL tính `kpi.previous_period_orders` và `kpi.previous_period_new_customers` dựa trên kỳ liền trước có cùng độ dài với `period` hiện tại, để frontend tính được xu hướng.

---

### Requirement 6: Tích hợp thư viện biểu đồ

**User Story:** Là một developer, tôi muốn tích hợp thư viện biểu đồ tương thích với React Native 0.81, để các Chart_Component hoạt động ổn định trên cả iOS và Android.

#### Acceptance Criteria

1. THE Dashboard SHALL sử dụng thư viện `react-native-gifted-charts` phiên bản tương thích với React Native 0.81 và `react-native-svg` ^15.x đã có trong dự án.
2. THE Chart_Component SHALL render biểu đồ bằng `react-native-svg` (không dùng WebView hay Canvas native).
3. WHERE `react-native-linear-gradient` đã được cài đặt trong dự án, THE Chart_Component SHALL sử dụng gradient cho thanh biểu đồ cột thay vì màu đơn sắc.
4. THE Chart_Component SHALL không gây lỗi render trên Android API 26+ và iOS 14+.

---

### Requirement 7: Trạng thái loading và xử lý lỗi trên Dashboard

**User Story:** Là một Garage_Manager, tôi muốn thấy phản hồi rõ ràng khi dữ liệu đang tải hoặc khi có lỗi xảy ra, để tôi không bị nhầm lẫn về trạng thái của ứng dụng.

#### Acceptance Criteria

1. WHILE Analytics_API đang tải dữ liệu, THE Dashboard SHALL hiển thị skeleton placeholder cho từng KPI_Card và Chart_Component thay vì màn hình trắng.
2. WHEN dữ liệu tải thành công, THE Dashboard SHALL ẩn skeleton và hiển thị nội dung thực trong vòng 1 lần render.
3. IF kết nối mạng bị mất khi đang tải, THEN THE Dashboard SHALL hiển thị thông báo "Không có kết nối mạng" và nút "Thử lại".
4. WHEN Garage_Manager kéo xuống để làm mới (pull-to-refresh), THE Dashboard SHALL gọi lại Analytics_API với `activePeriod` hiện tại và cập nhật toàn bộ dữ liệu.
5. THE Dashboard SHALL duy trì dữ liệu cũ (stale data) hiển thị trong khi đang tải lại, không xóa trắng màn hình khi refresh.

---

### Requirement 8: Điều hướng từ Dashboard đến các màn hình con

**User Story:** Là một Garage_Manager, tôi muốn nhấn vào KPI_Card hoặc biểu đồ để điều hướng đến màn hình chi tiết tương ứng, để tôi có thể xem và xử lý dữ liệu cụ thể.

#### Acceptance Criteria

1. WHEN Garage_Manager nhấn vào KPI_Card "Tổng đơn hàng" hoặc "Đơn đang xử lý", THE Dashboard SHALL điều hướng đến màn hình `GarageOrders`.
2. WHEN Garage_Manager nhấn vào KPI_Card "Khách hàng mới", THE Dashboard SHALL điều hướng đến màn hình `GarageCustomers`.
3. THE Dashboard SHALL giữ nguyên các quick action buttons điều hướng đến `GarageCustomers`, `GarageOrders`, và `Notification` như thiết kế hiện tại; các nút này SHALL luôn hoạt động bình thường bất kể Garage_Manager đang tương tác với KPI_Card hay không.
4. THE Dashboard SHALL không thay đổi logic điều hướng của các màn hình con (`GarageOrdersScreen`, `GarageCustomersScreen`, `GarageEmployeesScreen`, `AdminOperationsScreen`, `AdminCatalogScreen`, `AdminSettingsScreen`).

---

### Requirement 9: Bảo toàn thông tin tổng quan tĩnh hiện có

**User Story:** Là một Garage_Manager, tôi vẫn muốn xem được các số liệu tổng hợp tĩnh (tổng khách hàng, nhân sự, dịch vụ, sản phẩm, v.v.) bên cạnh các biểu đồ mới, để không mất đi thông tin tổng quan đang có.

#### Acceptance Criteria

1. THE Dashboard SHALL giữ lại phần "Tổng quan nghiệp vụ" hiển thị các card tĩnh cho: khách hàng, đơn dịch vụ, nhân sự, dịch vụ, sản phẩm, ưu đãi, bảo hành, xe, thông báo — sử dụng các `useGetAdminStatsQuery` hiện có.
2. THE Dashboard SHALL đặt phần biểu đồ analytics (Period_Selector + KPI_Cards + Chart_Components) ở vị trí nổi bật phía trên phần tổng quan tĩnh.
3. THE Dashboard SHALL hỗ trợ cuộn dọc (vertical scroll) để xem toàn bộ nội dung gồm cả phần analytics và phần tổng quan tĩnh.
