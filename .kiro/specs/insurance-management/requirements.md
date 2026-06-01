# Requirements Document

## Introduction

Tính năng **Quản lý Bảo hiểm** (Insurance Management) bổ sung vào trang Manager của ứng dụng TNAuto một giao diện chuyên biệt để người quản lý gara theo dõi và quản lý trạng thái bảo hiểm xe của toàn bộ khách hàng trong gara.

Hiện tại, thông tin bảo hiểm (`insurance_company`, `insurance_start_date`, `insurance_expiry_date`, `insurance_image_url`) đã được lưu trên bảng `vehicles` ở backend, và trường `insurance_status` đã được tính toán trong `vehicleDocumentService.js`. Tuy nhiên chưa có giao diện quản lý tập trung dành cho Manager.

Từ góc độ người quản lý, tính năng này cần:
- **Tổng quan nhanh**: Biết ngay bao nhiêu xe đang hết hạn, sắp hết hạn, còn hạn, chưa cập nhật bảo hiểm.
- **Danh sách có thể lọc**: Xem và lọc xe theo trạng thái bảo hiểm để ưu tiên xử lý.
- **Cập nhật thông tin**: Chỉnh sửa thông tin bảo hiểm cho từng xe khi khách hàng gia hạn.
- **Nhắc nhở chủ động**: Gửi thông báo đến khách hàng có xe sắp hết hạn bảo hiểm.

Tính năng bao gồm cả thay đổi backend (API mới) và frontend (màn hình mới trong GarageManagement).

---

## Glossary

- **Insurance_Manager**: Hệ thống quản lý bảo hiểm trong ứng dụng TNAuto, chỉ dành cho role `garage_manager` và `garage_admin`.
- **Vehicle**: Xe của khách hàng, được liên kết với gara qua bảng `customer_garages`.
- **Insurance_Status**: Trạng thái bảo hiểm của một xe, có 4 giá trị: `expired` (hết hạn), `expiring` (sắp hết hạn trong 30 ngày), `valid` (còn hạn), `missing` (chưa cập nhật).
- **Insurance_Record**: Bộ thông tin bảo hiểm của một xe, gồm: công ty bảo hiểm, ngày bắt đầu, ngày hết hạn, ảnh chứng từ.
- **Garage_Context**: Ngữ cảnh gara hiện tại của Manager, xác định phạm vi dữ liệu được truy cập.
- **Manager**: Người dùng có role `garage_manager` hoặc `garage_admin` đang đăng nhập vào ứng dụng.
- **Expiry_Threshold**: Ngưỡng cảnh báo sắp hết hạn, mặc định là 30 ngày trước ngày hết hạn.

---

## Requirements

### Requirement 1: Dashboard Tổng Quan Bảo Hiểm

**User Story:** Là một Manager, tôi muốn xem tổng quan trạng thái bảo hiểm của toàn bộ xe trong gara, để tôi có thể nắm bắt nhanh tình hình và ưu tiên xử lý.

#### Acceptance Criteria

1. WHEN Manager mở màn hình Quản lý Bảo hiểm, THE Insurance_Manager SHALL hiển thị 4 thẻ KPI: số xe hết hạn (`expired`), số xe sắp hết hạn (`expiring`), số xe còn hạn (`valid`), số xe chưa cập nhật (`missing`).
2. THE Insurance_Manager SHALL tính tổng số xe trong 4 nhóm KPI bằng đúng tổng số xe thuộc Garage_Context hiện tại.
3. WHEN dữ liệu đang tải, THE Insurance_Manager SHALL hiển thị trạng thái loading skeleton thay cho các thẻ KPI.
4. IF API trả về lỗi, THEN THE Insurance_Manager SHALL hiển thị thông báo lỗi và nút "Thử lại" để Manager có thể tải lại dữ liệu. THE Insurance_Manager SHALL không hiển thị nút "Thử lại" trong quá trình tải dữ liệu bình thường.
5. WHEN Manager nhấn vào một thẻ KPI, THE Insurance_Manager SHALL tự động lọc danh sách xe theo trạng thái tương ứng.

---

### Requirement 2: Danh Sách Xe Theo Trạng Thái Bảo Hiểm

**User Story:** Là một Manager, tôi muốn xem danh sách xe được phân loại theo trạng thái bảo hiểm, để tôi có thể nhanh chóng xác định xe nào cần được xử lý.

#### Acceptance Criteria

