# Chinese Vocabulary Learning

Web app học từ vựng tiếng Trung, thuần HTML/CSS/JS, không cần backend. Dữ liệu lưu trong `localStorage` (key `chinese_learning_topics`).

## Chạy local
Mở `index.html` bằng trình duyệt (hoặc `python -m http.server`).

## Cấu trúc
- `index.html` – khung trang
- `css/style.css` – giao diện, responsive
- `js/storage.js` – toàn bộ logic localStorage (load/save/update/delete)
- `js/learning.js` – `LearningSession` (random, skip, lặp lại từ bị bỏ qua), độc lập với UI
- `js/app.js` – state, quản lý Topic, render UI

## Cách dùng
1. **Add Topic** → nhập tên, thêm từ (中文 / Pinyin / Tiếng Việt) → **Done**.
2. Mở Topic: **See All**, hoặc học **Việt → Trung** / **Trung → Việt**.
3. Trả lời sai: nhập lại hoặc **Skip**; từ bị Skip quay lại cho đến khi đúng hết.
4. Enter = Check/Next, Esc = đóng hộp thoại. Có thể Edit/Delete Topic.
Dữ liệu demo "Lesson 1 - HSK1" được tạo lần đầu; xóa được như topic bình thường.
Chế độ Trung → Việt bỏ qua dấu tiếng Việt ("xin chao" = "Xin chào").

## Deploy GitHub Pages
Đẩy code lên repo → Settings → Pages → Deploy from branch → `main` → `/ (root)`.
