import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, SafeAreaView, 
  TextInput, Alert, ActivityIndicator, ScrollView, Platform, KeyboardAvoidingView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from './supabase';
import { useLanguage } from './src/context/LanguageContext';

export default function RemoveSummary({ equipment, customer, user, onBack, onComplete }) {
  const { t } = useLanguage();
  const [reason, setReason] = useState('');
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

  const handleSubmit = async () => {
    if (!reason.trim()) {
      // Alert hatası düzeltildi
      Alert.alert(t('common.error') || "Hata", t('remove.fill_reason') || "Lütfen sökme nedenini belirtiniz.");
      return;
    }

    setLoading(true);
    const requestId = generateRequestID('REM');
    const payload = {
      request_id: requestId,
      barcode_no: equipment.barcode,
      customer_code: customer.customer_code,
      equipment_number: equipment.equipment_number,
      material_description: equipment.material_description,
      reason_note: reason,
      user_code: String(user.user_code).toUpperCase(),
      status: 'PENDING',
      created_at: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase
        .from('remove_requests')
        .insert([payload])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        setSuccessData(requestId);
      }
    } catch (error) {
      Alert.alert(t('common.error') || "Hata", t('remove.submit_error') || "Sökme talebi iletilemedi.");
    } finally {
      setLoading(false);
    }
  };

  // --- BAŞARI EKRANI ---
  if (successData) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successIconBox}>
          <Ionicons name="trash-outline" size={60} color="#dc2626" />
        </View>
        <Text style={styles.successTitle}>{t('remove.success_title') || "SÖKME TALEBİ ALINDI"}</Text>
        <Text style={styles.successSub}>{t('remove.success_sub') || "Ekipman sökme işlemi sıraya alınmıştır."}</Text>
        
        <View style={styles.reqNoCard}>
          <Text style={styles.reqNoLabel}>{t('remove.reg_no_label') || "SÖKME KAYIT NO"}</Text>
          <Text style={styles.reqNoValue}>{successData}</Text>
        </View>

        <TouchableOpacity style={styles.homeBtn} onPress={onComplete}>
          <Text style={styles.homeBtnText}>{t('summary.my_customers') || "MÜŞTERİLERİME DÖN"}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>       
          <Text style={styles.headerTitle}>{t('remove.summary_title') || "SÖKME ÖZETİ"}</Text>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.summaryCard}>
            <View style={styles.cardTop}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.cardLabel}>{t('remove.point_label') || "SÖKÜLECEK NOKTA"}</Text>
                  <Text style={styles.cardCustomerName}>{customer?.name?.toUpperCase() || "---"}</Text>
                </View>
                <View style={styles.cardBadge}>
                  <Text style={styles.cardBadgeText}>{customer?.customer_code || "---"}</Text>
                </View>
              </View>

              <View style={styles.cardDivider} />

              <View>
                <Text style={styles.cardLabel}>{t('remove.device_label') || "SÖKÜLECEK CİHAZ"}</Text>
                <Text style={styles.deviceName}>{equipment?.material_description?.toUpperCase() || "---"}</Text>
                <Text style={styles.snText}>{t('inventory.barcode') || "Barkod"}: {equipment?.barcode}</Text>
              </View>
            </View>

            <View style={styles.cardBottom}>
              <View style={styles.noteSection}>
                <Text style={styles.noteLabel}>{t('remove.note_label') || "SÖKME NEDENİ"}</Text>
                <TextInput 
                  style={styles.noteInput}
                  placeholder={t('remove.note_placeholder') || "Cihaz neden sökülüyor?"}
                  multiline
                  numberOfLines={4}
                  value={reason}
                  onChangeText={setReason}
                />
              </View>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.submitBtn, loading && { opacity: 0.7 }]} 
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="white" /> : (
              <>
                <Text style={styles.submitBtnText}>{t('remove.submit_btn') || "SÖKMEYİ ONAYLA"}</Text>
                <Ionicons name="log-out-outline" size={18} color="white" style={{ marginLeft: 10 }} />
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#004a99', height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 },
  backButton: { padding: 5 },
  headerTitle: { color: 'white', fontSize: 17, fontWeight: 'bold', marginLeft: 10 },
  content: { padding: 16 },
  summaryCard: { backgroundColor: 'white', borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 20, elevation: 3 },
  cardTop: { backgroundColor: '#1e3a8a', padding: 20 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
  cardLabel: { fontSize: 10, fontWeight: 'bold', color: '#94a3b8', letterSpacing: 1, marginBottom: 4 },
  cardCustomerName: { fontSize: 16, fontWeight: 'bold', color: 'white', flex: 1, marginRight: 10 },
  cardBadge: { backgroundColor: 'rgba(220, 38, 38, 0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#dc2626' },
  cardBadgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  cardDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 15 },
  deviceName: { color: 'white', fontSize: 14, fontWeight: 'bold' },
  snText: { color: '#94a3b8', fontSize: 11, marginTop: 4 },
  cardBottom: { padding: 20 },
  noteSection: { paddingTop: 0 },
  noteLabel: { fontSize: 10, fontWeight: 'bold', color: '#64748b', marginBottom: 8 },
  noteInput: { backgroundColor: '#fef2f2', borderRadius: 12, padding: 12, fontSize: 14, minHeight: 100, textAlignVertical: 'top', color: '#111827', borderWidth: 1, borderColor: '#fee2e2' },
  submitBtn: { backgroundColor: '#1e3a8a', flexDirection: 'row', height: 60, borderRadius: 16, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  submitBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
  successContainer: { flex: 1, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', padding: 30 },
  successIconBox: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#fef2f2', justifyContent: 'center', alignItems: 'center', marginBottom: 30, borderWidth: 2, borderColor: '#fee2e2' },
  successTitle: { fontSize: 22, fontWeight: '900', color: '#111827' },
  successSub: { textAlign: 'center', color: '#64748b', marginTop: 10, marginBottom: 40, fontSize: 14 },
  reqNoCard: { backgroundColor: '#f8fafc', width: '100%', padding: 25, borderRadius: 24, alignItems: 'center', marginBottom: 40, borderWidth: 1, borderColor: '#e2e8f0' },
  reqNoLabel: { fontSize: 10, color: '#dc2626', fontWeight: 'bold', letterSpacing: 2, marginBottom: 10 },
  reqNoValue: { fontSize: 36, fontWeight: '900', color: '#1e293b', letterSpacing: 2 },
  homeBtn: { backgroundColor: '#1e293b', width: '100%', height: 60, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  homeBtnText: { color: 'white', fontWeight: 'bold', letterSpacing: 1 }
});