-- =================================================================
-- SEED DATA FOR REWARDS (SHOP ITEMS)
-- =================================================================
-- Run this if your shop is empty
-- =================================================================

-- Clear existing rewards (optional)
-- TRUNCATE public.rewards CASCADE;

-- Insert shop rewards
INSERT INTO public.rewards (name, description, cost, icon, category, expiry_days, is_consumable)
VALUES
  ('15-Minute Break', 'Nghỉ ngơi 15 phút không lo lắng để thư giãn, kéo dãn hoặc làm điều bạn thích.', 50, '🧘', 'Relax', 7, true),
  ('Listen to a Podcast', 'Thưởng thức một tập podcast yêu thích để thư giãn hoặc học điều mới.', 75, '🎧', 'Joy', 14, true),
  ('Watch an Episode', 'Xem một tập phim hoặc series yêu thích của bạn.', 100, '📺', 'Joy', 7, true),
  ('Coffee or Tea Treat', 'Thưởng cho mình một ly cà phê hoặc trà đặc biệt từ quán yêu thích.', 125, '☕', 'Relax', 14, true),
  ('30-Minute Gaming Session', 'Chơi game yêu thích trong 30 phút để giải trí.', 150, '🎮', 'Joy', 7, true),
  ('Read a Chapter', 'Đọc một chương sách yêu thích hoặc khám phá sách mới.', 80, '📖', 'Growth', null, false),
  ('Social Media Time', '20 phút lướt mạng xã hội không lo lắng.', 60, '📱', 'Joy', 3, true),
  ('Favorite Snack', 'Thưởng thức món ăn vặt yêu thích của bạn.', 90, '🍿', 'Joy', 7, true),
  ('Movie Night', 'Xem một bộ phim hoàn chỉnh với bỏng ngô và đồ uống.', 200, '🎬', 'Joy', 14, true),
  ('Skill Development Hour', 'Dành một giờ học kỹ năng mới hoặc hobby.', 150, '🎯', 'Growth', null, false),
  ('Meditation Session', '20 phút thiền định hoặc mindfulness.', 100, '🧘‍♀️', 'Relax', 7, true),
  ('Creative Time', 'Một giờ sáng tạo: vẽ, viết, hoặc làm thủ công.', 120, '🎨', 'Growth', null, false),
  ('Workout Session', '30 phút tập luyện hoặc yoga.', 100, '💪', 'Growth', null, false),
  ('Music Listening', 'Nghe album yêu thích hoàn chỉnh.', 70, '🎵', 'Joy', 7, true),
  ('Nature Walk', 'Đi dạo 30 phút ngoài trời.', 80, '🌳', 'Relax', 7, true)
ON CONFLICT (id) DO NOTHING;

-- Verify
SELECT COUNT(*) as total_rewards FROM public.rewards;
