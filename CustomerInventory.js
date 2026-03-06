import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, FlatList, 
  ActivityIndicator, SafeAreaView, Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from './supabase';
import { useLanguage } from './src/context/LanguageContext';

export default function CustomerInventory({ customer, onBack, onSelectEquipment }) {
  const { t } = useLanguage();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventory();
  }, []);

const fetchInventory = async () => {
    try {
      setLoading(true);
      
      // LOG: Neyi sorguladığımızı görelim
      console.log("🚀 SORGULANAN MÜŞTERİ KODU:", customer?.customer_code);

      const { data, error } = await supabase
        .from('equipments')
        .select('*') 
        .eq('current_location_code', String(customer.customer_code)); // String garantisi

      if (error) throw error;

      // LOG: Gelen ham veri sayısı
      console.log("📦 GELEN CİHAZ SAYISI:", data?.length);

      // HİÇBİR İŞLEM YAPMADAN DİREKT SET EDİYORUZ
      setInventory(data || []); 

    } catch (error) {
      console.error("❌ Hata:", error.message);
      Alert.alert("Hata", "Veri çekilemedi");
    } finally {
      setLoading(false);
    }
  };

  const renderEquipment = ({ item }) => (
    <TouchableOpacity 
      style={styles.equipmentCard} 
      onPress={() => onSelectEquipment(item)}
    >
      <View style={styles.cardInfo}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.barcodeText}>{item.barcode}</Text>
          <View style={styles.materialBadge}>
            <Text style={styles.materialText}>{item.material_code}</Text>
          </View>
        </View>
        <Text style={styles.descriptionText} numberOfLines={2}>
          {item.material_description}
        </Text>
      </View>
      <View style={styles.actionIcon}>
        <Ionicons name="chevron-forward-circle" size={30} color="#c2410c" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('inventory.title') || "ARIZALI CİHAZ SEÇİN"}</Text>
      </View>

      <View style={styles.customerSummary}>
        <Text style={styles.customerName}>{customer.name}</Text>
        <Text style={styles.customerCode}>SAP: {customer.customer_code}</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#c2410c" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={inventory}
          renderItem={renderEquipment}
          keyExtractor={(item) => item.id?.toString() || item.barcode}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Bu noktada kayıtlı cihaz bulunamadı.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#004a99', height: 60, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 },
  backButton: { padding: 5 },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
  customerSummary: { padding: 15, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  customerName: { fontSize: 15, fontWeight: 'bold', color: '#1e293b' },
  customerCode: { fontSize: 12, color: '#64748b', marginTop: 2 },
  listContent: { padding: 12 },
  equipmentCard: { 
    backgroundColor: 'white', 
    borderRadius: 12, 
    padding: 15, 
    marginBottom: 10, 
    flexDirection: 'row', 
    alignItems: 'center',
    borderLeftWidth: 5,
    borderLeftColor: '#c2410c', // Arıza akışı olduğu için turuncu/kırmızı ton
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardInfo: { flex: 1 },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  barcodeText: { fontSize: 11, fontWeight: 'bold', color: '#94a3b8', marginRight: 10 },
  materialBadge: { backgroundColor: '#f1f5f9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  materialText: { fontSize: 10, color: '#475569', fontWeight: '600' },
  descriptionText: { fontSize: 14, fontWeight: 'bold', color: '#334155', marginBottom: 4 },
  eqNoText: { fontSize: 11, color: '#64748b' },
  actionIcon: { marginLeft: 10 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#94a3b8' }
});