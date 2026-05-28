# Sora POS - API Documentation

## Base URL
```
http://localhost:3001/api
```

## Authentication
Tất cả API (trừ login & health check) đều yêu cầu header:
```
Authorization: Bearer <token>
```

## Response Format
```json
{
  "success": true,
  "message": "Thành công",
  "data": { ... }
}
```

---

## 🏥 Health Check
### `GET /api/health`
Kiểm tra server hoạt động.

---

## 🔐 Auth
### `POST /api/auth/login`
**Body:**
```json
{ "email": "admin@sorapos.com", "password": "password123" }
```
**Response:** `{ user, token }`

### `POST /api/auth/logout`
### `GET /api/auth/profile`

---

## 📦 Products
### `GET /api/products` - Danh sách (phân trang, tìm kiếm)
### `GET /api/products/:id` - Chi tiết
### `POST /api/products` - Tạo mới (admin, manager)
### `PUT /api/products/:id` - Cập nhật (admin, manager)
### `DELETE /api/products/:id` - Xóa (admin)

---

## 🏷️ Categories
### `GET /api/categories` - Danh sách
### `POST /api/categories` - Tạo mới (admin, manager)
### `PUT /api/categories/:id` - Cập nhật
### `DELETE /api/categories/:id` - Xóa (admin)

---

## 🚚 Suppliers
### `GET /api/suppliers`
### `POST /api/suppliers` (admin, manager)
### `PUT /api/suppliers/:id`
### `DELETE /api/suppliers/:id` (admin)

---

## 👥 Customers
### `GET /api/customers` - Tìm kiếm `?search=xxx`
### `POST /api/customers` (admin, manager)
### `PUT /api/customers/:id`

---

## 🧾 Orders
### `GET /api/orders` - Danh sách
### `GET /api/orders/:id` - Chi tiết (kèm order_details, payment)
### `POST /api/orders` - Tạo hóa đơn
**Body:**
```json
{
  "customer_id": "uuid (optional)",
  "items": [
    { "product_id": "uuid", "quantity": 2, "unit_price": 12000, "discount": 0 }
  ],
  "discount_amount": 0,
  "payment_method": "cash",
  "received_amount": 50000,
  "note": ""
}
```

---

## 💳 Payments
### `GET /api/payments/recent`
### `GET /api/payments/order/:orderId`

---

## 🏭 Stock
### `GET /api/stock/alerts` - Cảnh báo tồn kho
### `GET /api/stock/transactions` - Lịch sử giao dịch kho
### `POST /api/stock/import` - Nhập kho (admin, manager)
### `POST /api/stock/adjust` - Điều chỉnh (admin, manager)

---

## 📈 Reports
### `GET /api/reports/dashboard` - Dữ liệu tổng quan
### `GET /api/reports/top-products` - Top sản phẩm bán chạy
### `GET /api/reports/revenue` - Doanh thu theo ngày
### `GET /api/reports/low-stock` - Sản phẩm tồn kho thấp

---

## 🤖 AI
### `POST /api/ai/recommend-restock` - Gợi ý nhập hàng
**Body (optional):**
```json
{ "target_days": 14, "product_ids": ["uuid1", "uuid2"] }
```
### `GET /api/ai/recommendations` - Lịch sử gợi ý
