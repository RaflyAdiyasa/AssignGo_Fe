# 📋 Sistem Surat Tugas - Frontend React

> **Status: Beberapa Selesai ✅** - Fitur pengguna siap produksi, fitur admin siap dikembangkan

## 🎯 Gambaran Umum Proyek

Aplikasi web untuk mengelola pengajuan dan persetujuan surat tugas dengan sistem multi-peran (Pengguna & Admin). Frontend menggunakan React dengan integrasi ke arsitektur backend multi-service.

### **Stack Teknologi:**
- **Frontend:** React 18, React Router DOM, Tailwind CSS
- **Ikon:** Lucide React
- **HTTP Client:** Axios dengan interceptors
- **Manajemen State:** React Context API
- **Autentikasi:** JWT (Access + Refresh Token)
- **Integrasi Backend:** Arsitektur multi-service

---

## 🏗️ Arsitektur Sistem

### **Layanan Backend:**
- **User Service** (Port 3001): Autentikasi, manajemen pengguna
- **Mail Service** (Port 3002): CRUD surat, riwayat, sistem persetujuan

### **Struktur Frontend:**
```
Frontend (Port 3000) ←→ User Service (3001) ←→ Database
                    ←→ Mail Service (3002) ←→ Database
```

---

## 📁 Struktur Proyek

```
src/
├── components/           # Komponen yang dapat digunakan ulang
│   ├── common/          # Komponen umum
│   │   ├── ProtectedRoute.js     # Pengamanan rute autentikasi
│   │   ├── PublicRoute.js        # Penangan rute publik
│   │   └── LoadingSpinner.js     # Loading states & skeleton
│   ├── layout/          # Komponen layout
│   │   ├── MainLayout.js         # Struktur layout dasar
│   │   ├── Header.js             # Navigasi atas
│   │   ├── Sidebar.js            # Navigasi samping
│   │   ├── UserLayout.js         # Wrapper layout pengguna
│   │   └── AdminLayout.js        # Wrapper layout admin
│   └── surat/           # Komponen khusus surat
│       ├── StatusBadge.js        # Indikator status
│       └── StatusTimeline.js     # Timeline riwayat
│
├── pages/               # Halaman aplikasi
│   ├── auth/           # Halaman autentikasi
│   │   └── AuthApp.js           # Login & Register
│   ├── user/           # Halaman pengguna
│   │   ├── Dashboard.js         # Dashboard pengguna
│   │   ├── Profile.js           # Manajemen profil pengguna
│   │   └── surat/              # Manajemen surat
│   │       ├── CreateSurat.js   # Buat surat baru
│   │       ├── ListSurat.js     # Daftar surat dengan filter
│   │       └── DetailSurat.js   # Detail surat & riwayat
│   ├── admin/          # Halaman admin (placeholder)
│   │   └── AdminDashboard.js    # Dashboard admin
│   └── shared/         # Halaman bersama
│       ├── NotFound.js          # Halaman 404
│       └── Unauthorized.js      # Halaman 403
│
├── services/           # API & logika bisnis
│   ├── api/           # Fungsi layanan API
│   │   ├── authApi.js          # API autentikasi
│   │   ├── userApi.js          # API manajemen pengguna
│   │   └── suratApi.js         # API manajemen surat
│   └── utils/         # Utilitas layanan
│       └── errorHandler.js     # Utilitas penanganan error
│
├── context/           # React Context
│   └── AuthContext.js          # Manajemen state autentikasi
│
├── hooks/             # Custom React hooks
│   └── useApi.js              # Hook pemanggilan API
│
├── utils/             # Fungsi utilitas
│   ├── constants.js           # Konstanta aplikasi
│   └── dateUtils.js           # Utilitas pemformatan tanggal
│
├── config/            # Konfigurasi
│   ├── apiConfig.js           # Endpoint API & setup axios
│   └── menuItems.js           # Konfigurasi menu navigasi
│
├── App.js             # Aplikasi utama dengan routing
└── index.js           # Entry point
```

---

## ✅ Progress yang Telah Selesai (Fase 2)

