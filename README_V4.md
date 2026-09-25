# TKJ SMKSA Championship 2026 — V4

V4 adalah template turnamen yang dapat dipakai ulang untuk banyak game/lomba.

## Fitur utama
- Multi-game: Mobile Legends, PES, dan game baru dapat ditambah dari Admin.
- Data game terpisah: tim, grup, klasemen, jadwal, hasil, aturan, dan bagan.
- Jumlah grup fleksibel: A, B, C, D, dst.
- Jumlah tim fleksibel per game.
- Jumlah tim yang lolos dari tiap grup dapat diatur.
- Aturan dan sistem poin dapat berbeda per game.
- Identitas tim: sekolah/instansi, kapten, dan informasi peserta.
- Logo tim, logo game, logo turnamen, banner, dan gambar berita melalui R2.
- Berita/artikel.
- Generator jadwal round-robin penyisihan: hari, tanggal mulai, jumlah minggu, match per minggu, jam, venue, dan tanggal yang dilewati dapat diatur.
- Default dummy: Kamis mulai 12 November 2026, 2 pertandingan per game per minggu.

## Deploy V4 ke database yang sudah dipakai
Jangan menjalankan `schema.sql` atau `seed.sql` langsung pada database produksi yang sudah berisi V3.

Urutan migrasi:
1. Backup data bila sudah ada hasil resmi.
2. Jalankan `MIGRASI_V4.sql` sekali di D1.
3. Deploy file website/function V4 ke Cloudflare Pages.
4. Jika ingin kembali ke data dummy V4 dan data lama belum resmi, jalankan `seed.sql` setelah migrasi. Seed menghapus data turnamen lama dan mengisi 22 tim + 24 jadwal dummy.

## R2
Buat bucket R2 bernama `tkj-smksa-media`, lalu tambahkan binding Pages:
- Variable name: `MEDIA`
- R2 bucket: `tkj-smksa-media`

Setelah binding, redeploy Pages.

## Admin
Password admin tetap menggunakan Cloudflare Secret `ADMIN_PASSWORD`.

## Catatan generator jadwal
Generator menggunakan sistem round-robin dalam setiap grup dan mencegah satu tim mendapat dua pertandingan pada minggu yang sama. Untuk format knockout yang lebih khusus, panitia dapat membuat pertandingan pada stage Qualifier/Quarterfinal/Semifinal/Final melalui Admin.
