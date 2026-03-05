# Asset Mobil – Veri Akışı ve Kavramlar

## 1. Veri Kaynakları

| Kaynak | Kullanım |
|--------|----------|
| **REST API** | Login, bayiler, müşteriler, kategoriler, envanter, talep CRUD |
| **SQLite (assets_v1.db)** | Bayi ve müşteri önbelleği (offline kullanım) |

---

## 2. SQLite Şeması (Database.js)

### 2.1 Tablolar

**dealers:**
| Sütun | Tip | Açıklama |
|-------|-----|----------|
| id | INTEGER PK | Otomatik artan |
| dealer_code | TEXT | Bayi kodu (unique) |
| name | TEXT | Bayi adı |
| st_usernames | TEXT | İlişkili ST kullanıcı adı |

**customers:**
| Sütun | Tip | Açıklama |
|-------|-----|----------|
| id | INTEGER PK | Otomatik artan |
| customer_code | TEXT | SAP müşteri kodu (unique) |
| dealer_code | TEXT | Bağlı bayi kodu |
| st_username | TEXT | ST kullanıcı adı |
| region_code | TEXT | Bölge kodu |
| name | TEXT | Müşteri adı |
| address | TEXT | Adres |
| updated_at | TEXT | Güncelleme zamanı |

### 2.2 Fonksiyonlar

- `initDB()` – Tabloları oluşturur, WAL modunu açar
- `saveDealersToLocal(dealers, loggedInUser)` – Bayileri kullanıcıya göre günceller
- `getLocalDealers(loggedInUser)` – Kullanıcının bayilerini döner
- `saveCustomersToLocal(customers, loggedInUser)` – Müşterileri topluca kaydeder
- `getLocalCustomersByDealer(dealerCode, loggedInUser)` – Bayiye ait müşterileri döner

---

## 3. App.js State Yapısı

```
role          : 'ST' | 'T' | null
user          : { username, role, ... } | null
username      : string (login form)
password      : string (login form)
selectedCustomer  : { customer_code, dealer_code, name, ... } | null
selectedCategory  : { id, name } | null
selectedJobType   : { id, name } | null
selectedInventory : { material_description, type_code, ... } | null
selectedRequest   : { request_no, customer_name, status, ... } | null
selectedLang      : 'TR' | 'EN' | 'RU' | 'RO'
```

---

## 4. Prop Geçişleri (Özet)

| Bileşen | Gelen Props | Giden Callbacks |
|---------|-------------|-----------------|
| StDashboard | user, onLogout, onSelectCustomer | onSelectCustomer(item) |
| ActionSelection | customer, dealer, onBack, onSelectCategory | onSelectCategory(cat) |
| JobTypeSelection | category, onBack, onSelectJob | onSelectJob(job) |
| InventorySelection | customer, dealer, onBack, onSelectInventory | onSelectInventory(item) |
| InstallationSummary | customer, category, jobType, inventory, user, onBack, onComplete | onComplete() |
| VerificationEquipment | customer, dealer, onBack | — |
| TeknisyenDashboard | user, onLogout, onSelectRequest | onSelectRequest(item) |
| TechRequestDetail | request, onBack, onComplete | onComplete() |

---

## 5. Kritik Veri Akışları

### 5.1 ST: Kurulum Talebi Oluşturma

1. `InstallationSummary.submitRequest()` → `create-install-request` POST
2. Payload: `customer_code`, `dealer_code`, `type_code`, `material_description`, `note`, `username`
3. Başarı: `successData = result.request_no` → Başarı ekranı → `onComplete()` ile state sıfırlanır

### 5.2 ST: Verifikasyon (Envanter Doğrulama)

1. `VerificationEquipment.fetchInventory()` → `verification/inventory/{customer_code}` GET
2. Barkod okutulunca: `verification/store` POST → `barcode_no`, `customer_code`, `user_code` (şu an hardcoded `ST001`)
3. Başarı: `fetchInventory()` yeniden çağrılır, `is_verified` güncellenir

### 5.3 T: Talep Tamamlama

1. `TechRequestDetail.completeInstallation(barcode)` → `complete-install-request` POST
2. Payload: `barcode`, `request_no`
3. Başarı: `onComplete()` → `selectedRequest` sıfırlanır

### 5.4 T: Talep İptali

1. `TechRequestDetail.cancelInstallation()` → `cancel-install-request` POST
2. Payload: `request_no`
3. Başarı: `onComplete()` → `selectedRequest` sıfırlanır

---

## 6. Veri Tutarlılığı Notları

- **dealer_code vs dealer_name:** Bazı yerlerde `customer.dealer_code`, bazı yerlerde `customer.dealer_name` kullanılıyor. `dealer_code` yoksa `'BAYİ'` fallback vardır.
- **InventorySelection:** `dealer` prop olarak `customer.dealer_code` alır; `customer` objesinde `dealer_code` veya `dealer_name` farklı alanlardan gelebilir.
- **VerificationEquipment:** `user_code` şu an `'ST001'` sabit; gerçek kullanıcı bilgisi prop olarak geçirilmiyor.
