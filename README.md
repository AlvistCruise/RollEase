# ♿ RollEase: Aplikasi Navigasi Aksesibilitas Berbasis Visual-Preview

RollEase merupakan aplikasi mobile berbasis sistem navigasi aksesibel yang dirancang untuk membantu pengguna kursi roda dalam menentukan rute perjalanan yang aman, nyaman, dan ramah disabilitas. Proyek ini dikembangkan sebagai bagian dari Program Kreativitas Mahasiswa - Karsa Cipta (PKM-KC).

## 📝 Overview Aplikasi

RollEase hadir untuk menjawab tantangan aksesibilitas infrastruktur publik bagi penyandang disabilitas fisik, khususnya pengguna kursi roda. Meskipun sistem navigasi digital konvensional sudah umum digunakan, sebagian besar belum menyediakan informasi mikro-aksesibilitas yang krusial seperti keberadaan ramp, lift, kemiringan jalan, atau hambatan fisik lainnya.

Sistem ini menerapkan konsep **Visual-Preview Path Mapping**, yang memungkinkan pengguna untuk melihat gambaran visual kondisi jalur pada titik-titik kritis sebelum melakukan perjalanan. Dengan menggabungkan algoritma navigasi cerdas dan kontribusi data berbasis komunitas (*crowdsourcing*), RollEase bertujuan untuk:
* **Meningkatkan Kemandirian:** Memungkinkan pengguna melakukan navigasi mandiri tanpa ketergantungan penuh pada bantuan orang lain.
* **Mengurangi Risiko:** Membantu pengguna mengenali rintangan atau jalur yang tidak aksesibel lebih awal.
* **Membangun Ekosistem Inklusif:** Mendorong kesadaran masyarakat melalui peran *Mapper* dalam memetakan fasilitas publik yang ramah disabilitas.

## ✨ Fitur Utama

RollEase memiliki tiga modul utama yang saling terintegrasi:

* **Navigasi Accessible:** Algoritma penentuan rute yang memprioritaskan jalur bebas tangga dan mempertimbangkan keamanan jalur bagi kursi roda.
* **Visual Path-Mapping (Visual-Preview):** Galeri foto kondisi jalur pada titik-titik kritis agar pengguna dapat melakukan verifikasi mandiri sebelum perjalanan.
* **Reporting System (Crowdsourcing):** Fitur bagi pengguna untuk melaporkan hambatan jalan atau kendala aksesibilitas secara real-time.

## 🛠️ Teknologi yang Digunakan

Aplikasi ini dibangun dengan mengintegrasikan sistem pemetaan komunitas dan pengolahan data spasial:

* **Frontend:** Android Mobile App (Desain UI/UX dikembangkan menggunakan Figma).
* **Pemetaan:** OpenStreetMap (OSM) - Database peta gratis yang dapat diakses dan dikembangkan secara terbuka.
* **Backend & Database:** PostGIS - Database management system untuk mengolah data spasial seperti titik, garis, dan poligon rute.

## 👥 Tim Pengembang (PKM-KC)

Proyek ini dikembangkan oleh tim mahasiswa dari Bina Nusantara University:
* **Alvist Cruise** - Ketua Tim / Project Manager & UI/UX
* **Nicholas Wijaya** - Anggota / UI/UX & Pembuatan Prototype
* **Jevon Chang** - Anggota / Social Media & Publikasi
* **Christian Kevin Farellius** - Anggota / Data Collection & Dokumentasi
* **Andrew Mardjohan** - Anggota / Riset Data & Laporan
* **Dosen Pendamping:** Maulin Nasari, S.T., M.Kom.

---
*Dibuat untuk mewujudkan ekosistem Smart City yang inklusif dan ramah disabilitas di Indonesia.*