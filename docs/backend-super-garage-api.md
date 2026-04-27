# Backend update: `is_super_garage` for garages

## 1. Muc tieu

- Danh dau gara chu trong he thong bang 1 flag o bang `garages`.
- Chi su dung de backend/frontend **kiem tra** khi fetch du lieu.
- **Khong mo API cap nhat** flag nay tu web/app.

## 2. Database migration (MySQL)

```sql
ALTER TABLE `garages`
  ADD COLUMN `is_super_garage` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1 = gara chu, 0 = gara thuong',
  ADD COLUMN `super_garage_unique_key` TINYINT
    GENERATED ALWAYS AS (CASE WHEN `is_super_garage` = 1 THEN 1 ELSE NULL END) STORED,
  ADD UNIQUE INDEX `ux_garages_super_garage_one` (`super_garage_unique_key`);
```

Seed gara chu (vi du):

```sql
UPDATE `garages`
SET `is_super_garage` = 1
WHERE `id` = 1;
```

## 3. API contract can tra them field

`is_super_garage` can duoc tra ve o cac API fetch gara:

1. `GET /api/public/garages`
2. `GET /api/public/garages/by-code/:code`
3. Cac endpoint auth/login co tra object `garage` (neu co)
4. Cac endpoint manager/web list gara (neu co)

Mau object:

```json
{
  "id": 1,
  "code": "HQ",
  "name": "Head Quarter",
  "is_super_garage": true,
  "status": "active"
}
```

## 4. Quy tac backend

- Field nay la **read-only** qua API.
- Bo qua moi input client co `is_super_garage` trong body.
- Khong tao route `PATCH/PUT /garages/:id/is-super-garage`.
- Neu can doi gara chu: thao tac bang migration/tool noi bo + audit log.

## 5. Mo ta trien khai backend (service/repository)

1. Them cot vao ORM model (`Garage`).
2. Them field vao select mapper cho response DTO.
3. Dam bao cac query list/detail gara include `is_super_garage`.
4. Khong map field nay vao create/update payload.
5. Them test:
   - API fetch tra dung field `is_super_garage`.
   - API update garage gui `is_super_garage` khong thay doi duoc gia tri DB.

