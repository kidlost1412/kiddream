# 🔍 CHECKLIST KIỂM TRA SAU KHI DEPLOY

## ❌ VẤN ĐỀ: Deploy rồi nhưng không thấy thay đổi

### Nguyên nhân có thể:

## 1. 🌐 BROWSER CACHE (Rất hay gặp!)

### ✅ Cách fix:
```
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

Hoặc:
1. Mở DevTools (F12)
2. Right-click vào nút Refresh
3. Chọn "Empty Cache and Hard Reload"

---

## 2. 🗄️ SUPABASE DATA - SHOP TRỐNG

### Kiểm tra:
1. Vào https://supabase.com
2. Chọn project
3. Vào **Table Editor** → **rewards**
4. Xem có data không?

### ❌ Nếu trống:
**Chạy file `seed_rewards.sql`:**

1. Vào **SQL Editor**
2. Copy nội dung file `supabase/seed_rewards.sql`
3. Paste và **Run**
4. Verify: `SELECT COUNT(*) FROM rewards;` → Phải có **15 rows**

---

## 3. 📦 BUILD KHÔNG CẬP NHẬT

### Kiểm tra file hash:
```bash
# Check file trong dist/
ls dist/assets/
```

**File hiện tại:** `index-CLAMZcyE.js`

### ✅ Rebuild và redeploy:
```bash
npm run build
netlify deploy --prod
```

---

## 4. 🔑 ENVIRONMENT VARIABLES

### Kiểm tra Netlify Environment Variables:
1. Vào Netlify Dashboard
2. Site settings → Environment variables
3. Verify có đủ:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GEMINI_API_KEY` (optional)

### ❌ Nếu thiếu:
1. Add variables
2. **Trigger redeploy** (quan trọng!)

---

## 5. 🧪 TEST TỪNG PHẦN

### A. Test Calendar Header:
**Mong đợi thấy:**
- ✅ 2 hàng rõ ràng
- ✅ "Lịch làm việc của tôi" + "Công việc mới" button (hàng 1)
- ✅ List/Grid toggle + Navigation + Days selector (hàng 2)
- ❌ KHÔNG còn "- 7 Days" button

**Nếu vẫn thấy "- 7 Days":**
→ Browser cache chưa clear!

---

### B. Test Click vào Task:
1. Vào "Lịch làm việc"
2. Chuyển sang **List view**
3. Click vào bất kỳ task nào

**Mong đợi:**
- ✅ Modal hiện ra với đầy đủ thông tin
- ✅ Có nút "Đánh dấu hoàn thành" và "Xóa"

**Nếu không hiện modal:**
→ Check Console (F12) xem có lỗi không

---

### C. Test Shop:
1. Vào "Cửa hàng"

**Mong đợi:**
- ✅ Thấy 15 rewards với icon, giá, mô tả
- ✅ Categories: Relax, Joy, Growth

**Nếu trống:**
→ Chưa chạy `seed_rewards.sql` trong Supabase!

---

### D. Test List View Scroll:
1. Vào "Lịch làm việc"
2. Chuyển sang **List view**
3. Thử scroll xuống

**Mong đợi:**
- ✅ Scroll mượt mà
- ✅ Không bị stuck

---

## 6. 🐛 DEBUG STEPS

### Step 1: Check Console
```
F12 → Console tab
```
Xem có error gì không?

### Step 2: Check Network
```
F12 → Network tab → Reload page
```
- File JS có load đúng không?
- API calls có thành công không?

### Step 3: Check Supabase Connection
```javascript
// Trong Console, chạy:
console.log(import.meta.env.VITE_SUPABASE_URL)
```
Phải thấy URL, không phải undefined

---

## 7. 🔄 FORCE REBUILD & REDEPLOY

### Nếu tất cả đều đúng mà vẫn không work:

```bash
# 1. Clean
rm -rf dist node_modules/.vite

# 2. Reinstall
npm install

# 3. Build
npm run build

# 4. Test local
npm run dev
# Mở http://localhost:5173 và test

# 5. Deploy
netlify deploy --prod
```

---

## 8. 📱 TEST TRÊN NHIỀU BROWSER

- ✅ Chrome (Incognito mode)
- ✅ Firefox (Private window)
- ✅ Edge
- ✅ Mobile browser

**Nếu chỉ 1 browser không work:**
→ Clear cache browser đó

---

## 9. ⏰ WAIT FOR PROPAGATION

Đôi khi Netlify CDN cần vài phút để propagate:
- Đợi 2-5 phút
- Clear cache
- Reload lại

---

## 10. 🆘 LAST RESORT

### Nếu vẫn không work:

1. **Check deployment logs:**
   ```
   netlify deploy --prod
   ```
   Xem có error trong build không?

2. **Verify deployed files:**
   - Vào Netlify Dashboard
   - Deploys → Latest deploy
   - Browse deploy → Xem file có đúng không

3. **Rollback và redeploy:**
   ```bash
   git status
   git log --oneline -5
   # Verify commit có changes mới
   
   npm run build
   netlify deploy --prod
   ```

---

## ✅ CHECKLIST CUỐI CÙNG

Sau khi làm tất cả, verify:

- [ ] Browser cache đã clear (Ctrl+Shift+R)
- [ ] Supabase có 15 rewards (`SELECT COUNT(*) FROM rewards`)
- [ ] Environment variables đã set đúng
- [ ] Build file mới (`index-CLAMZcyE.js`)
- [ ] Deploy thành công (no errors)
- [ ] Calendar header có 2 hàng, không có "- 7 Days"
- [ ] Click task → hiện modal
- [ ] List view scroll được
- [ ] Shop có 15 items

---

## 🎯 MOST LIKELY ISSUES:

### 1. **Browser cache** (90% cases)
→ **Fix:** Ctrl+Shift+R

### 2. **Supabase seed data** (Shop trống)
→ **Fix:** Chạy `seed_rewards.sql`

### 3. **Environment variables** (Netlify)
→ **Fix:** Add vars và trigger redeploy

---

**Hãy làm theo thứ tự từ trên xuống!**
