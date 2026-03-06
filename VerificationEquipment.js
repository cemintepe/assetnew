import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, FlatList, 
  ActivityIndicator, SafeAreaView, Alert, Modal 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera'; 
import { useLanguage } from './src/context/LanguageContext';
import { useAuth } from './src/context/AuthContext';

export default function VerificationEquipment({ customer, dealer, onBack }) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  
  // Kilitleme mekanizması
  const isProcessing = useRef(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      // Customer Code uppercase yapılarak API'ye gönderiliyor
      const cCode = String(customer?.customer_code || "").toUpperCase();
      const response = await fetch(`https://isletmem.online/asset/api/verification/inventory/${cCode}`);
      const data = await response.json();
      if (data.status === 'success') {
        setInventory(data.inventory);
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('inventory.no_stock'));
    } finally {
      setLoading(false);
    }
  };

  const handleBarCodeScanned = async ({ data }) => {
    if (isProcessing.current) return;
    isProcessing.current = true;
    
    // Okunan barkodu hemen normalize et
    const scannedBarcode = String(data).trim().toUpperCase();
    console.log("🔍 Barkod Yakalandı:", scannedBarcode);
    
    setScannerVisible(false);

    // Envanter kontrolü (Uppercase karşılaştırma ile)
    const item = inventory.find(i => String(i.barcode).toUpperCase() === scannedBarcode);
    
    if (!item) {
      Alert.alert(
        t('common.error'), 
        `${t('inventory.barcode')}: ${scannedBarcode}\n\n${t('verification.not_belonging')}`, 
        [{ 
          text: t('common.ok'), 
          onPress: () => { isProcessing.current = false; } 
        }],
        { cancelable: false }
      );
      return;
    }

    // Başarılı senaryo: API'ye gönder
    try {
      const response = await fetch('https://isletmem.online/asset/api/verification/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barcode_no: scannedBarcode,
          customer_code: String(customer.customer_code).toUpperCase(),
          user_code: String(user?.user_code || 'ST_HATA').toUpperCase()
        })
      });
      
      const resData = await response.json();
      if (resData.status === 'success') {
        await fetchInventory();
        Alert.alert(t('common.success'), t('verification.verified_msg'),[{ text: t('common.ok'), onPress: () => { isProcessing.current = false; } }]);
      } else {
        isProcessing.current = false;
      }
    } catch (error) {
      Alert.alert(t('common.error'), "Server Error");
    } finally {
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
          <View style={styles.materialBadge}>
            <Text style={styles.materialText}>{item.material_code}</Text>
          </View>
        </View>
        <Text style={styles.descriptionText} numberOfLines={1}>{item.description}</Text>
        <Text style={styles.eqNoText}>EQ No: {item.equipment_no}</Text>
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
          <View style={styles.dealerBadge}><Text style={styles.dealerBadgeText}>{dealer}</Text></View>
          <Text style={styles.sapCodeText}> {customer.customer_code}</Text>
        </View>
        <Text style={styles.customerNameText}>{customer.name}</Text>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.scanButton} onPress={handleOpenScanner}>
          <Ionicons name="barcode-outline" size={24} color="white" />
          <Text style={styles.scanButtonText}>{t('verification.scan_btn')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.blueFindButton} onPress={() => Alert.alert('BlueFind', 'Coming Soon')}>
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
          keyExtractor={(item, index) => item.barcode + index}
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