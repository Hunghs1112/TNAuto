# Plan cap nhat HomeScreen cho role Quan ly sau login

## 1. Muc tieu

- Sau khi login role `garage_manager` hoac `garage_admin`, nguoi dung vao dung HomeScreen danh cho quan ly.
- Home manager co UI/du lieu rieng, khong dung chung home customer.
- Khong thay doi flow API login hien tai; chi bo tri lai route + view-model + UI rendering Home.
- Dam bao tuong thich nguoc voi token cu (`garage_admin`).

## 2. Pham vi

Trong scope:
- Entry Home va role switch sau login.
- Tach Home thanh cac shell theo role:
  - `CustomerHome`
  - `ManagerHome`
  - `EmployeeHome` (giu nguyen neu da co)
- View-model/hook cho manager Home.
- Dieu huong va guard vao Home theo role.
- Navbar/menu hien thi dung theo role manager.

Ngoai scope:
- Doi API backend hoac contract login response.
- Refactor toan bo man Orders/Customers/Services/Product.
- Thay doi luong auth persistence.

## 3. Hien trang can xu ly

- Home hien tai van co logic dung chung nhieu role trong `useHomeScreen`.
- Sau login manager, route den Home nhung chua co lop manager dashboard tach biet ro rang.
- Policy role o Home/Navigator chua dong nhat 100% voi menu + widgets.

## 4. Dinh huong thiet ke

- Tao `HomeRoleRouter` tai `HomeScreen` (hoac layer ngay tren Home) de switch theo `userType`.
- Moi role co mot component Home rieng, dung chung component nho neu can.
- Tach logic manager vao hook rieng: `useManagerHomeScreen`.
- Dung contract view-model ro rang:
  - `managerHomeVM` (kpi, orders, quickActions, alerts)
  - `customerHomeVM` (giu theo luong hien tai)

## 5. Ke hoach implementation theo phase

### Phase 1: Role routing + shell tach rieng

1. Them role switch tai entry Home:
   - `garage_manager`/`garage_admin` -> `ManagerHomeScreen`.
   - `customer` -> `CustomerHomeScreen`.
   - `employee` -> `EmployeeHomeScreen`.
2. Tao skeleton `ManagerHomeScreen` voi section co ban:
   - Header manager
   - KPI cards placeholder
   - Orders blocks placeholder
   - Quick actions placeholder
3. Cap nhat redirect sau login de vao dung landing role.

Definition of done:
- Login manager vao dung Home manager.
- Login customer/employee khong bi anh huong.

### Phase 2: Manager dashboard data + widget

1. Tao `useManagerHomeScreen`:
   - Lay danh sach don cho xu ly.
   - Lay danh sach don qua han/uu tien cao (neu co endpoint).
   - Lay thong ke nhanh (so don moi, dang xu ly, hoan thanh ngay).
2. Map du lieu sang `managerHomeVM`.
3. Render widget manager:
   - `PendingOrdersCard`
   - `OverdueOrdersCard`
   - `TodaySummaryCard`
   - `QuickActions`
4. Empty/loading/error state cho tung block.

Definition of done:
- Home manager hien du du lieu chinh, co loading/error state ro rang.

### Phase 3: Role guard + menu dong bo

1. Dong bo `Navbar/MainTabs` theo `menuConfigByRole`.
2. Role guard route manager-only:
   - Neu customer vao route manager -> redirect ve customer home.
3. Ho tro legacy role:
   - `garage_admin` map chung policy voi `garage_manager`.

Definition of done:
- Khong con truy cap nham route khi sai role.
- Menu manager hien dung tap chuc nang.

## 6. Danh sach file du kien tac dong

- `src/screens/Home/HomeScreen.tsx`
- `src/screens/Home/useHomeScreen.ts`
- `src/screens/Home/useManagerHomeScreen.ts` (new)
- `src/screens/Home/ManagerHomeScreen.tsx` (new)
- `src/navigation/MainTabs.tsx`
- `src/navigation/AppNavigator.tsx`
- `src/components/Navbar.tsx`
- `src/components/navbarPolicy.ts` (neu dang dung)
- `src/redux/slices/authSlice.ts` (chi neu can bo sung role mapping helper)

## 7. Ke hoach test

### UI/UX test

- Login manager -> vao `ManagerHomeScreen`.
- Login admin legacy -> vao `ManagerHomeScreen`.
- Login customer -> van vao home customer.
- Login employee -> van vao home employee.
- Kiem tra responsive tren man hinh nho/lon.

### Regression test

- Customer login flow.
- Employee login flow.
- Dealer/manager login flow.
- Logout -> login lai dung role.
- Refresh app (persist session) van vao dung home role.

### Ky thuat

- ESLint pass cho toan bo file da sua.
- Khong warning inline style o nhom Home moi.
- Khong crash khi API manager home tra ve rong/loi.

## 8. Rui ro va giam thieu

