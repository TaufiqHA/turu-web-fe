# Spesifikasi Antarmuka Pengguna (UI-Spec) - Turu Sore

Dokumen ini berisi spesifikasi UI dan UX dari aplikasi "Turu Sore" (Smart ISP Management System) untuk mempermudah proses penulisan ulang (rewrite) proyek ini ke dalam framework **Flutter**.

---

## 1. Desain Global (Tema & Gaya)

### 1.1. Palet Warna
Berikut warna yang bisa didefinisikan pada `ThemeData` di Flutter:
*   **Primary Green (fGreen)**: `#dc2626` (Warna Merah Gelap/Dark Red - Namun variabelnya dinamai `fGreen` di React). *Note: `fGreen` di kode menggunakan kode `red-600` Tailwind.*
*   **Primary Green Light (fGreenLight)**: `#fee2e2` (`red-100`)
*   **Accent Red (fRed)**: `#e11d48` (`rose-600`)
*   **Accent Red Light (fRedLight)**: `#ffe4e6` (`rose-100`)
*   **Dark Background (fDark)**: `#0f172a` (`slate-900`)
*   **Latar Belakang Global (Scaffold Background)**: `#f8fafc` (`slate-50`)
*   **Card / Wrapper Background**: `#ffffff` (Putih murni)

### 1.2. Tipografi (Font)
*   **Global Font Family**: `Plus Jakarta Sans` dipadukan dengan system sans-serif. Di Flutter dapat menggunakan package `google_fonts` dengan `GoogleFonts.plusJakartaSans()`.

### 1.3. Radius Sudut (Border Radius) & Bayangan (Shadows)
*   Sebagian besar *Card* menggunakan radius lengkung tinggi (`borderRadius: BorderRadius.circular(16.0)` hingga `24.0`).
*   Bayangan menggunakan bayangan tipis ke bawah (`BoxShadow` dengan blurRadius `10.0` dan warna hitam opacity `0.05`).

---

## 2. Struktur Dasar Aplikasi

Aplikasi dibangun menggunakan konsep **Satu Layar Utama (AppShell)** yang membungkus tampilan berdasarkan *Bottom Navigation*.

### 2.1. Layar Autentikasi (`LoginScreen`)
Layar pertama yang akan di-render jika `user == null`.
*   **Background**: `Stack` dengan `Image.network` atau `AssetImage` (gambar pemandangan gelap) yang ditutupi oleh `Container` dengan warna gradient linear transparan dari hitam ke indigo (`LinearGradient`).
*   **Komponen**:
    *   **Logo App**: Kotak putih dengan lekukan 3D/shadow.
    *   **Judul**: "Turu Sore" teks tebal, warna tulisan putih dan merah pada "Sore".
    *   **Sub-judul**: "Smart ISP Management System".
    *   **Card Login** (dilapisi efek kaca / *glassmorphism* di Flutter menggunakan `BackdropFilter` dipadu `BoxDecoration(color: Colors.white.withOpacity(0.1))`):
        *   TextFormField "Username Tim / No. HP Klien" dengan awalan panah/ikon dari `Icons.person`.
        *   TextFormField "Password" dengan awalan `Icons.lock`. Menggunakan `obscureText: true`.
        *   Tombol "Masuk": `ElevatedButton` warna merah (berdasarkan variabel CSS `fGreen` yang mengarah ke merah).

### 2.2. Scaffold Utama (`AppShellScreen`)
Setelah user login, akan diarahkan ke *Scaffold* utama yang bersifat fix (tidak bisa scroll halaman keseluruhan, melainkan isi halamannya yang scrollable).

*   **AppBar (Header Kustom) / Top Bar**:
    *   **Kiri**: Logo bulat putih + Nama brand ("Turu Sore") dan lencana status role ("Superadmin", "Pelanggan", dll).
    *   **Kanan**: Label kedip (Pulse Anim) "Live" merah untuk superadmin/teknisi/helpdesk, serta `CircleAvatar` berdasarkan inisial profil user dengan penampung logout (tap lalu muncul AlertDialog).
*   **Body (Konten Aktif)**:
    *   Sebuah `Expanded` atau area halaman statis tempat komponen di-render sesuai tab yang dipilih. Memiliki `backgroundColor: Color(0xFFF8FAFC)`.
*   **Bottom Navigation Bar (`BottomNavigationBar` kustom)**:
    *   Memiliki lapisan mirip kaca (*backdrop filter* / bayangan). Diletakkan secara absolute di bagian bawah.
    *   **Dinamis Berdasarkan Role**:
        *   *Superadmin*: Home, Finance, Mapping, Komplain, Gudang, Data.
        *   *Teknisi*: Home, Gudang, Mapping, Komplain.
        *   *Finance*: Home, Finance.
        *   *Pelanggan*: Home, Komplain.
    *   *Saran Flutter*: Buat `BottomNavigationBar` atau custom bar dengan `Row` dan `GestureDetector`. Terdapat indikator / *Badge* kecil warna merah di pojok icon untuk notifikasi pending (menggunakan bungkus `Stack` dan `Positioned` badge).

