# Database Schema - Sora POS

## ERD (Entity Relationship Diagram)

```
roles ─── users ─── orders ─── order_details
                      │             │
                      │         products ─── categories
                      │             │          suppliers
                      │             │
                  customers     stock_transactions
                                stock_alerts
                                ai_recommendations
```

## Bảng chi tiết

### roles
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | |
| name | VARCHAR(50) | admin, manager, cashier |
| description | TEXT | |

### users
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | |
| email | VARCHAR(255) | Unique |
| password_hash | VARCHAR(255) | bcrypt hash |
| full_name | VARCHAR(255) | |
| role_id | UUID (FK→roles) | |
| is_active | BOOLEAN | Default: true |

### products
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | |
| sku | VARCHAR(100) | Unique |
| name | VARCHAR(255) | |
| cost_price | DECIMAL(15,2) | Giá nhập |
| sell_price | DECIMAL(15,2) | Giá bán |
| **stock_quantity** | INTEGER | **Tồn kho hiện tại** |
| **min_stock_level** | INTEGER | **Ngưỡng cảnh báo** |
| category_id | UUID (FK→categories) | |
| supplier_id | UUID (FK→suppliers) | |

### orders
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | |
| order_number | VARCHAR(50) | ORD-YYYYMMDD-XXX |
| total_amount | DECIMAL(15,2) | Trước giảm giá |
| discount_amount | DECIMAL(15,2) | |
| final_amount | DECIMAL(15,2) | Sau giảm giá |
| status | VARCHAR(20) | completed/cancelled/refunded |
| payment_status | VARCHAR(20) | paid/unpaid/partial |

### stock_transactions
| Column | Type | Description |
|--------|------|-------------|
| type | VARCHAR(20) | **import/sale/adjustment/return** |
| quantity | INTEGER | Dương=nhập, Âm=xuất |
| previous_stock | INTEGER | Trước giao dịch |
| new_stock | INTEGER | Sau giao dịch |

### stock_alerts
| Column | Type | Description |
|--------|------|-------------|
| status | VARCHAR(20) | **low_stock/out_of_stock/resolved** |
| current_stock | INTEGER | |
| min_stock_level | INTEGER | |

### ai_recommendations
| Column | Type | Description |
|--------|------|-------------|
| recommended_quantity | INTEGER | Số lượng gợi ý nhập |
| priority | VARCHAR(10) | low/medium/high |
| reason | TEXT | Lý do |
| ai_insight | TEXT | Nhận xét từ Groq AI |
