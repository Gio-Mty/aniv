# Love — Situs Anniversary

Situs ucapan anniversary tiga halaman, dibangun ulang dengan Next.js dari desain
yang awalnya dibuat di Canva (`avaclaire.my.canva.site/dahskueladc`). Tampilan,
teks, foto, font, dan animasinya mengikuti situs asli.

## Halaman

| Alamat    | Isi                                                                              |
| --------- | -------------------------------------------------------------------------------- |
| `/`       | Amplop "You got a mail!" — klik segel untuk membuka                              |
| `/page-2` | "Happy Anniversary!" dengan foto latar — klik hati untuk lanjut                  |
| `/page-3` | Halaman kenangan: strip foto + kalender, surat, polaroid, lagu, 10 alasan, liontin |

## Menjalankan

Butuh Node.js 20 atau lebih baru.

```bash
npm install
```

```bash
npm run dev
```

Lalu buka http://localhost:3000.

Perintah lain:

| Perintah        | Fungsi                                  |
| --------------- | --------------------------------------- |
| `npm run build` | Build produksi (semua halaman statis)   |
| `npm run start` | Menjalankan hasil build                 |
| `npm run lint`  | Pemeriksaan ESLint                      |

## Teknologi

- Next.js 16 (App Router) dan React 19, TypeScript
- CSS biasa (`app/globals.css`), tanpa Tailwind atau pustaka UI
- Web Animations API untuk animasi, tanpa pustaka animasi
- Tidak ada backend atau database; ketiga halaman di-render statis

## Struktur

```
app/
  layout.tsx          kerangka HTML, skrip skala awal
  page.tsx            halaman amplop
  page-2/page.tsx     halaman anniversary
  page-3/page.tsx     halaman kenangan
  globals.css         font, aturan skala, aturan animasi
  icon.svg            ikon tab (hati)
components/
  HeroPage.tsx        halaman satu layar penuh (/ dan /page-2)
  ScrollPage.tsx      halaman panjang yang di-scroll (/page-3)
  Animator.tsx        pemutar animasi
  StageRuntime.tsx    menjaga skala saat jendela berubah + navigasi klik
lib/
  scale.ts            perhitungan faktor skala
content/
  p1.json p2.json p3.json   isi tiap halaman (markup + data animasi)
public/
  media/              gambar (±17 MB)
  fonts/              7 font
```

## Cara kerja

### Tata letak: "panggung" yang diskalakan

Setiap halaman adalah panggung berukuran tetap yang direkam dari situs asli pada
tiga ukuran layar, lalu diperbesar atau diperkecil mengikuti jendela:

| Varian  | Ukuran acuan | Dipakai pada (halaman kenangan) |
| ------- | ------------ | ------------------------------- |
| Desktop | 1366 × 768   | lebar ≥ 1100 px                 |
| Tablet  | 820 × 1180   | lebar 600–1099 px               |
| HP      | 390 × 844    | lebar < 600 px                  |

- **Halaman kenangan** diskalakan menurut lebar jendela. Di atas 1366 px isinya
  berhenti membesar dan berada di tengah.
- **Halaman amplop dan anniversary** mengisi satu layar: latar menutupi seluruh
  jendela, isi diperkecil agar muat. Varian dipilih dari orientasi layar
  (mendatar → desktop; tegak → tablet atau HP).

Ketiga varian ada di HTML sekaligus; CSS menampilkan satu saja. Faktor skala
disimpan sebagai variabel CSS (`--sd`, `--st`, `--sm`, dan seterusnya) yang
dihitung di `lib/scale.ts`.

### Isi: `content/*.json`

Tiap berkas berisi:

- `variants.d`, `variants.t`, `variants.m` — daftar bagian halaman. Tiap bagian
  punya ukuran (`w`, `h`), warna latar (`bg`), dan markup-nya (`html`; untuk
  halaman satu layar dipisah jadi `bgHtml` dan `fgHtml`).
- `anims` — data animasi per varian dan per bagian.

Markup membawa gaya inline sendiri dan bergantung pada gaya bawaan browser.
Karena itu `globals.css` sengaja tidak berisi reset elemen (misalnya
`box-sizing`); menambahkannya akan menggeser tata letak.

### Animasi: `components/Animator.tsx`

Gerakan tiap elemen direkam dari situs asli lalu diputar ulang:

- Elemen bergeser, memudar, membesar, atau terbang masuk secara bergantian.
- Judul dan isi surat muncul kata demi kata.
- Segel dan piringan hitam berputar terus; hati berkedip berulang.
- Tiap bagian diputar sekali, saat pertama kali terlihat di layar.
- Halaman baru memudar masuk selama 0,3 detik.
- Bila perangkat meminta "kurangi gerakan", animasi dilewati.

Elemen yang beranimasi diberi atribut `data-anim` dan disembunyikan sampai
bagiannya mulai diputar. Elemen dicocokkan dengan data animasinya lewat nomor
`data-i`.

## Mengubah isi

- **Teks** (surat, 10 alasan, judul): cari teksnya di `content/p3.json` dan
  ubah. Tiap varian layar punya salinannya sendiri, jadi ubah di `d`, `t`, dan
  `m`. Kotak teks berukuran tetap, sehingga teks yang jauh lebih panjang bisa
  meluber.
- **Foto**: ganti berkas di `public/media/` dengan nama yang sama dan
  perbandingan sisi yang sama.
- **Lagu**: ganti ID lagu pada alamat `open.spotify.com/embed/track/...` di
  `content/p3.json` (tiga tempat, satu per varian).

## Yang berbeda dari situs asli

- Footer Canva (Terms, Privacy, "Designed with Canva") tidak disertakan.
- Pada lebar layar di antara tiga ukuran acuan, tata letak diskalakan dari
  acuan terdekat; Canva menggeser elemen secara bertahap, jadi posisinya bisa
  sedikit berbeda.
- Pemutar Spotify dimuat langsung dari Spotify, tidak lewat perantara Canva.
- Pindah halaman memudar dari putih, bukan memudar silang dengan halaman lama.
- Getaran halus tiap huruf (kurang dari setengah piksel) tidak ditiru, dan jeda
  antar kata memakai nilai tetap.

## Catatan

- Gambar disalin dalam ukuran asli (±17 MB). Sebaiknya dikompres sebelum situs
  dipublikasikan agar cepat dibuka di HP.
- `content/*.json` dihasilkan oleh skrip perekam sekali pakai yang tidak ikut
  disimpan di repo ini. Kalau desain di Canva berubah, isinya perlu direkam
  ulang atau disunting langsung.
- Situs belum di-deploy. Karena semua halaman statis, hasil `npm run build`
  bisa dipasang di layanan mana pun yang mendukung Next.js.
