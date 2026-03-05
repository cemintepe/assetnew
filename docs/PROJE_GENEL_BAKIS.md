# Asset Mobil – Proje Genel Bakış

## 1. Proje Tanımı

**Asset Mobil**, soğutucu/ekipman kurulum ve envanter yönetimi için geliştirilmiş, **Expo/React Native** tabanlı bir mobil uygulamadır. Satış temsilcileri (ST) ve teknisyenler (T) için rol bazlı iki ana akış sunar.

---

## 2. Kullanıcı Rolleri

| Rol | Kod | Açıklama |
|-----|-----|----------|
| **Satış Temsilcisi (ST)** | `ST` | Bayi/müşteri yönetimi, kurulum talebi oluşturma, envanter doğrulama |
| **Teknisyen (T)** | `T` | Kurulum taleplerini görüntüleme, barkod ile tamamlama, iptal etme |

---

## 3. İş Akışları

### 3.1 Satış Temsilcisi (ST) Akışı

```
Giriş → StDashboard (Bayi/Müşteri Seçimi) → Müşteri Seç
  → ActionSelection (Kategori Seçimi)
     ├─ Kategori ID = 5 (Verifikasyon) → VerificationEquipment (Envanter doğrulama, barkod tarama)
     └─ Kategori ID = 1 (Soğutucu İşlemleri) → JobTypeSelection
           → Kurulum seç → InventorySelection (Bayi deposundan ekipman seçimi)
                → InstallationSummary (Özet + not + onay)
                     → Talep oluştur → Başarı ekranı → Dashboard'a dön
```

- **Sökme** ve **Arıza** iş tipleri şu an "Yakında" durumunda, MVP kapsamında değil.
- **Verifikasyon** (kategori id=5) doğrudan `VerificationEquipment` ekranına yönlendirir; kurulum talebi oluşturmaz.

### 3.2 Teknisyen (T) Akışı

```
Giriş → TeknisyenDashboard (Talep listesi: PENDING / CANCELLED / COMPLETED)
  → Talep seç → TechRequestDetail
     → Barkod Okut (kamera) → API ile tamamla → Dashboard'a dön
     → Bluefind Tara (yakında)
     → Talebi İptal Et → API ile iptal → Dashboard'a dön
```

---

## 4. Ana Ekranlar ve Sorumlulukları

| Ekran | Rol | Açıklama |
|-------|-----|----------|
| **Login** | Tümü | Kullanıcı adı/şifre, dil seçimi (TR/EN/RU/RO) |
| **StDashboard** | ST | Bayi seçimi, müşteri listesi, arama, SYNC (bayi/müşteri indirme) |
| **ActionSelection** | ST | Kategori listesi (Soğutucu id=1, Verifikasyon id=5 aktif) |
| **JobTypeSelection** | ST | İş tipi: Kurulum (aktif), Sökme/Arıza (yakında) |
| **InventorySelection** | ST | Bayi deposu stok listesi, ekipman seçimi |
| **InstallationSummary** | ST | Özet, not, talep oluşturma, başarı ekranı |
| **VerificationEquipment** | ST | Envanter listesi, barkod tarama, doğrulanan adet gösterimi |
| **TeknisyenDashboard** | T | Talep listesi, durum filtresi, arama |
| **TechRequestDetail** | T | Talep detayı, barkod okutma, iptal |

---

## 5. Temel Kavramlar

- **Bayi (Dealer):** Satış noktası; `dealer_code` ve `name` ile tanımlanır.
- **Müşteri (Customer):** Bayiye bağlı kurulum noktası; SAP `customer_code` ile tanımlanır.
- **Kategori (Action Category):** İşlem türü (Soğutucu İşlemleri, Verifikasyon vb.).
- **İş Tipi (Job Type):** Kurulum, Sökme, Arıza.
- **Envanter (Inventory):** Bayi deposundaki ekipman stoku veya nokta envanteri.
- **Talep (Install Request):** ST tarafından oluşturulan, T tarafından tamamlanan kurulum talebi; `request_no` ile tanımlanır.

---

## 6. Dil Desteği

- Login ekranında: **TR, EN, RU, RO** seçilebilir.
- Diğer ekranlar şu an Türkçe’dir; çok dilli metinler sadece login için tanımlı.

---

## 7. Versiyon Bilgisi

- **Uygulama versiyonu:** 1.0.0
- **Expo SDK:** 54
- **React:** 19.1.0
- **React Native:** 0.81.5
