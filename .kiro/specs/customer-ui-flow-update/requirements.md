# Requirements Document

## Introduction

Cập nhật toàn diện giao diện và luồng trải nghiệm cho role khách hàng trong ứng dụng TNAuto. Các thay đổi bao gồm: upload ảnh đa luồng với UX tốt, tìm kiếm gần đúng không phân biệt dấu tiếng Việt (fuzzy search), sửa lỗi trùng gara khi đổi mã, tinh gọn Profile screen cho khách hàng, và mở rộng form thông tin xe để không bắt buộc nhập đủ trường.

## Glossary

- **Fuzzy search / Diacritic-insensitive search**: Tìm kiếm không phân biệt dấu tiếng Việt, ví dụ "Hung" tìm ra "Hùng".
- **GarageCode**: Mã định danh gara, có thể thay đổi khi admin đổi mã.
- **GarageId**: ID nội bộ của gara trong database, không thay đổi.
- **MultiImagePicker**: Component cho phép chọn và upload nhiều ảnh cùng lúc.
- **ImageItem**: Đối tượng đại diện cho một ảnh trong danh sách, bao gồm trạng thái upload.
- **singleMode**: Chế độ chỉ cho phép 1 ảnh trong MultiImagePicker.

## Requirements

### Requirement 1: Upload nhiều ảnh cùng lúc với UX tốt

**User Story:** Là khách hàng, tôi muốn có thể chọn và upload nhiều ảnh cùng một lúc, với giao diện trực quan cho thấy tiến trình upload, để tiết kiệm thời gian và biết rõ trạng thái từng ảnh.

#### Acceptance Criteria

1. GIVEN người dùng nhấn nút thêm ảnh WHEN picker mở ra THEN hệ thống cho phép chọn nhiều ảnh cùng lúc (multi-select, tối đa 10 ảnh).
2. GIVEN người dùng đã chọn nhiều ảnh WHEN bắt đầu upload THEN mỗi ảnh hiển thị thumbnail kèm progress indicator (spinner hoặc progress bar).
3. GIVEN một ảnh upload thành công WHEN hoàn tất THEN thumbnail hiển thị dấu tick xanh và ảnh được thêm vào danh sách.
4. GIVEN một ảnh upload thất bại WHEN có lỗi THEN thumbnail hiển thị icon lỗi đỏ và nút retry cho ảnh đó.
5. GIVEN đang upload WHEN người dùng muốn xóa ảnh chưa upload xong THEN hệ thống hủy upload và xóa ảnh khỏi danh sách.
6. GIVEN ảnh đã upload WHEN người dùng nhấn xóa THEN ảnh bị xóa khỏi danh sách.
7. GIVEN danh sách ảnh WHEN hiển thị THEN layout dạng grid (3 cột) với thumbnail vuông, tối đa 10 ảnh, ô cuối là nút "+" để thêm.
8. GIVEN ảnh xe trong VehicleEditScreen WHEN người dùng chọn ảnh THEN chỉ cho phép 1 ảnh (single-select) nhưng vẫn dùng component mới với UX nhất quán.

### Requirement 2: Tốc độ tải ảnh

**User Story:** Là khách hàng, tôi muốn ảnh trong ứng dụng tải nhanh và mượt mà, không bị giật lag khi cuộn danh sách.

#### Acceptance Criteria

1. GIVEN danh sách sản phẩm/dịch vụ WHEN render THEN ảnh được prefetch cho 10 item đầu tiên trước khi hiển thị.
2. GIVEN ảnh đang tải WHEN chưa load xong THEN hiển thị skeleton placeholder đúng kích thước, không bị layout shift.
3. GIVEN ảnh đã tải WHEN cuộn lại THEN ảnh được cache và không tải lại từ network.
4. GIVEN ảnh lỗi WHEN không load được THEN hiển thị fallback icon thay vì màn hình trắng/lỗi.
5. GIVEN component ảnh WHEN được dùng trong FlatList THEN sử dụng removeClippedSubviews, maxToRenderPerBatch, windowSize đã được tối ưu.

### Requirement 3: Tìm kiếm gần đúng (Fuzzy Search / Diacritic-insensitive)

**User Story:** Là khách hàng, tôi muốn tìm kiếm không phân biệt dấu tiếng Việt, ví dụ gõ "Hung" vẫn tìm ra "Hùng", để tìm kiếm nhanh hơn khi không có bàn phím tiếng Việt.

#### Acceptance Criteria

