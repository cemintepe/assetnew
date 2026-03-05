import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, 
  FlatList, ActivityIndicator, SafeAreaView, Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from './src/context/LanguageContext'; 
// Database.js'den dile göre çeken fonksiyonu alıyoruz
import { getLocalCategoriesByLang } from './Database'; 

export default function ActionSelection({ customer, dealer, onBack, onSelectCategory }) {
  const { t, selectedLang } = useLanguage(); 
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dil her değiştiğinde listeyi SQLite'dan tekrar çeker
  useEffect(() => {
    console.log("🌍 Ekran dili değişti, yeni dil:", selectedLang);
    loadCategories();
  }, [selectedLang]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      // Database.js içindeki filtreli fonksiyonu çağırıyoruz
      const result = await getLocalCategoriesByLang(selectedLang);
      setCategories(result);
    } catch (error) {
      console.error("Kategoriler yüklenemedi:", error);
      Alert.alert(t('common.error') || "Hata", t('action.error_loading') || "Kategoriler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  const renderCategory = ({ item }) => {
    const categoryDisplayName = item.name || ""; 
    const isActive = Number(item.is_active) === 1; 

    return (
      <TouchableOpacity 
        style={[styles.actionItem, !isActive && styles.inactiveItem]} 
        onPress={() => {
          if (isActive) {
            onSelectCategory(item);
          } else {
            Alert.alert(categoryDisplayName, t('dashboard.soon') || "Bu işlem yakında aktif edilecektir.");
          }
        }}
      >
        <View style={styles.actionLeft}>
          <View style={[styles.iconBox, isActive ? styles.activeIconBox : styles.inactiveIconBox]}>
            <Ionicons 
              name="clipboard-outline" 
              size={24} 
              color={isActive ? "#004a99" : "#9ca3af"} 
            />
          </View>
          <View>
            <Text style={[styles.categoryName, !isActive && styles.inactiveText]}>
              {categoryDisplayName.toUpperCase()}
            </Text>
            {!isActive && (
              <Text style={styles.soonText}>
                {t('dashboard.soon_label') || "YAKINDA"}
              </Text>
            )}
          </View>
        </View>
        <Ionicons 
          name="chevron-forward" 
          size={20} 
          color={isActive ? "#004a99" : "#ccc"} 
        />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('action.title') || "İşlem Türü Seçimi"}</Text>
      </View>

      <View style={styles.customerInfoBox}>
        <View style={styles.infoBadgeRow}>
          <View style={styles.dealerBadge}>
            <Text style={styles.dealerBadgeText}>{dealer}</Text>
          </View>
          <Text style={styles.sapCodeText}>SAP: {customer?.customer_code}</Text>
        </View>
        <Text style={styles.customerNameText}>{customer?.name}</Text>
      </View>

      <View style={styles.listTitleContainer}>
        <Text style={styles.listTitle}>{t('action.select_category') || "KATEGORİ SEÇİNİZ"}</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#004a99" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

// Styles aynı kalabilir...
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: { backgroundColor: '#004a99', height: 60, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 },
  backButton: { padding: 5 },
  headerTitle: { color: 'white', fontSize: 17, fontWeight: 'bold', marginLeft: 10 },
  customerInfoBox: { backgroundColor: '#f3f4f6', padding: 15, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  infoBadgeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  dealerBadge: { backgroundColor: '#e5e7eb', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginRight: 8 },
  dealerBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#4b5563' },
  sapCodeText: { fontSize: 11, color: '#6b7280' },
  customerNameText: { fontSize: 15, fontWeight: 'bold', color: '#1e3a8a' },
  listTitleContainer: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  listTitle: { fontSize: 11, fontWeight: 'bold', color: '#9ca3af', letterSpacing: 1.2 },
  actionItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  actionLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  activeIconBox: { backgroundColor: '#eff6ff' },
  inactiveIconBox: { backgroundColor: '#f9fafb' },
  categoryName: { fontSize: 15, fontWeight: 'bold', color: '#111827' },
  inactiveItem: { backgroundColor: '#fcfcfc' },
  inactiveText: { color: '#9ca3af' },
  soonText: { fontSize: 10, color: '#9ca3af', fontWeight: 'bold', marginTop: 2 },
  listContent: { paddingBottom: 20 }
});