1. THE Insurance_Manager SHALL hiển thị danh sách xe thuộc Garage_Context hiện tại, mỗi xe hiển thị: biển số, tên khách hàng, tên công ty bảo hiểm (nếu có), ngày hết hạn bảo hiểm (nếu có), và badge trạng thái Insurance_Status.
2. WHEN Manager chọn bộ lọc trạng thái, THE Insurance_Manager SHALL chỉ hiển thị các xe có Insurance_Status khớp với bộ lọc đã chọn.
3. THE Insurance_Manager SHALL hỗ trợ lọc theo 5 tùy chọn: Tất cả, Hết hạn, Sắp hết hạn, Còn hạn, Chưa cập nhật.
4. WHEN Manager nhập từ khóa vào ô tìm kiếm, THE Insurance_Manager SHALL lọc danh sách theo biển số xe hoặc tên khách hàng, không phân biệt chữ hoa/thường.
5. THE Insurance_Manager SHALL sắp xếp danh sách theo thứ tự ưu tiên: xe hết hạn hiển thị trước, tiếp theo là xe sắp hết hạn, xe còn hạn, cuối cùng là xe chưa cập nhật.
6. WHEN danh sách rỗng sau khi lọc, THE Insurance_Manager SHALL hiển thị thông báo "Không có xe nào phù hợp" thay vì danh sách trống.
7. THE Insurance_Manager SHALL hỗ trợ pull-to-refresh để Manager tải lại danh sách.

---

### Requirement 3: Xem và Cập Nhật Thông Tin Bảo Hiểm

**User Story:** Là một Manager, tôi muốn xem và cập nhật thông tin bảo hiểm của từng xe, để tôi có thể ghi nhận khi khách hàng gia hạn bảo hiểm.

#### Acceptance Criteria

1. WHEN Manager nhấn vào một xe trong danh sách, THE Insurance_Manager SHALL hiển thị form chi tiết với các trường: công ty bảo hiểm, ngày bắt đầu, ngày hết hạn, và ảnh chứng từ bảo hiểm.
2. WHEN Manager nhập ngày hết hạn bảo hiểm theo định dạng YYYY-MM-DD, THE Insurance_Manager SHALL chấp nhận và lưu giá trị đó.
3. IF Manager nhập ngày hết hạn không đúng định dạng YYYY-MM-DD, THEN THE Insurance_Manager SHALL hiển thị thông báo lỗi "Ngày không hợp lệ, vui lòng nhập theo định dạng YYYY-MM-DD".
4. WHEN Manager lưu thông tin bảo hiểm, THE Insurance_Manager SHALL gọi API cập nhật và hiển thị thông báo "Cập nhật thành công" sau khi API trả về thành công.
5. WHEN Manager lưu thành công, THE Insurance_Manager SHALL cập nhật Insurance_Status của xe trong danh sách ngay lập tức mà không cần tải lại toàn bộ trang.
6. WHERE Manager muốn đính kèm ảnh chứng từ, THE Insurance_Manager SHALL cho phép Manager chọn ảnh từ thư viện hoặc chụp ảnh mới.
7. IF API cập nhật thất bại, THEN THE Insurance_Manager SHALL hiển thị thông báo lỗi cụ thể và giữ nguyên form để Manager có thể thử lại.

---

### Requirement 4: Tính Toán Insurance_Status

**User Story:** Là một Manager, tôi muốn hệ thống tự động tính toán trạng thái bảo hiểm dựa trên ngày hết hạn, để tôi không cần tự phán đoán xe nào đang trong tình trạng nào.

#### Acceptance Criteria

1. WHEN `insurance_expiry_date` là NULL hoặc không có giá trị, THE Insurance_Manager SHALL gán Insurance_Status là `missing`, bất kể các điều kiện khác.
2. WHEN `insurance_expiry_date` nhỏ hơn ngày hiện tại, THE Insurance_Manager SHALL gán Insurance_Status là `expired`.
3. WHEN `insurance_expiry_date` lớn hơn hoặc bằng ngày hiện tại và nhỏ hơn hoặc bằng ngày hiện tại cộng thêm 30 ngày, THE Insurance_Manager SHALL gán Insurance_Status là `expiring`.
4. WHEN `insurance_expiry_date` lớn hơn ngày hiện tại cộng thêm 30 ngày, THE Insurance_Manager SHALL gán Insurance_Status là `valid`.
5. THE Insurance_Manager SHALL tính Insurance_Status nhất quán ở cả backend (SQL query) và frontend (helper function), sử dụng cùng ngưỡng Expiry_Threshold là 30 ngày.

---

### Requirement 5: API Backend Quản Lý Bảo Hiểm

**User Story:** Là một Manager, tôi muốn hệ thống cung cấp API chuyên biệt cho quản lý bảo hiểm, để frontend có thể lấy dữ liệu tổng hợp hiệu quả mà không cần gọi nhiều API riêng lẻ.

#### Acceptance Criteria

