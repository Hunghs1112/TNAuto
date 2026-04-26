# UI/Logic Separation Convention

## Mục tiêu
Luôn tách logic ra khỏi giao diện. File UI chỉ nên lo render, nhận props, và gọi callback đã được chuẩn bị sẵn.

## Quy tắc
- Không đặt business logic trong component UI nếu có thể tránh được.
- Không để fetch, transform data, validation, side effects, navigation logic phức tạp nằm trực tiếp trong màn hình UI.
- Ưu tiên tách ra:
  - `hook` cho state, effect, query, handler
  - `container` cho orchestration
  - `component` con cho phần render nhỏ
  - `helper` cho format/mapper/pure functions

## Khi nào cần tách
- File UI quá dài hoặc nhiều nhánh render.
- Có nhiều `useEffect`, `useMemo`, `useCallback` xử lý nghiệp vụ.
- Có gọi API, navigate, update store/context, hoặc xử lý dữ liệu phức tạp.
- Component vừa render vừa quyết định luồng nghiệp vụ.

## Mục tiêu cấu trúc
- UI component: chỉ render và nhận props
- Hook/container: giữ logic
- Helper/service: giữ xử lý thuần

## Áp dụng cho toàn repo
Nếu gặp file giao diện có logic, mặc định phải ưu tiên refactor theo hướng tách logic ra ngoài trước khi thêm tính năng mới.