1. GIVEN thanh tìm kiếm trong ProductScreen WHEN người dùng gõ "hung" THEN kết quả bao gồm các mục có "Hùng", "Hung", "hùng", "hung".
2. GIVEN thanh tìm kiếm WHEN người dùng gõ "Hùng" THEN kết quả bao gồm cả "Hung" (không dấu).
3. GIVEN thanh tìm kiếm WHEN người dùng gõ THEN tìm kiếm real-time (debounce 300ms) không cần nhấn Enter.
4. GIVEN hàm normalize WHEN nhận chuỗi tiếng Việt THEN trả về chuỗi ASCII không dấu (ví dụ: "Hùng" → "Hung", "đường" → "duong").
5. GIVEN tìm kiếm WHEN không có kết quả THEN hiển thị thông báo "Không tìm thấy kết quả cho '[query]'".
6. GIVEN utility function normalizeVietnamese WHEN được tạo THEN đặt trong src/utils/ và có thể tái sử dụng ở các màn hình khác.
7. GIVEN thanh tìm kiếm WHEN người dùng xóa hết text THEN hiển thị lại toàn bộ danh sách.

### Requirement 4: Sửa lỗi trùng gara trong ProductScreen

**User Story:** Là khách hàng, khi tôi đổi mã gara, tôi chỉ muốn thấy 1 tab cho mỗi gara, không bị hiển thị 2 tab trùng nhau cho cùng 1 gara.

#### Acceptance Criteria

1. GIVEN người dùng có 2 gara đã lưu với cùng garageId nhưng khác garageCode (do đổi mã) WHEN vào ProductScreen THEN chỉ hiển thị 1 tab cho gara đó (ưu tiên mã mới nhất).
2. GIVEN selectSavedGarages selector WHEN trả về danh sách THEN danh sách đã được deduplicate theo garageId (nếu có) hoặc garageCode.
3. GIVEN GarageTabs component WHEN nhận garages prop THEN tự deduplicate trước khi render để tránh key trùng.
4. GIVEN upsertSavedGarage action WHEN thêm gara với garageId đã tồn tại THEN cập nhật entry cũ thay vì thêm mới.
5. GIVEN sanitizeGarageContextState WHEN được gọi khi rehydrate Redux THEN loại bỏ các entry trùng garageId trong savedGarages.

### Requirement 5: Tinh gọn Profile Screen khách hàng

**User Story:** Là khách hàng, tôi muốn Profile screen gọn gàng hơn, không hiển thị các tính năng chưa hoàn thiện hoặc không cần thiết.

#### Acceptance Criteria

1. GIVEN người dùng là customer WHEN vào Profile screen THEN không hiển thị item "Đổi mật khẩu" trong section Tài khoản.
2. GIVEN người dùng là customer WHEN vào Profile screen THEN không hiển thị item "Cài đặt thông báo" (tạm ẩn, có thể bật lại sau).
3. GIVEN các role khác (employee, dealer, garage_manager, garage_admin) WHEN vào Profile screen THEN vẫn hiển thị đầy đủ các item như hiện tại (không thay đổi).
4. GIVEN item "Đổi mật khẩu" bị ẩn WHEN cần bật lại THEN chỉ cần thêm lại vào buildRoleMenuConfig cho case customer mà không cần thay đổi logic khác.
5. GIVEN item "Cài đặt thông báo" bị ẩn WHEN cần bật lại THEN tương tự, chỉ cần uncomment/thêm lại vào config.

### Requirement 6: Mở rộng form thông tin xe — tất cả trường, không bắt buộc

**User Story:** Là khách hàng, tôi muốn thấy đầy đủ các trường thông tin xe để điền khi có giấy tờ, nhưng không bị bắt buộc phải điền hết khi chưa có (ví dụ khi không mang giấy tờ theo).

#### Acceptance Criteria

1. GIVEN VehicleEditScreen WHEN hiển thị THEN form có đầy đủ các trường: Model, Ảnh xe, Số bằng lái, Ngày hết hạn bằng lái, Số đăng kiểm, Ngày đăng kiểm, Ngày hết hạn đăng kiểm, Đơn vị bảo hiểm, Ngày bắt đầu bảo hiểm, Ngày hết hạn bảo hiểm.
2. GIVEN người dùng nhấn "Cập nhật thông tin xe" WHEN có trường để trống THEN hệ thống vẫn cho phép lưu (không hiện lỗi validation bắt buộc).
3. GIVEN trường để trống WHEN lưu THEN gửi null lên backend cho trường đó (không gửi chuỗi rỗng).
4. GIVEN trường đã có dữ liệu trước đó WHEN người dùng xóa hết THEN backend nhận null và xóa dữ liệu cũ.
5. GIVEN validation hiện tại trong useVehicleEditScreen WHEN cập nhật THEN xóa các Alert bắt buộc nhập đủ thông tin đăng kiểm và bảo hiểm.
6. GIVEN backend endpoint PUT /vehicles/:id WHEN nhận payload với trường null THEN cập nhật trường đó thành NULL trong database (không bỏ qua).
7. GIVEN form WHEN hiển thị trường tùy chọn THEN có label phụ "(Tùy chọn)" hoặc placeholder rõ ràng để người dùng biết không bắt buộc.
