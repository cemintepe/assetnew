import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, FlatList, 
  ActivityIndicator, SafeAreaView, Alert, Modal 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera'; 
import { useLanguage } from './src/context/LanguageContext';
import { useAuth } from './src/context/AuthContext';
import { supabase } from './supabase'; // Supabase istemcinizin yolu

export default function VerificationEquipment({ customer, dealer, onBack }) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  
  // Kilitleme mekanizması: Birden fazla alert ve kayıt oluşmasını engeller
  const isProcessing = useRef(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  // 1. ADIM: Envanteri ve Doğrulama Durumunu Çekme
const fetchInventory = async () => {
    try {
      setLoading(true);
      const cCode = customer?.customer_code;
      
      const now = new Date();
      // Bu Ay: 03.2026
      const currentPeriod = `${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`;
      
      // Geçen Ay: 02.2026 (Ocak ise bir önceki yıla geçer)
      const lastMonthDate = new Date();
      lastMonthDate.setMonth(now.getMonth() - 1);
      const lastPeriod = `${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}.${lastMonthDate.getFullYear()}`;

      // 1. Ana Envanter
      const { data: eqData, error: eqError } = await supabase
        .from('equipments')
        .select('*')
        .eq('current_location_code', cCode);

      if (eqError) throw eqError;

      // 2. Doğrulamalar (Tüm kayıtları çekiyoruz ki geçmişe bakabilelim)
      const { data: verData, error: verError } = await supabase
        .from('equipment_verifications')
        .select('barcode_no, period')
        .eq('customer_code', cCode);

      if (verError) throw verError;

      const mergedData = eqData.map(item => {
        const itemBarcodes = verData.filter(v => String(v.barcode_no) === String(item.barcode));
        
        // Bu ay okunmuş mu?
        const isVerifiedThisPeriod = itemBarcodes.some(v => v.period === currentPeriod);
        
        // Geçen ay okunmuş mu?
        const isVerifiedLastPeriod = itemBarcodes.some(v => v.period === lastPeriod);

        // KAYIP ŞARTı: Bu ay okunmamış VE geçen ay da okunmamışsa
        const isMissing = !isVerifiedThisPeriod && !isVerifiedLastPeriod;

        return {
          ...item,
          is_verified: isVerifiedThisPeriod,
          is_missing: isMissing, // Yeni flag
          description: item.material_description 
        };
      });

      setInventory(mergedData);
    } catch (error) {
      console.error("Supabase Fetch Error:", error);
      Alert.alert(t('common.error'), t('inventory.no_stock'));
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  // 2. ADIM: Barkod Okutma ve Kayıt
const handleBarCodeScanned = async ({ data }) => {
  if (isProcessing.current) return;
  isProcessing.current = true;
  
  const scannedBarcode = String(data).trim().toUpperCase();
  setScannerVisible(false);

  // 1. ÖNCE LOKALDE KONTROL ET
  const itemIndex = inventory.findIndex(i => String(i.barcode).toUpperCase() === scannedBarcode);
  
  if (itemIndex === -1) {
    Alert.alert(t('common.error'), `${t('inventory.barcode')}: ${scannedBarcode}\n\n${t('verification.not_belonging')}`, 
      [{ text: t('common.ok'), onPress: () => { isProcessing.current = false; } }]);
    return;
  }

  // --- HIZLANDIRMA SİHİRLİ DOKUNUŞ BURADA ---
  // 2. OPTIMISTIC UPDATE: Sunucudan cevap gelmeden arayüzü güncelle
  const newInventory = [...inventory];
  newInventory[itemIndex] = { 
    ...newInventory[itemIndex], 
    is_verified: true, // Hemen yeşil yap
    is_missing: false  // Kayıp yazısını hemen kaldır
  };
  setInventory(newInventory); 
  // -----------------------------------------

  try {
    const now = new Date();
    const currentPeriod = `${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`;

    // 3. ARKA PLANDA KAYDI AT (Kullanıcı burayı beklemiyor)
    const { error } = await supabase
      .from('equipment_verifications')
      .insert([{
        barcode_no: scannedBarcode,
        customer_code: parseInt(customer.customer_code),
        user_code: String(user?.user_code || 'HATA').toUpperCase(),
        period: currentPeriod,
        scanned_at: new Date().toISOString()
      }]);

    if (error) throw error;
    
    // Her şey yolunda, işlem kilidini aç
    isProcessing.current = false;

  } catch (error) {
    console.error("Kayıt Hatası:", error);
    // Hata olursa lokal değişikliği geri al (Opsiyonel ama güvenli)
    fetchInventory(); 
    Alert.alert(t('common.error'), "Database Insert Error");
    isProcessing.current = false;
  } 
};

  const handleOpenScanner = async () => {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert(t('common.error'), t('verification.camera_permission'));
        return;
      }
    }
    isProcessing.current = false;
    setScannerVisible(true);
  };

const renderEquipment = ({ item }) => (
    <View style={[styles.equipmentCard, item.is_verified && styles.verifiedCard]}>
      <View style={styles.cardInfo}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.barcodeText}>{item.barcode}</Text>
          <View style={{flexDirection: 'row', gap: 5}}>
            <View style={styles.materialBadge}>
              <Text style={styles.materialText}>{item.material_code}</Text>
            </View>
            
            {/* KAYIP BADGE - Sadece is_missing true ise ve bu ay doğrulanmamışsa görünüre */}
            {item.is_missing && !item.is_verified && (
              <View style={[styles.materialBadge, {backgroundColor: '#fee2e2'}]}>
                <Text style={[styles.materialText, {color: '#ef4444', fontWeight: 'bold'}]}>{t('verification.missing')}</Text>
              </View>
            )}
          </View>
        </View>
        <Text style={styles.descriptionText} numberOfLines={1}>{item.material_description}</Text>
      </View>
      <View style={styles.statusIcon}>
        {item.is_verified ? (
          <Ionicons name="checkmark-circle" size={28} color="#10b981" />
        ) : (
          <View style={styles.unverifiedCircle} />
        )}
      </View>
    </View>
  );

  const verifiedCount = inventory.filter(i => i.is_verified).length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('verification.title')}</Text>
      </View>

      <View style={styles.customerInfoBox}>
        <View style={styles.infoBadgeRow}>
          <View style={styles.dealerBadge}>
            <Text style={styles.dealerBadgeText}>{dealer}</Text>
          </View>
          <Text style={styles.sapCodeText}>{customer.customer_code}</Text>
        </View>
        <Text style={styles.customerNameText}>{customer.name}</Text>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.scanButton} onPress={handleOpenScanner}>
          <Ionicons name="barcode-outline" size={24} color="white" />
          <Text style={styles.scanButtonText}>{t('verification.scan_btn')}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.blueFindButton} 
          onPress={() => Alert.alert('BlueFind', 'Coming Soon')}
        >
          <Ionicons name="bluetooth" size={24} color="#0284c7" />
          <Text style={styles.blueFindText}>BLUEFIND TARA</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>{t('verification.list_title')}</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{verifiedCount}/{inventory.length}</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#004a99" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={inventory}
          renderItem={renderEquipment}
          keyExtractor={(item, index) => (item.barcode || index).toString()}
          contentContainerStyle={styles.listContent}
        />
      )}

      <Modal visible={scannerVisible} animationType="fade">
        <View style={styles.cameraContainer}>
          <CameraView
            style={StyleSheet.absoluteFillObject}
            onBarcodeScanned={isProcessing.current ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ["qr", "ean13", "code128"],
            }}
          />
          <View style={styles.overlay}>
             <View style={styles.unfocusedContainer}></View>
             <View style={styles.focusedContainer}>
                <View style={styles.focusedLine} />
             </View>
             <View style={styles.unfocusedContainer}></View>
          </View>
          <TouchableOpacity 
            style={styles.closeCameraButton} 
            onPress={() => setScannerVisible(false)}
          >
            <Text style={styles.closeCameraText}>{t('common.cancel') || 'İPTAL'}</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  header: { backgroundColor: '#004a99', height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 },
  backButton: { padding: 5 },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
  customerInfoBox: { backgroundColor: '#f3f4f6', padding: 15, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  infoBadgeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  dealerBadge: { backgroundColor: '#e5e7eb', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginRight: 8 },
  dealerBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#4b5563' },
  sapCodeText: { fontSize: 11, color: '#6b7280', fontFamily: 'monospace' },
  customerNameText: { fontSize: 15, fontWeight: 'bold', color: '#1e3a8a', textTransform: 'uppercase' },
  actionRow: { flexDirection: 'row', padding: 15, backgroundColor: 'white', gap: 10, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  scanButton: { flex: 1, backgroundColor: '#004a99', borderRadius: 12, padding: 15, alignItems: 'center', justifyContent: 'center' },
  scanButtonText: { color: 'white', fontWeight: 'bold', fontSize: 11, marginTop: 5 },
  blueFindButton: { flex: 1, backgroundColor: '#e0f2fe', borderRadius: 12, padding: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#bae6fd' },
  blueFindText: { color: '#0369a1', fontWeight: 'bold', fontSize: 11, marginTop: 5 },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 15 },
  listTitle: { fontSize: 11, fontWeight: 'bold', color: '#9ca3af', letterSpacing: 1.2 },
  countBadge: { backgroundColor: '#dbeafe', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  countText: { fontSize: 11, fontWeight: 'bold', color: '#1d4ed8' },
  listContent: { padding: 10 },
  equipmentCard: { backgroundColor: 'white', borderRadius: 10, padding: 15, marginBottom: 10, flexDirection: 'row', alignItems: 'center', borderLeftWidth: 4, borderLeftColor: '#e5e7eb' },
  verifiedCard: { borderLeftColor: '#10b981', backgroundColor: '#f0fdf4' },
  cardInfo: { flex: 1 },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  barcodeText: { fontSize: 10, fontWeight: 'bold', color: '#9ca3af', marginRight: 8 },
  materialBadge: { backgroundColor: '#f3f4f6', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  materialText: { fontSize: 9, color: '#6b7280', fontFamily: 'monospace' },
  descriptionText: { fontSize: 14, fontWeight: 'bold', color: '#374151', marginBottom: 2 },
  eqNoText: { fontSize: 11, color: '#6b7280' },
  statusIcon: { marginLeft: 10 },
  unverifiedCircle: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#f3f4f6' },
  cameraContainer: { flex: 1, backgroundColor: 'black' },
  closeCameraButton: { position: 'absolute', bottom: 40, alignSelf: 'center', backgroundColor: 'rgba(255,255,255,0.4)', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 25 },
  closeCameraText: { color: 'white', fontWeight: 'bold' },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  focusedContainer: { width: 250, height: 150, borderWidth: 2, borderColor: '#004a99' },
  unfocusedContainer: { flex: 1, width: '100%', backgroundColor: 'rgba(0,0,0,0.6)' },
  focusedLine: { width: '100%', height: 1, backgroundColor: 'red', position: 'absolute', top: '50%' }
});