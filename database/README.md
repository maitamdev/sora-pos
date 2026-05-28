# Database - Sora POS

## Thiết lập

1. Tạo project trên [Supabase](https://supabase.com)
2. Mở **SQL Editor** trong Supabase Dashboard
3. Chạy file `schema.sql` để tạo các bảng
4. Chạy file `seed.sql` để thêm dữ liệu mẫu

## Các bảng chính

| Bảng | Mô tả |
|------|--------|
| `roles` | Vai trò người dùng (admin, manager, cashier) |
| `users` | Thông tin người dùng |
| `categories` | Danh mục sản phẩm |
| `suppliers` | Nhà cung cấp |
| `products` | Sản phẩm (có stock_quantity, min_stock_level) |
| `customers` | Khách hàng |
| `orders` | Hóa đơn |
| `order_details` | Chi tiết hóa đơn |
| `payments` | Thanh toán |
| `stock_transactions` | Giao dịch kho (import, sale, adjustment, return) |
| `stock_alerts` | Cảnh báo tồn kho (low_stock, out_of_stock, resolved) |
| `ai_recommendations` | Gợi ý nhập hàng AI |

## Lưu ý

- Password trong seed.sql là dummy hash, cần hash lại khi triển khai thật
- Dữ liệu mẫu bao gồm sản phẩm tồn kho thấp để test tính năng cảnh báo
