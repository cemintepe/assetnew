export default {
  auth: {
    username: "Kullanıcı Kodu",
    password: "Şifre",
    login: "GİRİŞ YAP",
    forgot: "Şifremi Unuttum",
    agreement: "Kullanıcı Sözleşmesi",
    privacy: "Gizlilik Politikası", 
    error: "Yetkilendirme Hatası",
    fillAll: "Lütfen tüm alanları doldurun.",
    invalid_login: "Geçersiz kullanıcı kodu veya şifre."
  },
  common: {
    success: "Başarılı",
    loading: "Yükleniyor...",
    back: "Geri",
    error: "Hata",
    info: "Bilgi",
    complete: "Tamamla", // Virgül eklendi
    customer: "MÜŞTERİ",
    sap_code: "SAP KODU",
    dealer: "BAYİ",
    ok: "TAMAM"
  },
  dashboard: {
    welcome: "Hoş geldin",
    find_customer: "Müşteri bul...",
    select_dealer: "Bayi seçmek için dokunun",
    no_customer_found: "Bu bayiye ait müşteri bulunamadı.",
    no_sync_yet: "Henüz veri senkronize edilmedi.",
    sync_data: "VERİLERİ EŞİTLE (SYNC)",
    update_sync: "GÜNCELLE (SYNC)",
    sync_first: "Önce 'SYNC' butonu ile bayileri indirin.",
    sync_complete: "müşteri başarıyla kaydedildi.",
    list_error: "Müşteri listesi alınamadı.",
    no_address: "İLGİLİ KİŞİ BELİRTİLMEMİŞ", // Virgül eklendi
    soon: "Bu işlem henüz aktif değildir. Çok yakında hizmetinizde olacak.",
    soon_label: "YAKINDA",
  },  
  action: {
    title: "İşlem Türü Seçimi",
    select_category: "KATEGORİ SEÇİNİZ",
    no_categories: "Görüntülenecek kategori bulunamadı.",
    error_loading: "Kategoriler yüklenirken bir hata oluştu."
  },

    job_selection: {
    title: "Aktivite Türü Seçimi",
    selected_category: "SEÇİLİ KATEGORİ",
    list_title: "TALEP TİPİNİ BELİRLEYİN",
    inactive_msg: "işlemi henüz aktif değildir.",
    load_error: "Yerel veriler okunamadı."
  },

  inventory: {
    title: "Envanter Seçimi",
    stock_status: "MEVCUT DEPO STOK",
    available: "MEVCUT",
    unit: "ADET",
    product_group: "ÜRÜN GRUBU",
    empty_depot: "Seçili bayinin deposu boş görünüyor.",
    scanning: "Depo taranıyor...",
    barcode: "BARKOD",
  },

  summary: {
    title: "İşlem Onayı",
    installation_point: "KURULUM NOKTASI",
    requested_equipment: "TALEP EDİLEN EKİPMAN",
    job_type: "İŞLEM TİPİ",
    source: "KAYNAK",
    depot: "BAYİ DEPO",
    note_label: "İŞLEM NOTU (OPSİYONEL)",
    note_placeholder: "Teknisyene iletmek istediğiniz notlar...",
    confirm_btn: "TALEBİ ONAYLA",
    footer_info: "TALEBİ ONAYLADIĞINIZDA SİSTEMDE OTOMATİK İŞ EMRİ AÇILACAKTIR.",
    success_title: "TALEP OLUŞTURULDU",
    success_sub: "Kurulum talebi başarıyla sisteme işlendi.",
    reg_no: "KAYIT NUMARASI",
    my_customers: "Müşterileriye Dön"
  },

  verification: {
    title: "ENVANTER DOĞRULAMA",
    scan_btn: "BARKOD OKUT",
    not_belonging: "Bu ekipman bu noktaya ait değildir!",
    verified_msg: "Ekipman başarıyla doğrulandı.",
    list_title: "NOKTA ENVANTERİ",
    camera_permission: "Kamera izni gerekli",
    missing: "KAYIP"
  },

  repair: {
    summary_title: "ARIZA ÖZETİ",
    point_label: "ARIZA NOKTASI",
    device_label: "ARIZALI CİHAZ",
    note_label: "ARIZA NOTU VE DETAYLAR",
    note_placeholder: "Arızayı detaylıca tarif ediniz (Örn: Soğutmuyor, Kapak kırık...)",
    submit_btn: "ARIZAYI BİLDİR",
    footer_info: "Oluşturulan talep bölge teknisyenine anlık olarak iletilecektir.",
    fill_note: "Lütfen arıza detayını belirtiniz.",
    submit_error: "Talebiniz iletilemedi.",
    success_title: "TALEP ALINDI",
    success_sub: "Arıza bildiriminiz teknik ekibe iletilmiştir.",
    reg_no_label: "ARIZA KAYIT NO"
  }

};