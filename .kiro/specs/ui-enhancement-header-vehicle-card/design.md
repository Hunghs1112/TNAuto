# Design Document

## Overview

Hai thay đổi UI: (1) tăng shadow cho `Header` component để tách biệt rõ hơn với nội dung, (2) redesign `VehicleInfoCard` thành thẻ ngang gradient hiện đại với hình ảnh xe bên trái, thông tin + expiry chips bên phải, nút "Xem chi tiết" nổi bật.

## Architecture

Không thêm dependency mới. Tất cả thay đổi là style và layout trong các file hiện có:
- `src/components/Header.tsx` — tăng shadow
- `src/screens/Home/VehicleInfoCard.tsx` — redesign layout

`DocumentExpiryCards` và `Navbar` **không thay đổi** (Navbar đã có shadow đủ mạnh: elevation 20, shadowOpacity 0.3).

## Component Design

### 1. Header.tsx — Tăng shadow

**Thay đổi duy nhất**: cập nhật shadow values trong `styles.header`:

```
// Trước
elevation: 4,
shadowOpacity: 0.1,
shadowRadius: 8,
shadowOffset: { width: 0, height: 2 },

// Sau
elevation: 10,
shadowOpacity: 0.18,
shadowRadius: 10,
shadowOffset: { width: 0, height: 5 },
```

### 2. VehicleInfoCard.tsx — Redesign thành thẻ ngang gradient

**Layout mới** (theo thiết kế tham khảo):

```
┌─────────────────────────────────────────────────┐  ← gradient navy→cobalt, borderRadius 20
│  [car icon]  THẺ XE                    [✓ badge] │  ← header row
│  ─────────────────────────────────────────────── │
│  ┌──────────┐  Biển số: 51A-123.45               │
│  │  image/  │  Dòng xe: Toyota Vios              │
│  │  icon    │  ┌──────┐ ┌──────┐ ┌──────┐       │
│  │  90×90   │  │ Bằng │ │Đăng  │ │Bảo   │       │
│  └──────────┘  │ lái  │ │kiểm  │ │hiểm  │       │
│                └──────┘ └──────┘ └──────┘       │
│                              [Xem chi tiết →]   │
└─────────────────────────────────────────────────┘
```

**Màu sắc**:
- Background: `LinearGradient` với `Colors.gradients.primary` (`['#112552', '#1e406b']`)
- Tất cả text: `Colors.text.inverted` (`#FFFFFF`)
- Expiry chips: semi-transparent white background (`rgba(255,255,255,0.15)`)
- Chip text màu theo trạng thái: expired=`#FF6B6B`, expiring=`#FFD93D`, valid=`#6BCB77`, missing=`rgba(255,255,255,0.5)`
- Action button: `rgba(255,255,255,0.2)` background, white text + icon

**Shadow card**:
- iOS: `shadowColor: "#000"`, `shadowOffset: {width:0, height:6}`, `shadowOpacity: 0.2`, `shadowRadius: 14`
- Android: `elevation: 8`

**Expiry chips** — 3 chip nhỏ inline dùng lại logic `getExpiryMeta` từ `DocumentExpiryCards`:
- Mỗi chip: icon nhỏ + label ngắn ("Bằng lái", "Đăng kiểm", "Bảo hiểm") + dot màu trạng thái
- Không hiển thị ngày cụ thể (tiết kiệm không gian), chỉ dot + label

**States giữ nguyên**: loading skeleton, error, empty, no garage context — chỉ wrap trong gradient card thay vì card trắng.

## Data Flow

Không thay đổi data flow. `VehicleInfoCard` vẫn dùng:
- `useGetCustomerVehiclesQuery` từ `vehicleApi`
- `useAppSelector` cho `userId`, `userPhone`, `garageContext`
- Navigation sang `VehicleDetail` khi tap

## Files to Modify

| File | Thay đổi |
|------|----------|
| `src/components/Header.tsx` | Tăng shadow values trong `styles.header` |
| `src/screens/Home/VehicleInfoCard.tsx` | Redesign layout + styles thành thẻ ngang gradient |
