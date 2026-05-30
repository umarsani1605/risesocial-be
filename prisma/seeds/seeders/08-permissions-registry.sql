INSERT INTO "admin_permissions" ("key", "name", "description", "available_levels")
VALUES
  ('admin.dashboard', 'Dashboard', 'Akses halaman dashboard admin', ARRAY['VIEWER']::TEXT[]),
  ('admin.users', 'User Management', 'Kelola user terdaftar', ARRAY['VIEWER', 'EDITOR']::TEXT[]),
  ('admin.academy', 'Academy', 'Kelola program academy', ARRAY['VIEWER', 'EDITOR']::TEXT[]),
  ('admin.cohort', 'Cohort', 'Kelola cohort & enrollment', ARRAY['VIEWER', 'EDITOR']::TEXT[]),
  ('admin.transactions', 'Transactions', 'Lihat & kelola transaksi', ARRAY['VIEWER', 'EDITOR']::TEXT[]),
  ('admin.ryls', 'RYLS', 'Kelola registrasi RYLS', ARRAY['VIEWER', 'EDITOR']::TEXT[]),
  ('admin.jobs', 'Jobs', 'Kelola job listing', ARRAY['VIEWER', 'EDITOR']::TEXT[]),
  ('admin.broadcast', 'Email Broadcast', 'Kirim & lacak email broadcast', ARRAY['VIEWER', 'EDITOR']::TEXT[]),
  ('admin.statistics', 'Statistics', 'Lihat statistik platform', ARRAY['VIEWER']::TEXT[]),
  ('admin.settings', 'System Settings', 'Kelola konfigurasi sistem', ARRAY['VIEWER', 'EDITOR']::TEXT[])
ON CONFLICT ("key") DO UPDATE
SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "available_levels" = EXCLUDED."available_levels";