- Rui ro: Logic role dang nam rai rac o nhieu noi.
  - Giam thieu: gom role policy vao mot module config dung chung.
- Rui ro: manager home phu thuoc endpoint chua on dinh.
  - Giam thieu: fallback empty state + retry + khong block navigation.
- Rui ro: anh huong home customer hien tai.
  - Giam thieu: tach file/customer flow truoc, refactor nho theo phase.

## 9. Deliverables

1. `ManagerHomeScreen` + `useManagerHomeScreen`.
2. Role-based Home router hoan chinh.
3. Policy menu/route guard dong bo cho manager.
4. Checklist test + ket qua regression cho 4 role chinh.

## 10. Thu tu thuc thi de bat dau ngay

1. Tao skeleton `ManagerHomeScreen` + wiring role switch o `HomeScreen`.
2. Chay duoc login manager vao manager home.
3. Moi bo sung data widgets theo tung block (pending -> summary -> quick actions).
4. Chot role guard/menu sau cung.

## 11. Phase 4 - Manager App API Expansion (bat dau 2026-04-27)

Muc tieu:
- Dong bo API app manager theo luong van hanh thuc te tren mobile.
- Reuse toi da controller/business logic web manager, tranh lech nghiep vu.
- Chuan hoa contract response de app map du lieu on dinh.

Nguyen tac:
- Prefix app manager: `/api/app/manager/*`.
- Auth middleware: `requireGarageManagerAuth` (chap nhan `garage_manager` + `garage_admin` trong giai doan chuyen doi).
- Route co `:id` phai qua `validatePositiveIntParam`.
- Khong dua API web-only len app: upload/image CRUD, notification logs, settings nang cao.

### 11.1 API backlog moi (de mo luong van hanh)

1. Lich hen + SLA:
- GET `/api/app/manager/appointments`
- POST `/api/app/manager/appointments`
- GET `/api/app/manager/appointments/:id`
- PUT `/api/app/manager/appointments/:id`
- PATCH `/api/app/manager/appointments/:id/status`
- DELETE `/api/app/manager/appointments/:id`
- GET `/api/app/manager/service-orders/:id/sla`

2. Home manager (tai chinh + xu huong):
- GET `/api/app/manager/home/revenue-summary`
- GET `/api/app/manager/home/kpi-trend`
- GET `/api/app/manager/home/top-services`
- GET `/api/app/manager/home/top-products`

3. Service order workflow:
- PATCH `/api/app/manager/service-orders/:id/cancel`
- PATCH `/api/app/manager/service-orders/:id/reopen`
- PATCH `/api/app/manager/service-orders/:id/priority`
- PATCH `/api/app/manager/service-orders/:id/schedule`
- GET `/api/app/manager/service-orders/:id/timeline`

4. Workforce scheduling:
- GET `/api/app/manager/employees/availability`
- POST `/api/app/manager/employees/shift`
- GET `/api/app/manager/employees/:id/workload`

5. Communications (bo sung):
- POST `/api/app/manager/notifications/bulk`
- PATCH `/api/app/manager/notifications/:id/read`
- PATCH `/api/app/manager/notifications/read-all`

### 11.2 Thu tu rollout backend/mobile theo wave

Wave A (homescreen truoc):
1. Home finance KPI: `home/revenue-summary`, `home/kpi-trend`, `home/top-services`, `home/top-products`.
2. Danh sach lich hen: `appointments` (GET list + filter theo ngay/trang thai).

Wave B (van hanh don):
1. Service-order action: `cancel`, `reopen`, `priority`, `schedule`.
2. Timeline + SLA detail cho man hinh chi tiet don.

Wave C (nhan su + thong bao):
1. Employee availability/workload/shift.
2. Notification `bulk`, `read`, `read-all`.

Wave D (hardening):
1. Chuan hoa pagination/filter/sort.
2. Bo sung idempotency cho action nhay cam.
3. Audit log cho action manager quan trong.

### 11.3 Contract chuan de app tich hop on dinh

Request list query:
- `page`, `limit`, `sort_by`, `sort_dir`, `q`, `status`, `from`, `to`.

Response chung:
```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 200,
    "total_pages": 10
  },
  "message": "ok",
  "error_code": null
}
```

Error code toi thieu:
- 400: validate input/query/param.
- 401: token invalid/expired.
- 403: sai role/sai quyen.
- 404: resource not found.
- 409: business conflict (invalid state transition).

### 11.4 Definition of done cho dot API expansion

1. Home manager tren app hien KPI tai chinh + top items + lich hen.
2. Service order co du action van hanh (`assign/complete/cancel/reopen/priority/schedule`).
3. Role `garage_manager` va `garage_admin` deu qua duoc auth/guard nhu nhau trong phase chuyen doi.
4. Regression endpoint da co (Phase 1/2) khong thay doi contract bat ngo.
5. Co checklist monitoring sau deploy:
   - login success rate
   - 401/403 rate
   - 5xx rate
   - action success rate theo endpoint