### **🔐 Sistem Autentikasi**
- [x] **Login/Register** dengan email & password
- [x] **Manajemen JWT Token** (access + refresh tokens)
- [x] **Autentikasi Berbasis Peran** (Pengguna vs Admin)
- [x] **Auto Refresh Token** melalui axios interceptors
- [x] **Rute Terproteksi** dengan pengamanan autentikasi
- [x] **Fungsi Logout** dengan pembersihan token

### **🎨 Layout & Navigasi**
- [x] **Layout Responsif** (Mobile, Tablet, Desktop)
- [x] **Navigasi Header** dengan menu pengguna & notifikasi
- [x] **Sidebar Dinamis** dengan item menu berbasis peran
- [x] **Navigasi Breadcrumb** untuk UX yang lebih baik
- [x] **Loading States** dengan skeleton screens
- [x] **Error Boundaries** untuk penanganan error yang elegan

### **👤 Manajemen Profil**
- [x] **Tampilan Informasi Profil** & pengeditan
- [x] **Fungsi Update Username** 
- [x] **Ubah Password** dengan validasi
- [x] **Tampilan Peran** (indikator Pengguna/Admin)
- [x] **Panduan Keamanan** untuk praktik password terbaik
- [x] **Validasi Form** dengan feedback real-time

### **🔗 Integrasi API**
- [x] **Arsitektur Multi-service** (User + Mail services)
- [x] **Axios Interceptors** untuk manajemen token
- [x] **Penanganan Error** dengan pesan yang ramah pengguna
- [x] **Loading States** di seluruh aplikasi
- [x] **Konfigurasi CORS** untuk permintaan lintas origin

---

```

#### **Integrasi API - 100% Berfungsi:**
- ✅ `POST /api/users/login` - Autentikasi pengguna
- ✅ `POST /api/users/register` - Registrasi pengguna  
- ✅ `PUT /api/users/profile` - Update profil

---

## 🎯 Fase Selanjutnya: Fitur Admin

---

## 🚀 Memulai Pengembangan

### **Prasyarat**
- Node.js 16+ dan npm
- Layanan backend berjalan (User Service di 3001, Mail Service di 3002)

### **Instalasi**

1. **Clone dan Install Dependencies:**
```bash
git clone <repository-url>
cd surat-tugas-frontend
npm install
```

2. **Install Paket yang Diperlukan:**
```bash
npm install react-router-dom axios lucide-react
```

3. **Setup Environment (Opsional):**
```bash
# Buat file .env
echo "REACT_APP_USER_SERVICE_URL=http://localhost:3001" > .env
echo "REACT_APP_MAIL_SERVICE_URL=http://localhost:3002" >> .env
echo "PORT=3000" >> .env
```

4. **Setup Tailwind CSS (Metode CDN):**
Tambahkan ke `public/index.html`:
```html
<script src="https://cdn.tailwindcss.com"></script>
```

### **Menjalankan Aplikasi**

1. **Jalankan Layanan Backend:**
```bash
# Terminal 1 - User Service
cd backend-user-service
npm start  # Berjalan di http://localhost:3001

# Terminal 2 - Mail Service  
cd backend-mail-service
npm start  # Berjalan di http://localhost:3002
```

2. **Jalankan Frontend:**
```bash
# Terminal 3 - React App
npm start  # Berjalan di http://localhost:3000
```

3. **Akses Aplikasi:**
- Frontend: http://localhost:3000
- Auto-redirect ke login jika belum autentikasi
- Buat akun baru atau login dengan kredensial yang ada

---

## 🔮 Pengembangan di Masa Depan

### **Fase 3 (Fitur Admin) - Developer Selanjutnya:**
- Notifikasi real-time (integrasi WebSocket)
- Pelaporan lanjutan dengan chart
- Sistem notifikasi email
- Fungsi preview file
- Sistem audit logging

### **Masalah:**
- nyambungin ke database mail (intinya yang berhubungan dengan mail)

---

*Terakhir diperbarui: [7 Juni 2025]*  
*Versi: 2.0.0 - Fitur Pengguna Selesai*
