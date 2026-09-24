# TKJ SMKSA CHAMPIONSHIP 2026 — FINAL

Fitur: website publik, klasemen Grup A/B otomatis, sistem poin 3-1-0 yang bisa diubah, 11 tim, jadwal/hasil, tambah/edit/hapus pertandingan, bagan semifinal/final/juara 3, pengaturan tampilan, login admin, audit log, dan Cloudflare D1.

## Urutan
1. Jalankan `schema.sql` di D1 Console.
2. Jalankan `seed.sql`.
3. Isi `database_id` di `wrangler.toml`.
4. Buat repository GitHub dan upload ISI folder project ini.
5. Cloudflare Workers & Pages > Create > Pages > Connect to Git.
6. Pilih repo. Production branch: `main`. Build command kosong. Build output directory: `public`.
7. Setelah project dibuat, Settings > Bindings > Add > D1 database. Variable name `DB`, pilih database `tkj-smksa`. Redeploy.
8. Settings > Variables and Secrets > Production: buat secret `ADMIN_PASSWORD`.
9. Buka `/admin.html` untuk admin dan `/` untuk publik.

Jangan memakai Direct Upload dashboard untuk project ini karena Pages Functions tidak didukung lewat Direct Upload.

Seed memakai 11 nama placeholder `Tim 01` s.d. `Tim 11`. Silakan ganti di Admin.
