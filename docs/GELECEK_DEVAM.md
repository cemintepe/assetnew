# Asset Mobil – Gelecek Çalışmalar ve Devam Rehberi

Bu doküman, projeye yeni başlayan bir geliştirici veya AI’nın mevcut durumu ve devam ederken dikkat etmesi gerekenleri anlaması için hazırlanmıştır.

---

## 1. Tamamlanan Özellikler ✅

| Özellik | Durum |
|---------|--------|
| Çok dilli login (TR, EN, RU, RO) | Tamamlandı |
| Rol bazlı routing (ST / T) | Tamamlandı |
| Bayi/müşteri SYNC ve SQLite önbellek | Tamamlandı |
| Kurulum talebi akışı (Müşteri → Kategori → İş Tipi → Envanter → Özet → Gönder) | Tamamlandı |
| Verifikasyon akışı (kategori id=5, barkod tarama) | Tamamlandı |
| Teknisyen talep listesi (PENDING/CANCELLED/COMPLETED) | Tamamlandı |
| Barkod ile kurulum tamamlama | Tamamlandı |
| Talep iptal etme | Tamamlandı |
| Barkod tarama (code128, QR, ean13) | Tamamlandı |

---

## 2. Planlanan / Eksik Özellikler 🔲

| Özellik | Durum | Not |
|---------|--------|-----|
| Sökme iş tipi | Yakında | JobTypeSelection’da pasif |
| Arıza iş tipi | Yakında | JobTypeSelection’da pasif |
| Bluefind Tara | Yakında | VerificationEquipment ve TechRequestDetail’de buton var, işlev yok |
| Diğer kategoriler (id≠1, id≠5) | Yakında | ActionSelection’da “Yakında” |
| Çoklu dil (ekran metinleri) | Eksik | Sadece login çok dilli |

---

## 3. Bilinen Teknik Borçlar ve Düzeltmeler

| Konu | Dosya | Öneri |
|------|-------|-------|
| `user_code: 'ST001'` sabit | VerificationEquipment.js | `user.username` veya ilgili prop’tan alınmalı |
| `handleCreateInstallRequest` kullanılmıyor | App.js | Kaldırılabilir veya tek bir yerde toplanmalı |
| `dealer_code` vs `dealer_name` tutarsızlığı | Çeşitli | API ve customer objesi netleştirilmeli |
| Database.js `saveDealersToLocal` | Database.js | DELETE sorgusunda `st_usernames` kullanılıyor; sütun adı kafa karıştırıcı olabilir |
| TeknisyenDashboard export adı | TeknisyenDashboard.js | `TechDashboard` export ediliyor, `TeknisyenDashboard` import ediliyor – çalışıyor ama tutarsız |

---

## 4. Devam Eden Geliştirme İçin Kurallar

1. **Routing:** Ekran geçişleri state tabanlıdır. Yeni ekran eklerken `App.js` state’ine yeni `selected*` değişkeni ekleyin ve uygun `if` bloğunda render edin.
2. **API Base URL:** `https://isletmem.online/asset/api/` sabit; env değişkeni kullanılmıyor. Ortam değiştirmek için tüm `fetch` çağrılarında URL güncellenmeli veya merkezi bir API helper kullanılmalı.
3. **Stil:** Renk paleti `#004a8d`, `#004a99`, `#2563eb` vb. korunmalı; tutarlılık için mevcut stillere uyun.
4. **Barkod kilidi:** VerificationEquipment’taki `isProcessing` ref’i tekrarlı okumayı engeller. Benzer tarama ekranlarında aynı pattern kullanılmalı.
5. **SQLite:** `initDB()` uygulama başlangıcında (StDashboard useEffect) çağrılıyor. Yeni tablo eklerken migration stratejisi düşünün.

---

## 5. Test ve Çalıştırma

```bash
npm start        # Expo dev server
npm run ios      # iOS simulator
npm run android  # Android emulator
npm run web      # Web
```

---

## 6. Bağımlılık Versiyonları (package.json)

- expo: ~54.0.33  
- expo-sqlite: ~16.0.10  
- expo-camera: ~17.0.10  
- expo-barcode-scanner: ^13.0.1  
- react: 19.1.0  
- react-native: 0.81.5  

Yeni paket eklerken mevcut Expo SDK 54 uyumluluğuna dikkat edin.

---

## 7. Dokümantasyon Özeti

| Dosya | İçerik |
|-------|--------|
| PROJE_GENEL_BAKIS.md | Proje tanımı, roller, iş akışları, ekranlar |
| TEKNIK_MIMARI.md | Teknoloji yığını, dosya yapısı, mimari kararlar |
| VERI_AKISI_KAVRAMLAR.md | SQLite şeması, state, prop geçişleri, veri akışları |
| API_REFERANSI.md | Tüm REST endpoint’leri, request/response formatları |
| GELECEK_DEVAM.md | Bu dosya – tamamlanan/planlanan özellikler, teknik borç, devam rehberi |

Bu dokümanlar birlikte projenin tam resmini verir; başka bir geliştirici veya AI bu dosyaları okuyarak projeyi bozmadan üzerinde çalışmaya devam edebilir.
