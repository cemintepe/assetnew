import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, SafeAreaView, 
  TextInput, Alert, ActivityIndicator, ScrollView, Platform, KeyboardAvoidingView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from './supabase';
import { useLanguage } from './src/context/LanguageContext';

export default function RepairSummary({ equipment, customer, user, onBack, onComplete }) {
  const { t } = useLanguage();
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const handleSubmit = async () => {
    if (!note.trim()) {
      Alert.alert(t('auth.error') || "Hata", t('repair.fill_note') || "Lütfen arıza detayını belirtiniz.");
      return;
    }

    setLoading(true);
    
    const payload = {
      barcode_no: equipment.barcode,
      customer_code: customer.customer_code,
      equipment_number: equipment.equipment_number,
      material_description: equipment.material_description,
      issue_note: note,
      user_code: user.user_code,
      status: 'PENDING',
      created_at: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase
        .from('repair_requests')
        .insert([payload])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        const displayId = data[0].id.toString().split('-')[0].toUpperCase();
        setSuccessData(displayId);
      } else {
        setSuccessData("SUCCESS");
      }

    } catch (error) {
      console.error("Hata:", error);
      Alert.alert(t('auth.error'), t('repair.submit_error') || "Talebiniz iletilemedi.");
    } finally {
      setLoading(false);
    }
  };

  if (successData) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successIconBox}>
          <Ionicons name="alert-circle-outline" size={60} color="#c2410c" />
        </View>
        <Text style={styles.successTitle}>{t('repair.success_title') || "TALEP ALINDI"}</Text>
        <Text style={styles.successSub}>{t('repair.success_sub') || "Arıza bildiriminiz teknik ekibe iletilmiştir."}</Text>
        
        <View style={styles.reqNoCard}>
          <Text style={styles.reqNoLabel}>{t('repair.reg_no_label') || "ARIZA KAYIT NO"}</Text>
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
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('repair.summary_title') || "ARIZA ÖZETİ"}</Text>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.summaryCard}>
            <View style={styles.cardTop}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.cardLabel}>{t('repair.point_label') || "ARIZA NOKTASI"}</Text>
                  <Text style={styles.cardCustomerName}>{customer?.name?.toUpperCase() || "---"}</Text>
                </View>
                <View style={styles.cardBadge}>
                  <Text style={styles.cardBadgeText}>{customer?.customer_code || "---"}</Text>
                </View>
              </View>

              <View style={styles.cardDivider} />

              <View>
                <Text style={styles.cardLabel}>{t('repair.device_label') || "ARIZALI CİHAZ"}</Text>
                <View style={styles.deviceRow}>
                  <Text style={styles.deviceName}>{equipment?.material_description?.toUpperCase() || "---"}</Text>
                </View>
                <Text style={styles.snText}>{t('inventory.barcode')}: {equipment?.barcode}</Text>
              </View>
            </View>

            <View style={styles.cardBottom}>
              <View style={styles.noteSection}>
                <Text style={styles.noteLabel}>{t('repair.note_label') || "ARIZA NOTU VE DETAYLAR"}</Text>
                <TextInput 
                  style={styles.noteInput}
                  placeholder={t('repair.note_placeholder') || "Arızayı tarif ediniz..."}
                  multiline
                  numberOfLines={4}
                  value={note}
                  onChangeText={setNote}
                />
              </View>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.submitBtn, loading && { opacity: 0.7 }]} 
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text style={styles.submitBtnText}>{t('repair.submit_btn') || "ARIZAYI BİLDİR"}</Text>
                <Ionicons name="send" size={18} color="white" style={{ marginLeft: 10 }} />
              </>
            )}
          </TouchableOpacity>
          
          <Text style={styles.footerInfo}>{t('repair.footer_info') || "Talep teknisyene iletilecektir."}</Text>
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
  cardBadge: { backgroundColor: 'rgba(194, 65, 12, 0.3)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#c2410c' },
  cardBadgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  cardDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 15 },
  deviceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  deviceName: { color: 'white', fontSize: 14, fontWeight: 'bold', flex: 1 },
  snText: { color: '#94a3b8', fontSize: 11, marginTop: 4 },
  cardBottom: { padding: 20 },
  noteSection: { paddingTop: 0 },
  noteLabel: { fontSize: 10, fontWeight: 'bold', color: '#64748b', marginBottom: 8 },
  noteInput: { backgroundColor: '#fff7ed', borderRadius: 12, padding: 12, fontSize: 14, minHeight: 100, textAlignVertical: 'top', color: '#111827', borderWidth: 1, borderColor: '#ffedd5' },
  submitBtn: { backgroundColor: '#2563eb', flexDirection: 'row', height: 60, borderRadius: 16, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  submitBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
  footerInfo: { textAlign: 'center', fontSize: 11, color: '#94a3b8', marginTop: 15, paddingHorizontal: 20 },
  
  // Success Styles
  successContainer: { flex: 1, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', padding: 30 },
  successIconBox: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#fff7ed', justifyContent: 'center', alignItems: 'center', marginBottom: 30, borderWidth: 2, borderColor: '#ffedd5' },
  successTitle: { fontSize: 24, fontWeight: '900', color: '#111827' },
  successSub: { textAlign: 'center', color: '#64748b', marginTop: 10, marginBottom: 40, fontSize: 14 },
  reqNoCard: { backgroundColor: '#f8fafc', width: '100%', padding: 25, borderRadius: 24, alignItems: 'center', marginBottom: 40, borderWidth: 1, borderColor: '#e2e8f0' },
  reqNoLabel: { fontSize: 10, color: '#c2410c', fontWeight: 'bold', letterSpacing: 2, marginBottom: 10 },
  reqNoValue: { fontSize: 36, fontWeight: '900', color: '#0f172a', letterSpacing: 2 },
  homeBtn: { backgroundColor: '#2563eb', width: '100%', height: 60, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  homeBtnText: { color: 'white', fontWeight: 'bold', letterSpacing: 1 }
});