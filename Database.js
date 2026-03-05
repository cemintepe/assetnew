import * as SQLite from 'expo-sqlite';

// Veritabanını açıyoruz (assets_v4.db)
const db = SQLite.openDatabaseSync('assets_v4.db');

/**
 * Veritabanı ve Tablo Başlatma
 */
export const initDB = async () => {
  try {


    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      
      -- BAYİ TABLOSU
      CREATE TABLE IF NOT EXISTS dealers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        dealer_code TEXT UNIQUE,
        name TEXT,
        st_usernames TEXT
      );

      -- MÜŞTERİ TABLOSU
      CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_code TEXT UNIQUE,
        dealer_code TEXT,
        st_username TEXT,
        region_code TEXT,
        name TEXT,
        address TEXT,
        updated_at TEXT
      );

      -- İŞLEM KATEGORİLERİ TABLOSU (YENİ)
        CREATE TABLE IF NOT EXISTS action_categories (
        id INTEGER PRIMARY KEY,
        name TEXT, 
        is_active INTEGER DEFAULT 1,
        lang TEXT
      );
      -- İşlem Türleri Tablosu (YENİ) 
        CREATE TABLE IF NOT EXISTS job_types (
        id INTEGER PRIMARY KEY,
        name TEXT,
        sub_text TEXT,
        icon_name TEXT,
        is_active INTEGER,
        color_code TEXT,
        category_id INTEGER
      );
    `);
    console.log("✅ SQLite: Tüm Tablolar Hazır (Dealers, Customers, Categories)");
  } catch (error) {
    console.error("❌ DB Başlatma Hatası:", error);
  }
};

// saveCategoriesToLocal fonksiyonunu güncelleyin
export const saveCategoriesToLocal = async (categories) => {
  try {
    await db.runAsync('DELETE FROM action_categories');
    for (const cat of categories) {
      await db.runAsync(
        'INSERT INTO action_categories (id, name, is_active, lang) VALUES (?, ?, ?, ?)',
        [cat.id, cat.name, cat.is_active ? 1 : 0, cat.lang]
      );
    }
    console.log("💾 20 kategori (tüm diller) SQLite'a kaydedildi.");
  } catch (error) {
    console.error("❌ Kayıt Hatası:", error);
  }
};

/**
 * KATEGORİLERİ GETİR (ActionSelection.js içinde kullanılır)
 */
export const getLocalCategoriesByLang = async (langCode) => {
  try {
    // langCode gelmezse varsayılan TR çeksin
    const language = langCode ? langCode.toUpperCase() : 'TR';
    return await db.getAllAsync(
      'SELECT * FROM action_categories WHERE lang = ? ORDER BY id ASC',
      [language]
    );
  } catch (error) {
    console.error("❌ Kategori Okuma Hatası:", error);
    return [];
  }
};

/**
 * BAYİLERİ KAYDET
 */
export const saveDealersToLocal = async (dealers, loggedInUser) => {
  try {
    const upperUser = String(loggedInUser).toUpperCase();
    await db.runAsync('DELETE FROM dealers WHERE st_usernames = ?', [upperUser]);
    
    for (const dealer of dealers) {
      await db.runAsync(
        'INSERT OR REPLACE INTO dealers (dealer_code, name, st_usernames) VALUES (?, ?, ?)',
        [dealer.dealer_code, dealer.name, upperUser]
      );
    }
    console.log(`💾 ${upperUser} için Bayiler kaydedildi.`); 
  } catch (error) {
    console.error("❌ Bayi Kayıt Hatası:", error);
  }
};

/**
 * BAYİLERİ GETİR
 */
export const getLocalDealers = async (loggedInUser) => {
  try {
    const upperUser = String(loggedInUser).toUpperCase();
    return await db.getAllAsync(
      'SELECT * FROM dealers WHERE st_usernames = ? ORDER BY name ASC', 
      [upperUser]
    );
  } catch (error) {
    console.error("❌ Bayi Okuma Hatası:", error);
    return [];
  }
};

/**
 * MÜŞTERİLERİ KAYDET
 */
export const saveCustomersToLocal = async (customers, loggedInUser) => {
  try {
    const upperUser = String(loggedInUser).toUpperCase();
    await db.runAsync('DELETE FROM customers WHERE st_username = ?', [upperUser]);
    
    for (const cust of customers) {
      await db.runAsync(
        `INSERT OR REPLACE INTO customers 
        (customer_code, dealer_code, st_username, region_code, name, address, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [cust.customer_code, cust.dealer_code, upperUser, cust.region_code, cust.name, cust.address, cust.updated_at]
      );
    }
    console.log(`✅ ${upperUser} için ${customers.length} müşteri yüklendi.`);
  } catch (error) {
    console.error("❌ Müşteri Kayıt Hatası:", error);
  }
};

/**
 * MÜŞTERİLERİ GETİR (Bayi Bazlı)
 */
export const getLocalCustomersByDealer = async (dealerCode, loggedInUser) => {
  try {
    const upperUser = String(loggedInUser).toUpperCase();
    const dCode = String(dealerCode);

    const results = await db.getAllAsync(
      'SELECT * FROM customers WHERE dealer_code = ? AND st_username = ? ORDER BY name ASC', 
      [dCode, upperUser]
    );
    return results;
  } catch (error) {
    console.error("❌ Müşteri Okuma Hatası:", error);
    return [];
  }
};

export const saveJobTypesToLocal = async (jobTypes) => {
  try {
    await db.runAsync('DELETE FROM job_types');
    for (const job of jobTypes) {
      await db.runAsync(
        'INSERT INTO job_types (id, name, sub_text, icon_name, is_active, color_code, category_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [job.id, job.name, job.sub_text, job.icon_name, job.is_active, job.color_code, job.category_id]
      );
    }
    console.log(`✅ ${jobTypes.length} Job Type SQLite'a kaydedildi.`);
  } catch (error) {
    console.error("❌ Job Types Kayıt Hatası:", error);
  }
};

export const getJobTypesByCategoryId = async (catId) => {
  try {
    // Sadece o kategoriye ait olanları getir
    return await db.getAllAsync(
      'SELECT * FROM job_types WHERE category_id = ? ORDER BY id ASC',
      [catId]
    );
  } catch (error) {
    console.error("❌ Job Types Okuma Hatası:", error);
    return [];
  }
};