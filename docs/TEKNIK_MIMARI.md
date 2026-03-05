# Asset Mobil – Teknik Mimari

## 1. Teknoloji Yığını

| Katman | Teknoloji |
|--------|-----------|
| **Framework** | React Native + Expo SDK 54 |
| **React** | 19.1.0 |
| **React Native** | 0.81.5 |
| **Navigation** | State tabanlı (React Navigation paketleri yüklü ama kullanılmıyor) |
| **Veritabanı** | expo-sqlite (SQLite) |
| **Kamera/Barkod** | expo-camera, expo-barcode-scanner |
| **İkonlar** | @expo/vector-icons (Ionicons) |
| **Backend** | Harici REST API (`https://isletmem.online/asset/api/`) |
| **Platformlar** | iOS, Android, Web (Expo) |

---

## 2. Proje Dosya Yapısı

```
AssetMobil/
├── index.js              # Expo root, App register
├── App.js                # Ana uygulama: Login + rol bazlı routing
├── Database.js           # SQLite: initDB, dealer/customer CRUD
├── StDashboard.js        # ST: Bayi/müşteri listesi
├── TeknisyenDashboard.js # T: Talep listesi (export: TechDashboard)
├── ActionSelection.js    # Kategori seçimi
├── JobTypeSelection.js   # İş tipi seçimi (Kurulum/Sökme/Arıza)
├── InventorySelection.js # Bayi envanteri seçimi
├── InstallationSummary.js# Özet + talep oluşturma
├── TechRequestDetail.js  # Talep detayı + barkod + iptal
├── VerificationEquipment.js # Envanter doğrulama + barkod
├── StDashboard copy.js   # Yedek (kullanılmıyor)
├── package.json
├── app.json
├── tsconfig.json
├── .gitignore
├── assets/               # icon, splash, favicon
├── .expo/                # Expo dev artifacts
└── ios/                  # iOS native project
```

---

## 3. Mimari Kararlar

### 3.1 State Tabanlı Routing

- **React Navigation stack kullanılmıyor.** Tüm ekran geçişleri `App.js` içindeki state ile yönetilir:
  - `role`, `user`, `selectedCustomer`, `selectedCategory`, `selectedJobType`, `selectedInventory`, `selectedRequest`
- Ekran gösterimi `if/return` zinciri ile belirlenir.

### 3.2 Merkezi State (App.js)

- `user` ve `role` login sonrası set edilir.
- ST akışında: `selectedCustomer` → `selectedCategory` → `selectedJobType` → `selectedInventory` sırasıyla doldurulur.
- T akışında: `selectedRequest` doldurulur.
- İşlem tamamlandığında (talep oluşturma, tamamlama, iptal) ilgili seçimler sıfırlanır.

### 3.3 Offline Destek

- Bayi ve müşteri listeleri API’den çekilip SQLite’a kaydedilir (`Database.js`).
- `getLocalDealers`, `getLocalCustomersByDealer` ile offline listeleme yapılır.
- SYNC butonu ile yeniden senkronizasyon tetiklenir.

### 3.4 Barcode Tarama

- `expo-camera` ile `CameraView` kullanılır.
- `VerificationEquipment`: Tekrarlı okumayı önlemek için `useRef` ile `isProcessing` kilidi vardır.
- `TechRequestDetail`: `scanning` state ile kontrol edilir.
- Desteklenen barkod tipleri: `qr`, `ean13`, `code128`.

---

## 4. Bileşen İlişkileri

```
App.js
├── Login (role === null)
├── ST Branch:
│   ├── VerificationEquipment (selectedCategory?.id === 5)
│   ├── InstallationSummary (selectedJobType && selectedInventory)
│   ├── InventorySelection (selectedJobType)
│   ├── JobTypeSelection (selectedCategory)
│   ├── ActionSelection (selectedCustomer)
│   └── StDashboard (default)
└── T Branch:
    ├── TechRequestDetail (selectedRequest)
    └── TeknisyenDashboard (default)
```

---

## 5. Stil Rehberi

- **Ana renk:** `#004a8d`, `#004a99`, `#1e3a8a`
- **Vurgu:** `#2563eb`, `#1d4ed8`
- **Başarı:** `#10b981`, `#22c55e`
- **Hata/İptal:** `#dc2626`
- Header yüksekliği: 56px
- Kart border-radius: genelde 12–25px

---

## 6. Önemli Notlar

- `TeknisyenDashboard.js` bileşeni `TechDashboard` olarak export edilir; `App.js` `TeknisyenDashboard` adıyla import eder (dosya adı ile eşleşir).
- `handleCreateInstallRequest` fonksiyonu `App.js` içinde tanımlıdır ancak **kullanılmıyor**. Talep oluşturma tamamen `InstallationSummary.js` içindeki `submitRequest` ile yapılır.
- `VerificationEquipment` içinde `user_code: 'ST001'` sabit yazılmıştır; ileride `user.username` ile değiştirilmesi gerekir.