---

## 3. Tampilan Halaman Detail (Screens)

### 3.1. Dashboard Utama (`DashboardScreen`)
Layar ini adalah inti (Home) dan tampilannya bercabang (render kondisional) berdasarkan peran user (*role*). Seluruh page ini dibungkus dalam padding `16.0` atau diletakkan di dalam `SingleChildScrollView`.

1.  **Welcome Header**:
    *   Judul "Dashboard", info "Selamat datang, [Nama]".
    *   Widget Jam Real-Time dan Tanggal di sisi kanan.

2.  **Card Khusus Pelanggan (`role == 'pelanggan'`)**:
    *   Dibungkus dengan Gradient Card berwarna abu-gelap / biru dongker.
    *   **Header Card**: Nama Klien, ID klien dan Paket. Terdapat Inisial Avatar bergradasi di sisi kanan.
    *   **Status Koneksi**: "Online", "Terisolir", atau "Offline".
    *   **Detail Tagihan**: Nominal Tagihan bulan ini, dan *Badge* Lunas/Menunggu ACC/Menunggak.
    *   **Menu Cepat Berupa Grid (3 kolom)**:
        *   Riwayat
        *   Setting WiFi (Buka eksternal url router `192.168.1.1`)
        *   Lapor Gangguan (Routing ke Tab Komplain)

3.  **Card Pendapatan / Finance (`role == 'superadmin' || role == 'finance'`)**:
    *   Card background biru gelap dominan.
    *   Total Pendapatan (Teks besar).
    *   Grid List yang menampilkan total "Sudah Membayar" (warna hijau) dan "Belum Membayar" (warna merah).
    *   Tombol "Menu Keuangan".

4.  **Google Sheets Sync (`role == 'superadmin'`)**:
    *   Panel integrasi API Sheets. List aksi berurutan (Login, Setup Spreadsheet, Push, Pull).

5.  **Aksi Teknisi (`role == 'teknisi'`)**:
    *   Tombol lebar bergradasi warna kebiruan/hijau ("Cetak Label Pelanggan" - ikon `QrCode`).
    *   Tombol lebar "Scan SN Modem" dengan tombol scanner kamera.

6.  **Laporan Tambahan Superadmin**:
    *   Daftar antrian *Permintaan HD (Isolir & Buka)*. (Daftar list dengan tombol ACC).
    *   Statistik SLA Jaringan.
    *   Widget Riwayat Laporan Pemasangan/Pengambilan Modem Terakhir.

### 3.2. Mapping / Geo-Location (`MapView`)
*   Map menggunakan `flutter_map` (sepadan dengan leaflet).
*   Menampilkan `Marker` dari posisi pelanggan dan melacak pergerakan teknisi (latitude longitude live update).

### 3.3. Komplain Halaman (`ComplaintScreen`)
*   Sistem tiket di mana pelanggan bisa mengirim teks keluhan.
*   Tim admin / teknisi melihat list dan merubah *status progress* laporan (Selesai, Proses, Tertunda).

### 3.4. Inventory & Scan Modem (`InventoryScreen` & `ScanModemScreen`)
*   Saran di Flutter: Gunakan `mobile_scanner` atau dependensi bawaan kamera HP untuk fitur Scan SN (Serial Number) atau MAC Address.
*   Pada halaman Gudang, terdapat riwayat stok dan daftar alat / aksesoris WiFi.

---

## 4. Referensi State & Dependensi di Flutter

Untuk membangun UI dan UX yang sama presisi, beberapa referensi package di bawah ini sangat disarankan:
*   **State Management**: *Provider*, *Riverpod*, atau *GetX* untuk menggantikan `useAppContext` (autentikasi global, data klien, aktif tab).
*   **Design System / Icon**: `lucide_icons` (untuk padanan logo lucide-react) atau pakai spesifik `cupertino_icons` / `material_symbols_outline`.
*   **Animasi Layout**: Package `animations` atau `flutter_animate` (ganti framer-motion/AnimatePresence).
*   **Alert & Dialog**: Di React dipakai `sweetalert2`, di Flutter gunakan library `panara_dialogs`, `rflutter_alert`, atau fungsi `showDialog` built-in dengan kustomisasi material lengkung yang cantik.
*   **Scan Barcode / QR**: Package `mobile_scanner`.
*   **Peta Berbasis Web**: Package `flutter_map`.

## 5. Komponen UI Reusable untuk dibuat di Flutter

Selama pembuatan ulang (rewrite), disarankan mengekstrak UI ke widget kustom:
1.  **`GlassmorphismCard`**: Konfigurasi `BackdropFilter` umum.
2.  **`QuickActionTile`**: Tombol pada dashboard yang mempunyai ikon di sebelah kiri, background gradien, dan panah `ArrowUpRight` di kanan.
3.  **`StatusBadge`**: Berisi teks kecil (ukuran `10.0`) dalam `Container` membulat dengan *color conditioning* dinamis (merah/hijau/orange).
4.  **`PulsingDot`**: Widget stateful kustom dengan loop `AnimationController` untuk menampilkan dot status merah "Online".
