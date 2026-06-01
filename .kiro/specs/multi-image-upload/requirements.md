# Requirements Document

## Introduction

Tính năng Multi-Image Upload cho phép nhân viên (employee) chọn và upload nhiều ảnh cùng lúc khi ghi nhận ảnh dịch vụ trong `EmployeeOrderDetailScreen`. Thay vì phải lặp lại thao tác chọn-upload từng ảnh một, nhân viên có thể chọn tối đa 10 ảnh từ thư viện trong một lần thao tác. Tính năng tận dụng `pickImageFromGallery` utility đã có sẵn với `selectionLimit > 1`, giữ nguyên luồng upload tuần tự metadata lên backend để tương thích với API hiện tại (`POST /api/upload/single` và `POST /api/app/employee/orders/images`).

## Glossary

- **Employee_Screen**: `EmployeeOrderDetailScreen` — màn hình xử lý đơn dịch vụ của nhân viên
- **Image_Picker**: Utility `pickImageFromGallery` / `pickImageFromCamera` từ `react-native-image-picker`
- **Upload_Service**: Tập hợp RTK Query mutations `uploadSingleImage` và `uploadServiceOrderImage`
- **Batch**: Tập hợp N ảnh (1 ≤ N ≤ 10) được chọn trong một lần thao tác
- **Storage_Upload**: Bước upload file lên storage qua `POST /api/upload/single`, trả về URL
- **Metadata_Save**: Bước lưu thông tin ảnh vào DB qua `POST /api/app/employee/orders/images`
- **Upload_Section**: Một trong hai section ảnh trong màn hình: "nhận xe" (`received`) hoặc "bàn giao xe" (`completed`)
- **uploadingSection**: State lưu tên section đang upload (`string | null`); `null` khi không có upload nào đang chạy
- **canUploadImages**: Boolean — `true` khi nhân viên hiện tại đang giữ đơn dịch vụ này

---

## Requirements

### Requirement 1: Chọn nhiều ảnh từ thư viện

**User Story:** As a nhân viên, I want to chọn nhiều ảnh cùng lúc từ thư viện điện thoại, so that I can ghi nhận ảnh dịch vụ nhanh hơn mà không cần lặp lại thao tác nhiều lần.

#### Acceptance Criteria

1. WHEN a nhân viên bấm nút "Tải lên" trong một Upload_Section, THE Employee_Screen SHALL hiển thị dialog với hai lựa chọn: "Chụp ảnh" và "Chọn từ thư viện".
2. WHEN a nhân viên chọn "Chọn từ thư viện", THE Employee_Screen SHALL gọi Image_Picker với `selectionLimit: 10` để mở native multi-select image picker.
3. WHEN a nhân viên chọn "Chụp ảnh", THE Employee_Screen SHALL gọi Image_Picker để mở camera và cho phép chụp đúng một ảnh.
4. WHEN a nhân viên chọn N ảnh từ thư viện (1 ≤ N ≤ 10), THE Employee_Screen SHALL tiến hành xử lý toàn bộ N ảnh trong Batch đó.
5. WHEN a nhân viên hủy picker mà không chọn ảnh nào, THE Employee_Screen SHALL không thay đổi bất kỳ state nào và không thực hiện bất kỳ API call nào.

---

### Requirement 2: Validate kích thước ảnh trước khi upload

**User Story:** As a nhân viên, I want to được thông báo ngay khi ảnh quá lớn, so that I can chọn lại ảnh phù hợp mà không lãng phí thời gian chờ upload thất bại.

#### Acceptance Criteria

1. WHEN một Batch được chọn, THE Employee_Screen SHALL kiểm tra kích thước file của từng ảnh trong Batch trước khi bắt đầu bất kỳ Storage_Upload nào.
2. IF bất kỳ ảnh nào trong Batch có `fileSize > 5MB`, THEN THE Employee_Screen SHALL hủy toàn bộ Batch, hiển thị Alert thông báo lỗi kích thước, và không thực hiện bất kỳ Storage_Upload nào.
3. WHEN tất cả ảnh trong Batch đều có `fileSize ≤ 5MB`, THE Employee_Screen SHALL tiến hành bước upload.
4. THE Employee_Screen SHALL áp dụng `maxWidth: 1920`, `maxHeight: 1920`, và `quality: 0.8` khi gọi Image_Picker để giảm kích thước file trước khi validate.

---

### Requirement 3: Upload nhiều ảnh lên storage song song

**User Story:** As a nhân viên, I want to upload nhiều ảnh nhanh nhất có thể, so that I can tiếp tục công việc mà không phải chờ đợi lâu.

#### Acceptance Criteria

