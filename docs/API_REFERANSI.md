# Asset Mobil – API Referansı

**Base URL:** `https://isletmem.online/asset/api/`

Tüm istekler `Content-Type: application/json` header’ı ile gönderilir (POST için).

---

## 1. Kimlik Doğrulama

### POST `/login`

**Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Başarılı Yanıt:**
```json
{
  "success": true,
  "role": "ST" | "T",
  "username": "string",
  ...
}
```

**Hata:**
```json
{
  "success": false,
  "message": "string"
}
```

---

## 2. Satış Temsilcisi (ST) Endpoint’leri

### GET `/my-dealers`

**Query:** `username` (gerekli)

**Örnek:** `?username=ST001`

**Yanıt:** Bayi listesi
```json
[
  {
    "dealer_code": "string",
    "name": "string"
  }
]
```

---

### GET `/my-customers`

**Query:** `username`, `dealer_code` (gerekli)

**Örnek:** `?username=ST001&dealer_code=BAYI01`

**Yanıt:** Müşteri listesi
```json
[
  {
    "customer_code": "string",
    "dealer_code": "string",
    "st_username": "string",
    "region_code": "string",
    "name": "string",
    "address": "string",
    "updated_at": "string"
  }
]
```

---

### GET `/action-categories`

**Yanıt:** Kategori listesi
```json
[
  {
    "id": 1,
    "name": "Soğutucu İşlemleri"
  },
  {
    "id": 5,
    "name": "Verifikasyon"
  }
]
```

---

### GET `/dealer-inventory`

**Query:** `dealer_code` (gerekli)

**Örnek:** `?dealer_code=BAYI01`

**Yanıt:** Bayi deposu stok listesi
```json
[
  {
    "type_code": "string",
    "material_description": "string",
    "total": number
  }
]
```

---

### POST `/create-install-request`

**Body:**
```json
{
  "customer_code": "string",
  "dealer_code": "string",
  "type_code": "string",
  "material_description": "string",
  "note": "string",
  "username": "string"
}
```

**Başarılı Yanıt:**
```json
{
  "success": true,
  "request_no": "string"
}
```

**Hata:**
```json
{
  "success": false,
  "message": "string"
}
```

---

### GET `/verification/inventory/{customer_code}`

**Path:** `customer_code` (müşteri SAP kodu)

**Yanıt:**
```json
{
  "status": "success",
  "inventory": [
    {
      "barcode": "string",
      "material_code": "string",
      "description": "string",
      "equipment_no": "string",
      "is_verified": boolean
    }
  ]
}
```

---

### POST `/verification/store`

**Body:**
```json
{
  "barcode_no": "string",
  "customer_code": "string",
  "user_code": "string"
}
```

**Yanıt:**
```json
{
  "status": "success"
}
```

---

## 3. Teknisyen (T) Endpoint’leri

### GET `/my-install-requests`

**Query:** `status` (gerekli) – `PENDING` | `CANCELLED` | `COMPLETED`

**Örnek:** `?status=PENDING`

**Yanıt:** Talep listesi
```json
[
  {
    "request_no": "string",
    "customer_name": "string",
    "customer_code": "string",
    "material_description": "string",
    "status": "PENDING" | "CANCELLED" | "COMPLETED",
    "created_at": "string"
  }
]
```

---

### POST `/complete-install-request`

**Body:**
```json
{
  "barcode": "string",
  "request_no": "string"
}
```

**Başarılı Yanıt:**
```json
{
  "success": true
}
```

**Hata:**
```json
{
  "success": false,
  "message": "string"
}
```

---

### POST `/cancel-install-request`

**Body:**
```json
{
  "request_no": "string"
}
```

**Başarılı Yanıt:**
```json
{
  "success": true
}
```

**Hata:**
```json
{
  "success": false,
  "message": "string"
}
```

---

## 4. Hata Durumları

- Ağ hatası: Uygulama genelde "Server Error", "Bağlantı hatası" gibi mesajlar gösterir.
- API hata döndüğünde `success: false` ve `message` alanı kullanılır.
