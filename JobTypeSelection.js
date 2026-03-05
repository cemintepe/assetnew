import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from './src/context/LanguageContext';
// Local DB bağlantısı
import { getJobTypesByCategoryId } from './Database';

export default function JobTypeSelection({ category, onBack, onSelectJob }) {
  const { t } = useLanguage();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobTypesFromLocal();
  }, [category.id]);

  const loadJobTypesFromLocal = async () => {
    try {
      setLoading(true);
      // Veriyi yerel veritabanından çekiyoruz
      const localData = await getJobTypesByCategoryId(category.id);
      
      console.log(`📊 Category ID: ${category.id} için ${localData.length} iş tipi bulundu.`);
      setJobs(localData);
    } catch (error) {
      Alert.alert(t('common.error'), t('job_selection.load_error'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('job_selection.title')}</Text> 
      </View>

      {/* SEÇİLİ KATEGORİ BİLGİSİ */}
      <View style={styles.categoryInfo}>
        <Text style={styles.infoLabel}>{t('job_selection.selected_category')}</Text>
        <Text style={styles.categoryName}>{category.name.toUpperCase()}</Text>
      </View>

      <View style={styles.listTitleContainer}>
        <Text style={styles.listTitle}>{t('job_selection.list_title')}</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#004a99" style={{ marginTop: 50 }} />
      ) : (
        <View style={styles.jobList}>
          {jobs.map((job) => (
            <TouchableOpacity 
              key={job.id}
              style={[styles.jobItem, job.is_active === 0 && styles.inactiveItem]}
              onPress={() => 
                job.is_active === 1 
                  ? onSelectJob(job) 
                  : Alert.alert(
                      t('common.info'), 
                      `${job.name.toUpperCase()} ${t('job_selection.inactive_msg')}`
                    )
              }
            >
              <View style={styles.jobLeft}>
                {/* İkon Kutusu */}
                <View style={[styles.iconBox, { backgroundColor: job.is_active === 1 ? '#f0fdf4' : '#f3f4f6' }]}>
                  <Ionicons name={job.icon_name} size={24} color={job.color_code} />
                </View>
                
                <View>
                  <Text style={[styles.jobName, job.is_active === 0 && styles.inactiveText]}>
                    {job.name.toUpperCase()}
                  </Text>
                  <Text style={styles.jobSub}>{job.sub_text.toUpperCase()}</Text>
                </View>
              </View>
              
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={job.is_active === 1 ? "#004a99" : "#ccc"} 
              />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: { backgroundColor: '#004a99', height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 },
  backButton: { padding: 5 },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
  categoryInfo: { backgroundColor: '#f3f4f6', padding: 15, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  infoLabel: { fontSize: 10, fontWeight: 'bold', color: '#9ca3af', letterSpacing: 1 },
  categoryName: { fontSize: 13, fontWeight: 'bold', color: '#1e3a8a', fontStyle: 'italic', marginTop: 2 },
  listTitleContainer: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  listTitle: { fontSize: 11, fontWeight: 'bold', color: '#9ca3af', letterSpacing: 1.5 },
  jobItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  jobLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  jobName: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  jobSub: { fontSize: 10, color: '#9ca3af', fontWeight: '600', marginTop: 2 },
  inactiveItem: { backgroundColor: '#fafafa' },
  inactiveText: { color: '#9ca3af' }
});