1. WHEN một Batch hợp lệ (tất cả ảnh ≤ 5MB) được xác nhận, THE Upload_Service SHALL upload tất cả N ảnh lên storage đồng thời (parallel) bằng `Promise.all`.
2. WHEN tất cả N Storage_Upload hoàn thành thành công, THE Upload_Service SHALL trả về N URL tương ứng với N ảnh đã upload.
3. IF bất kỳ Storage_Upload nào thất bại, THEN THE Employee_Screen SHALL hủy toàn bộ quá trình, hiển thị Alert lỗi với message từ API, và không thực hiện bất kỳ Metadata_Save nào.

---

### Requirement 4: Lưu metadata ảnh tuần tự vào database

**User Story:** As a nhân viên, I want to đảm bảo tất cả ảnh được lưu đúng vào đơn dịch vụ, so that I can xem lại lịch sử ảnh của đơn một cách đầy đủ.

#### Acceptance Criteria

1. WHEN tất cả Storage_Upload hoàn thành thành công, THE Upload_Service SHALL thực hiện Metadata_Save cho từng ảnh theo thứ tự tuần tự (sequential).
2. WHEN thực hiện mỗi Metadata_Save, THE Upload_Service SHALL gửi `order_id`, `image_url` (URL từ Storage_Upload), `status_at_time`, `uploaded_by` (currentEmployeeId), và `description` (chuỗi rỗng) đến `POST /api/app/employee/orders/images`.
3. WHEN tất cả N Metadata_Save hoàn thành thành công, THE Employee_Screen SHALL hiển thị Alert thành công với số lượng ảnh đã upload (N).
4. WHEN tất cả N Metadata_Save hoàn thành thành công, THE Employee_Screen SHALL gọi refetch để cập nhật danh sách ảnh hiển thị.
5. IF bất kỳ Metadata_Save nào thất bại, THEN THE Employee_Screen SHALL hiển thị Alert lỗi với message từ API.

---

### Requirement 5: Quản lý trạng thái upload theo section

**User Story:** As a nhân viên, I want to upload ảnh ở section "nhận xe" và "bàn giao xe" độc lập nhau, so that I can thao tác linh hoạt mà không bị chặn bởi upload đang chạy ở section khác.

#### Acceptance Criteria

1. WHEN một Upload_Section bắt đầu upload, THE Employee_Screen SHALL set `uploadingSection` bằng tên section đó (`statusAtTime`).
2. WHILE `uploadingSection` bằng tên của một Upload_Section, THE Employee_Screen SHALL disable nút "Tải lên" và hiển thị `ActivityIndicator` trong section đó.
3. WHILE `uploadingSection` bằng tên của một Upload_Section, THE Employee_Screen SHALL NOT disable nút "Tải lên" của các Upload_Section khác.
4. WHEN quá trình upload hoàn tất (dù thành công hay thất bại), THE Employee_Screen SHALL reset `uploadingSection` về `null`.
5. IF `uploadingSection` không phải `null` khi nhân viên bấm nút "Tải lên", THEN THE Employee_Screen SHALL hiển thị Alert thông báo đang có upload đang chạy và không bắt đầu upload mới.

---

### Requirement 6: Kiểm soát quyền upload ảnh

**User Story:** As a nhân viên, I want to chỉ upload ảnh khi đơn dịch vụ thuộc về mình, so that I can đảm bảo tính toàn vẹn dữ liệu và không vô tình sửa đơn của người khác.

#### Acceptance Criteria

1. IF `canUploadImages` là `false` khi nhân viên bấm nút "Tải lên", THEN THE Employee_Screen SHALL hiển thị Alert "Bạn chỉ có thể tải ảnh lên khi đơn thuộc về mình." và không gọi Image_Picker.
2. IF `canUploadImages` là `false`, THEN THE Employee_Screen SHALL không thực hiện bất kỳ Storage_Upload hay Metadata_Save nào.
3. WHEN `canUploadImages` là `true`, THE Employee_Screen SHALL cho phép nhân viên tiến hành toàn bộ luồng upload.

---

### Requirement 7: Xử lý lỗi và khôi phục trạng thái

**User Story:** As a nhân viên, I want to được thông báo rõ ràng khi có lỗi xảy ra và có thể thử lại, so that I can hoàn thành việc upload ảnh dù gặp sự cố mạng hay server.

#### Acceptance Criteria

1. IF Storage_Upload thất bại do lỗi mạng hoặc server, THEN THE Employee_Screen SHALL hiển thị Alert lỗi với message từ `getApiErrorMessage` và reset `uploadingSection` về `null`.
2. IF Metadata_Save thất bại sau khi Storage_Upload đã thành công, THEN THE Employee_Screen SHALL hiển thị Alert lỗi và reset `uploadingSection` về `null`.
3. WHEN `uploadingSection` được reset về `null` sau lỗi, THE Employee_Screen SHALL re-enable nút "Tải lên" để nhân viên có thể thử lại.
4. THE Employee_Screen SHALL luôn reset `uploadingSection` về `null` trong khối `finally` bất kể kết quả upload là thành công hay thất bại.