1. THE Insurance_Manager SHALL cung cấp endpoint `GET /api/app/manager/insurance/summary` trả về số lượng xe theo từng Insurance_Status trong Garage_Context hiện tại.
2. THE Insurance_Manager SHALL cung cấp endpoint `GET /api/app/manager/insurance/vehicles` trả về danh sách xe kèm thông tin bảo hiểm đầy đủ, hỗ trợ query param `status` để lọc theo Insurance_Status và `q` để tìm kiếm.
3. THE Insurance_Manager SHALL cung cấp endpoint `PUT /api/app/manager/vehicles/:id/insurance` để cập nhật Insurance_Record của một xe.
4. WHEN request đến các endpoint bảo hiểm không có token hợp lệ của Manager, bao gồm token bị lỗi định dạng, THE Insurance_Manager SHALL trả về HTTP 401 Unauthorized.
5. WHEN request đến các endpoint bảo hiểm với token hợp lệ nhưng role không phải `garage_manager` hoặc `garage_admin`, THE Insurance_Manager SHALL trả về HTTP 403 Forbidden.
6. WHEN request đến `GET /api/app/manager/insurance/vehicles` với `status=expired`, THE Insurance_Manager SHALL chỉ trả về các xe có `insurance_expiry_date` nhỏ hơn ngày hiện tại.
7. THE Insurance_Manager SHALL đảm bảo tất cả endpoint bảo hiểm chỉ trả về dữ liệu thuộc Garage_Context của Manager đang đăng nhập.

---

### Requirement 6: Giao Diện Tích Hợp Vào Manager Tab

**User Story:** Là một Manager, tôi muốn truy cập quản lý bảo hiểm từ trang Manager chính, để tôi không cần tìm kiếm tính năng ở nhiều nơi khác nhau.

#### Acceptance Criteria

1. THE Insurance_Manager SHALL thêm thẻ "Bảo hiểm" vào phần "Tổng quan nghiệp vụ" trong `GarageManagementScreen`, hiển thị tổng số xe và số xe cần chú ý (expired + expiring).
2. WHEN Manager nhấn vào thẻ "Bảo hiểm" trong `GarageManagementScreen`, THE Insurance_Manager SHALL điều hướng đến màn hình `InsuranceManagement`.
3. THE Insurance_Manager SHALL đăng ký route `InsuranceManagement` trong `AppStackParamList` và `AppNavigator`.
4. WHEN Manager không có role `garage_manager` hoặc `garage_admin`, THE Insurance_Manager SHALL không hiển thị thẻ "Bảo hiểm" trong `GarageManagementScreen` và SHALL chặn điều hướng trực tiếp đến màn hình `InsuranceManagement`.
5. THE Insurance_Manager SHALL tuân theo pattern container/hook/view của codebase: `InsuranceManagementScreen` (container) → `useInsuranceManagement` (hook) → `InsuranceManagementView` (view).

---

### Requirement 7: Thông Báo Nhắc Nhở Bảo Hiểm

**User Story:** Là một Manager, tôi muốn gửi thông báo nhắc nhở đến khách hàng có xe sắp hết hạn bảo hiểm, để khách hàng có thể gia hạn kịp thời.

#### Acceptance Criteria

1. WHEN Manager nhấn nút "Nhắc nhở" trên một xe có Insurance_Status là `expiring` hoặc `expired`, THE Insurance_Manager SHALL hiển thị dialog xác nhận trước khi gửi thông báo.
2. WHEN Manager xác nhận gửi thông báo, THE Insurance_Manager SHALL gọi API gửi push notification đến khách hàng sở hữu xe đó với nội dung nhắc nhở gia hạn bảo hiểm.
3. WHEN thông báo được gửi thành công, THE Insurance_Manager SHALL hiển thị thông báo "Đã gửi nhắc nhở thành công".
4. IF API gửi thông báo thất bại hoặc không xác nhận được việc gửi thành công đến khách hàng, THEN THE Insurance_Manager SHALL hiển thị thông báo lỗi và không thay đổi trạng thái xe.
5. THE Insurance_Manager SHALL chỉ hiển thị nút "Nhắc nhở" cho xe có Insurance_Status là `expiring` hoặc `expired`, không hiển thị cho xe có Insurance_Status là `valid` hoặc `missing`.

---

### Requirement 8: Phân Quyền Truy Cập

**User Story:** Là một quản trị viên hệ thống, tôi muốn đảm bảo chỉ Manager mới có thể truy cập tính năng quản lý bảo hiểm, để bảo vệ dữ liệu khách hàng.

#### Acceptance Criteria

1. WHEN người dùng có role `customer`, `employee`, hoặc `dealer` cố gắng truy cập màn hình `InsuranceManagement`, THE Insurance_Manager SHALL điều hướng về màn hình Home.
2. WHEN người dùng chưa đăng nhập cố gắng truy cập màn hình `InsuranceManagement`, THE Insurance_Manager SHALL điều hướng về màn hình Login.
3. THE Insurance_Manager SHALL sử dụng middleware `requireGarageManagerAuth` và `requireGarageContext` cho tất cả các endpoint bảo hiểm ở backend.
4. THE Insurance_Manager SHALL sử dụng hàm `isManagerRole(userType)` hiện có trong `rolePolicy.ts` để kiểm tra quyền truy cập ở frontend.
