import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, SafeAreaView, 
  TextInput, Alert, ActivityIndicator, ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from './supabase';
import { useLanguage } from './src/context/LanguageContext';

export default function InstallationSummary({ customer, category, jobType, inventory, user, onBack, onComplete }) {
  const { t } = useLanguage();
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);

      const generateRequestID = (prefix) => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear()).slice(-2);
    const random = Math.floor(1000 + Math.random() * 9000); // 4 haneli random
    return `${prefix}${day}${month}${year}${random}`;
    };

  const submitRequest = async () => {
    console.log("--- DEBUG BAŞLADI ---");
    console.log("ADIM 1: Fonksiyon tetiklendi.");
    setLoading(true);
    const requestId = generateRequestID('INS');
    // 1. Veri Paketini Hazırla
    // Safe check: Objelerin varlığını kontrol ediyoruz
    const payload = {
      request_id: requestId,
      customer_code: customer?.customer_code || "KOD_YOK",
      dealer_code: customer?.dealer_code || "BAYI_YOK",
      type_code: inventory?.type_code || "TIP_YOK",
      material_description: inventory?.material_description || "DESC_YOK",
      note: note || "",
      username: String(user?.user_code || "KOD_YOK").toUpperCase(),
      status: 'PENDING',
      created_at: new Date().toISOString()
    };

    console.log("ADIM 2: Hazırlanan Payload:", JSON.stringify(payload, null, 2));

    try {
      console.log("ADIM 3: Supabase Insert başlıyor...");
      
      // Timeout riski için yarım yamalak kalmasın diye await'i net yakalıyoruz
      const { data, error, status } = await supabase
        .from('install_requests')
        .insert([payload])
        .select();

      console.log("ADIM 4: Supabase Yanıt Döndü. HTTP Statu:", status);

      if (error) {
        console.log("ADIM 5: Hata yakalandı!", error);
        setLoading(false); 
        Alert.alert('Sistem Hatası', `${error.message} (Kod: ${error.code})`);
        return; 
      }

      console.log("ADIM 6: Veri başarıyla yazıldı. Gelen Data:", data);

      // 3. Başarılı ise Kayıt Numarasını Göster
      if (data && data.length > 0) {
        console.log("ADIM 7: Kayıt ID oluşturuluyor.");
        setSuccessData(requestId);
      } else {
        console.log("ADIM 7: Data boş ama hata yok. Fallback çalışıyor.");
        setSuccessData("requestId"); 
      }

    } catch (e) {
      console.log("ADIM 8: CATCH Bloğu - Kritik Hata!", e);
      Alert.alert('Hata', 'İşlem sırasında beklenmedik bir hata oluştu: ' + (e.message || 'Bağlantı sorunu'));
    } finally {
      console.log("ADIM 9: İşlem bitti, loading kapatılıyor.");
      setLoading(false);
    }
  };

  // BAŞARI EKRANI (Success View)
  if (successData) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successIconBox}>
          <Ionicons name="checkmark-sharp" size={60} color="#22c55e" />
        </View>
        <Text style={styles.successTitle}>{t('summary.success_title')}</Text>
        <Text style={styles.successSub}>{t('summary.success_sub')}</Text>
        
        <View style={styles.reqNoCard}>
          <Text style={styles.reqNoLabel}>{t('summary.reg_no')}</Text>
          <Text style={styles.reqNoValue}>{successData}</Text>
        </View>

        <TouchableOpacity style={styles.homeBtn} onPress={onComplete}>
          <Text style={styles.homeBtnText}>{t('summary.my_customers')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('summary.title')}</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.summaryCard}>
          <View style={styles.cardTop}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardLabel}>{t('summary.installation_point')} </Text>
                <Text style={styles.cardCustomerName}>{customer?.name?.toUpperCase() || "Bilinmiyor"}</Text>
              </View>
              <View style={styles.cardBadge}>
                <Text style={styles.cardBadgeText}>{customer?.customer_code || "---"}</Text>
              </View>
            </View>

            <View style={styles.cardDivider} />

            <View>
              <Text style={styles.cardLabel}>{t('summary.requested_equipment')}</Text>
              <View style={styles.deviceRow}>
                <Text style={styles.deviceName}>{inventory?.material_description?.toUpperCase() || "---"}</Text>
                <View style={styles.typeTag}>
                  <Text style={styles.typeTagText}>{inventory?.type_code || "---"}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.cardBottom}>
            <View style={styles.infoGrid}>
              <View>
                <Text style={styles.infoLabel}>{t('summary.job_type')}</Text>
                <View style={styles.iconRow}>
                  <Ionicons name="construct-outline" size={14} color="#2563eb" />
                  <Text style={styles.infoValue}>{jobType?.name?.toUpperCase() || "---"}</Text>
                </View>
              </View>
              <View>
                <Text style={styles.infoLabel}>{t('summary.source')}</Text>
                <View style={styles.iconRow}>
                  <Ionicons name="business-outline" size={14} color="#1e40af" />
                  <Text style={styles.infoValue}>{t('summary.depot')}</Text>
                </View>
              </View>
            </View>

            <View style={styles.noteSection}>
              <Text style={styles.noteLabel}>{t('summary.note_label')}</Text>
              <TextInput 
                style={styles.noteInput}
                placeholder={t('summary.note_placeholder')}
                multiline
                numberOfLines={3}
                value={note}
                onChangeText={setNote}
              />
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.submitBtn, loading && { opacity: 0.7 }]} 
          onPress={submitRequest}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text style={styles.submitBtnText}>{t('summary.confirm_btn')}</Text>
              <Ionicons name="checkmark-circle" size={20} color="white" style={{ marginLeft: 8 }} />
            </>
          )}
        </TouchableOpacity>
        
        <Text style={styles.footerInfo}>{t('summary.footer_info')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { backgroundColor: '#004a99', height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 },
  backButton: { padding: 5 },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
  content: { padding: 16 },
  summaryCard: { backgroundColor: 'white', borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 20 },
  cardTop: { backgroundColor: '#1e3a8a', padding: 20 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
  cardLabel: { fontSize: 10, fontWeight: 'bold', color: 'rgba(255,255,255,0.7)', letterSpacing: 1, marginBottom: 4 },
  cardCustomerName: { fontSize: 18, fontWeight: 'bold', color: 'white', flex: 1, marginRight: 10 },
  cardBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  cardBadgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  cardDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 15 },
  deviceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  deviceName: { color: 'white', fontSize: 15, fontWeight: 'bold', flex: 1, marginRight: 10 },
  typeTag: { backgroundColor: '#2563eb', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  typeTagText: { color: 'white', fontSize: 11, fontWeight: 'bold' },
  cardBottom: { padding: 20 },
  infoGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  infoLabel: { fontSize: 10, fontWeight: 'bold', color: '#9ca3af', marginBottom: 5 },
  iconRow: { flexDirection: 'row', alignItems: 'center' },
  infoValue: { fontSize: 13, fontWeight: 'bold', color: '#374151', marginLeft: 5 },
  noteSection: { paddingTop: 10 },
  noteLabel: { fontSize: 10, fontWeight: 'bold', color: '#9ca3af', marginBottom: 8, fontStyle: 'italic' },
  noteInput: { backgroundColor: '#fffbeb', borderBottomWidth: 1, borderBottomColor: '#fde68a', borderRadius: 12, padding: 12, fontSize: 14, minHeight: 80, textAlignVertical: 'top', color: '#111827' },
  submitBtn: { backgroundColor: '#2563eb', flexDirection: 'row', height: 60, borderRadius: 16, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  submitBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
  footerInfo: { textAlign: 'center', fontSize: 10, color: '#9ca3af', fontWeight: '600', marginTop: 15, paddingHorizontal: 20 },
  successContainer: { flex: 1, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', padding: 30 },
  successIconBox: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#f0fdf4', justifyContent: 'center', alignItems: 'center', marginBottom: 30, borderWidth: 2, borderColor: '#dcfce7' },
  successTitle: { fontSize: 24, fontWeight: '900', color: '#111827', fontStyle: 'italic' },
  successSub: { textAlign: 'center', color: '#9ca3af', marginTop: 10, marginBottom: 40, fontSize: 14 },
  reqNoCard: { backgroundColor: '#f9fafb', width: '100%', padding: 25, borderRadius: 24, alignItems: 'center', marginBottom: 40, borderWidth: 1, borderColor: '#f3f4f6' },
  reqNoLabel: { fontSize: 10, color: '#2563eb', fontWeight: 'bold', letterSpacing: 2, marginBottom: 10 },
  reqNoValue: { fontSize: 36, fontWeight: '900', color: '#1e3a8a', letterSpacing: 2 },
  homeBtn: { backgroundColor: '#2563eb', width: '100%', height: 60, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  homeBtnText: { color: 'white', fontWeight: 'bold', letterSpacing: 1 }
});