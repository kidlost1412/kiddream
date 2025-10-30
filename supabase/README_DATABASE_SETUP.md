# 🗄️ HƯỚNG DẪN SETUP DATABASE SUPABASE

## Thứ tự chạy SQL (QUAN TRỌNG!)

Chạy các file SQL theo đúng thứ tự sau trong **Supabase SQL Editor**:

### 1️⃣ **schema.sql.txt** (Chạy đầu tiên)
```sql
-- Copy toàn bộ nội dung file schema.sql.txt và chạy
-- File này tạo:
-- - Tables: profiles, todos, habits, habit_logs, quests, user_quests, rewards
-- - Functions: handle_new_user, handle_todo_completion_reward
-- - Triggers
-- - RLS Policies
-- - Seed data cho quests và rewards
```

### 2️⃣ **schema_additions.sql** (Chạy sau)
```sql
-- Copy toàn bộ nội dung file schema_additions.sql và chạy
-- File này thêm:
-- - Table: user_inventory (kho đồ)
-- - Table: todo_attachments (file đính kèm)
-- - Columns mới: rewards.expiry_days, rewards.is_consumable
-- - Functions: claim_reward(), use_inventory_item(), expire_inventory_items()
-- - RLS Policies cho inventory và attachments
```

### 3️⃣ **seed_rewards.sql** (Nếu Shop trống)
```sql
-- Nếu Shop không có items, chạy file này
-- File này insert 15 rewards vào shop
```

---

## ✅ Kiểm tra sau khi chạy

### Kiểm tra tables đã tạo:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Kết quả mong đợi:**
- ai_memory
- habit_logs
- habits
- profiles
- quests
- rewards
- todo_attachments ✨ (mới)
- todos
- user_inventory ✨ (mới)
- user_quests

### Kiểm tra rewards có data:
```sql
SELECT COUNT(*) as total_rewards FROM public.rewards;
```
**Kết quả mong đợi:** Ít nhất 10-15 rewards

### Kiểm tra columns mới trong rewards:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'rewards' 
AND column_name IN ('expiry_days', 'is_consumable');
```
**Kết quả mong đợi:** 2 columns

### Kiểm tra functions:
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name IN ('claim_reward', 'use_inventory_item', 'expire_inventory_items');
```
**Kết quả mong đợi:** 3 functions

---

## 🔧 Troubleshooting

### Lỗi: "relation already exists"
➡️ Bỏ qua, table đã tồn tại

### Lỗi: "column already exists"
➡️ Bỏ qua, column đã được thêm

### Shop vẫn trống sau khi chạy schema.sql.txt
➡️ Chạy `seed_rewards.sql`

### Inventory không hoạt động
➡️ Đảm bảo đã chạy `schema_additions.sql`

---

## 🎯 Sau khi setup xong

1. **Restart dev server:**
   ```bash
   npm run dev
   ```

2. **Test các chức năng:**
   - ✅ Shop có hiển thị items
   - ✅ Mua reward → thêm vào Kho đồ
   - ✅ Kho đồ hiển thị items đã mua
   - ✅ Sử dụng item → status chuyển sang "Đã sử dụng"
   - ✅ Items có expiry date

3. **Generate types (optional):**
   ```bash
   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/supabase.ts
   ```

---

## 📝 Notes

- **RLS đã enabled:** Users chỉ xem được data của mình
- **Auto-expire:** Chạy `SELECT expire_inventory_items();` để expire items hết hạn
- **Backup:** Luôn backup database trước khi chạy migration lớn
