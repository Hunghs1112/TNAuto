/**
 * Utility: Fuzzy search tiếng Việt không phân biệt dấu
 *
 * Ví dụ:
 *   normalizeVietnamese("Hùng")  → "hung"
 *   normalizeVietnamese("đường") → "duong"
 *   fuzzyMatchVietnamese("Nguyễn Hùng", "hung") → true
 */

/**
 * Chuẩn hóa chuỗi tiếng Việt về ASCII không dấu, lowercase.
 * An toàn với null/undefined — trả về '' thay vì crash.
 */
export function normalizeVietnamese(str: string | null | undefined): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // xóa combining diacritics (dấu huyền, sắc, hỏi, ngã, nặng, v.v.)
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

/**
 * Kiểm tra xem `text` có chứa `query` sau khi normalize không.
 * - Query rỗng → luôn trả về true
 * - Không phân biệt dấu: "hung" match "Hùng", "Hùng" match "Hung"
 */
export function fuzzyMatchVietnamese(
  text: string | null | undefined,
  query: string | null | undefined,
): boolean {
  const normalizedQuery = normalizeVietnamese(query);
  if (!normalizedQuery) return true;
  return normalizeVietnamese(text).includes(normalizedQuery);
}
