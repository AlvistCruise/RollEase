# ♿ RollEase: Aplikasi Navigasi Aksesibilitas Berbasis Visual-Preview

RollEase merupakan aplikasi mobile berbasis sistem navigasi aksesibel yang dirancang untuk membantu pengguna kursi roda dalam menentukan rute perjalanan yang aman, nyaman, dan ramah disabilitas. Aplikasi ini dikembangkan untuk mengatasi berbagai hambatan mobilitas yang sering dihadapi oleh penyandang disabilitas fisik di ruang publik.

Proyek ini dikembangkan sebagai bagian dari Program Kreativitas Mahasiswa - Karsa Cipta (PKM-KC) 2025.

## ✨ Fitur Utama

RollEase memiliki tiga modul utama yang saling terintegrasi:

* **Navigasi Accessible:** Algoritma penentuan rute yang dirancang untuk memprioritaskan jalur bebas tangga dan mempertimbangkan kondisi jalur yang paling aman bagi pengguna kursi roda.
* **Visual Path-Mapping (Visual-Preview):** Menyediakan galeri foto atau visual kondisi jalur pada titik-titik kritis sepanjang rute perjalanan. Fitur ini memungkinkan pengguna menilai aksesibilitas jalur sebelum melaluinya.
* **Reporting System (Crowdsourcing):** Memungkinkan pengguna dan komunitas (*Mapper*) untuk melaporkan secara langsung berbagai hambatan mendadak (seperti jalan rusak atau galian) maupun memetakan titik aksesibilitas (ramp, lift) secara *real-time*.

## 🛠️ Teknologi yang Digunakan

Aplikasi ini dibangun dengan mengintegrasikan sistem pemetaan komunitas dan pengolahan data spasial:

* **Frontend:** Android Mobile App (Desain UI/UX menggunakan Figma)
* **Pemetaan:** OpenStreetMap (OSM) - Map database gratis berbasis komunitas *volunteer*.
* **Backend & Database:** PostGIS - Spatial database management system untuk menyimpan dan memanipulasi data objek spasial rute.
* **Hardware & AI (Prototipe):** Jetson Nano 4GB, Sensor IMU, dan Kamera USB.

## 👥 Tim Pengembang (PKM-KC)

Proyek ini dikembangkan oleh tim mahasiswa dari Bina Nusantara University:
* **Alvist Cruise** - Ketua Tim / Project Manager & UI/UX