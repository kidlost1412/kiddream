# 🚀 HƯỚNG DẪN FIX NHANH

## ❌ VẤN ĐỀ: Deploy rồi nhưng không thấy gì mới

---

## ✅ GIẢI PHÁP NHANH (3 BƯỚC)

### **Bước 1: Clear Browser Cache**
```
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

### **Bước 2: Chạy SQL trong Supabase**
1. Vào https://supabase.com → Project → SQL Editor
2. Copy & paste nội dung file `supabase/seed_rewards.sql`
3. Click **Run**
4. Verify: `SELECT COUNT(*) FROM rewards;` → Phải có **15**

### **Bước 3: Access Debug Page**
Sau khi deploy, vào:
```
https://your-site.netlify.app/#/debug
```

Trang này sẽ cho biết:
- ✅ Environment variables có đúng không
- ✅ Supabase có connect được không
- ✅ Shop có bao nhiêu items
- ✅ Features nào đã hoạt động

---

## 📊 KIỂM TRA NHANH

### ✅ Calendar Header đã fix:
**Trước:**
```
[Title] [- 7 Days +] [New Task]
```

**Sau (2 hàng):**
```
[Lịch làm việc của tôi]          [+ Công việc mới]
────────────────────────────────────────────────────
[List|Grid] [← Date →] [Hôm nay] [7 ngày ▼]
```

### ✅ Click Task → Modal:
1. Vào "Lịch làm việc"
2. Chuyển sang List view
3. Click vào task bất kỳ
4. Modal hiện với đầy đủ info

### ✅ Shop có items:
1. Vào "Cửa hàng"
2. Phải thấy 15 rewards
3. Nếu trống → Chạy `seed_rewards.sql`

---

## 🐛 NẾU VẪN KHÔNG WORK

### 1. Check Console (F12)
Xem có error gì không?

### 2. Verify Build File
File JS mới nhất: **`index-Wf7zYU7Q.js`**

Check trong `dist/index.html`:
```html
<script ... src="/assets/index-Wf7zYU7Q.js"></script>
```

### 3. Force Redeploy
```bash
rm -rf dist
npm run build
netlify deploy --prod
```

### 4. Check Netlify Env Vars
1. Netlify Dashboard → Site settings
2. Environment variables
3. Verify có:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

---

## 📝 FILES CHANGED (Latest)

### New:
- `pages/DebugPage.tsx` - Debug dashboard
- `TEST_CHECKLIST.md` - Full checklist
- `QUICK_FIX_GUIDE.md` - This file

### Modified:
- `App.tsx` - Added /debug route
- Build hash: `index-Wf7zYU7Q.js`

---

## 🎯 EXPECTED RESULTS

Sau khi fix xong, bạn sẽ thấy:

1. **Calendar:**
   - ✅ Header 2 hàng rõ ràng
   - ✅ Không còn "- 7 Days"
   - ✅ Click task → Modal chi tiết
   - ✅ List view scroll mượt

2. **Shop:**
   - ✅ 15 rewards với icon
   - ✅ Giá từ 50-200 điểm
   - ✅ Categories: Relax, Joy, Growth

3. **Debug Page:**
   - ✅ All green checkmarks
   - ✅ Rewards count: 15
   - ✅ Supabase: Connected

---

## ⚡ MOST COMMON ISSUE

**90% trường hợp:** Browser cache chưa clear!

**Fix:** Ctrl+Shift+R hoặc mở Incognito mode

---

**Last Build:** Oct 28, 2025, 12:05 PM  
**Build Hash:** `index-Wf7zYU7Q.js`  
**Status:** ✅ Ready to deploy
