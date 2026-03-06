import React, { useState } from 'react';
import { 
  StyleSheet, View, TextInput, TouchableOpacity, 
  ActivityIndicator, Alert, KeyboardAvoidingView, 
  Platform, Text 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// BAĞLANTILAR VE CONTEXT
import { supabase } from './supabase';
import { LanguageProvider, useLanguage } from './src/context/LanguageContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';

// EKRANLAR
import StDashboard from './StDashboard';
import TeknisyenDashboard from './TeknisyenDashboard';
import ActionSelection from './ActionSelection';
import JobTypeSelection from './JobTypeSelection';
import InventorySelection from './InventorySelection';
import InstallationSummary from './InstallationSummary';
import TechRequestDetail from './TechRequestDetail';
import VerificationEquipment from './VerificationEquipment';

// --- ANA GİRİŞ NOKTASI ---
export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider> 
        <MainApp />
      </AuthProvider>
    </LanguageProvider>
  );
}

// --- UYGULAMA İÇERİĞİ ---
function MainApp() {
  // 1. CONTEXTS
  const { selectedLang, setSelectedLang, t } = useLanguage();
  const { user, setUser, role, setRole } = useAuth();
  
  const languages = ['TR', 'EN', 'RU', 'RO'];

  // 2. LOCAL STATES
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  // 3. NAVIGATION STATES
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedJobType, setSelectedJobType] = useState(null);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // LOGIN MANTIĞI
  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert(t('auth.error'), t('auth.fillAll'));
      return;
    }

    setLoading(true);
    try {
      // Uppercase standardizasyonu
      const cleanUsername = username.trim().toUpperCase();
      const email = `${cleanUsername}@asset.net`;
      

      // 1. Supabase Auth ile giriş yap
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (authError) {
        Alert.alert(t('auth.error'), t('auth.invalid_login'));
        setLoading(false);
        return;
      }

      // 2. Profil bilgilerini getir
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError || !profileData) {
        Alert.alert("Profil Hatası", "Kullanıcı bulundu ama profil bilgileri eksik.");
        return;
      }

      // Context güncelleme
      setUser(profileData);
      setRole(profileData.role);

    } catch (err) {
      Alert.alert("Bağlantı Hatası", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setRole(null);
    setUser(null);
    setUsername('');
    setPassword('');
    setSelectedCustomer(null);
    setSelectedCategory(null);
    setSelectedJobType(null);
    setSelectedInventory(null);
    setSelectedRequest(null);
  };

  // --- RENDER LOGIC ---
  
  if (role === 'T') {
    if (selectedRequest) {
      return (
        <TechRequestDetail 
          request={selectedRequest}
          onBack={() => setSelectedRequest(null)}
          onComplete={() => setSelectedRequest(null)}
        />
      );
    }
    return <TeknisyenDashboard onLogout={handleLogout} onSelectRequest={setSelectedRequest} />;
  }

  if (role === 'ST') {
    if (selectedCategory?.id === 5 || selectedCategory?.id === 10  || selectedCategory?.id === 15 || selectedCategory?.id === 20) {
      return <VerificationEquipment customer={selectedCustomer} dealer={selectedCustomer.dealer_code} onBack={() => setSelectedCategory(null)} />;
    }

    if (selectedInventory) {
      return (
        <InstallationSummary
          customer={selectedCustomer}
          category={selectedCategory}
          jobType={selectedJobType}
          inventory={selectedInventory}
          user={user}
          onBack={() => setSelectedInventory(null)}
          onComplete={() => {
            setSelectedInventory(null);
            setSelectedJobType(null);
            setSelectedCategory(null);
            setSelectedCustomer(null);
          }}
        />
      );
    }

    if (selectedJobType) {
      return <InventorySelection customer={selectedCustomer} dealer={selectedCustomer.dealer_code} onBack={() => setSelectedJobType(null)} onSelectInventory={setSelectedInventory} />;
    }

    if (selectedCategory) {
      return <JobTypeSelection category={selectedCategory} onBack={() => setSelectedCategory(null)} onSelectJob={setSelectedJobType} />;
    }

    if (selectedCustomer) {
      return <ActionSelection customer={selectedCustomer} dealer={selectedCustomer.dealer_code} onBack={() => setSelectedCustomer(null)} onSelectCategory={setSelectedCategory} />;
    }

    return <StDashboard onLogout={handleLogout} onSelectCustomer={setSelectedCustomer} />;
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.blueBackground}>
        <View style={styles.langWrapper}>
          <TouchableOpacity style={styles.langButton} onPress={() => setShowLangMenu(!showLangMenu)}>
            <Text style={styles.langText}>{selectedLang}</Text>
          </TouchableOpacity>
          {showLangMenu && (
            <View style={styles.langMenu}>
              {languages.map((lang, index) => (
                <TouchableOpacity 
                  key={lang} 
                  style={[styles.langMenuItem, index === languages.length - 1 && { borderBottomWidth: 0 }]} 
                  onPress={() => { setSelectedLang(lang); setShowLangMenu(false); }}
                >
                  <Text style={styles.langMenuText}>{lang}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.whiteCard}>
          <View style={styles.logoCircle}><Text style={styles.logoText}>ASSET</Text></View>
          
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={18} color="#999" />
              <TextInput 
                style={styles.input} 
                placeholder={t('auth.username')} 
                value={username} 
                onChangeText={setUsername} 
                autoCapitalize="none" 
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={18} color="#999" />
              <TextInput 
                style={styles.input} 
                placeholder={t('auth.password')} 
                secureTextEntry={!showPassword} 
                value={password} 
                onChangeText={setPassword} 
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={18} color="#999" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
              {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>{t('auth.login')}</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.forgotPasswordContainer}>
              <Text style={styles.forgotPasswordText}>{t('auth.forgot')}</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.linkText}>{t('auth.agreement')}</Text>
              <Text style={styles.divider}>|</Text>
              <Text style={styles.linkText}>{t('auth.privacy')}</Text>
            </View>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  blueBackground: { flex: 1, backgroundColor: '#004a8d', justifyContent: 'center', alignItems: 'center', padding: 25 },
  whiteCard: { backgroundColor: 'white', width: '100%', borderRadius: 35, padding: 25, paddingTop: 60, alignItems: 'center', elevation: 8 },
  logoCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'white', position: 'absolute', top: -50, justifyContent: 'center', alignItems: 'center', elevation: 15, zIndex: 9999 },
  logoText: { color: '#004a8d', fontWeight: 'bold', fontSize: 20 },
  form: { width: '100%' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 25, paddingHorizontal: 15, height: 50, marginBottom: 15 },
  input: { flex: 1, marginLeft: 10, fontSize: 15, color: '#333' },
  button: { backgroundColor: '#3498db', height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  footer: { flexDirection: 'row', marginTop: 30, justifyContent: 'center', alignItems: 'center' },
  linkText: { color: '#3498db', fontSize: 12 },
  divider: { marginHorizontal: 8, color: '#eee' },
  forgotPasswordContainer: { marginTop: 15, alignItems: 'center' },
  forgotPasswordText: { color: '#3498db', fontSize: 14, textDecorationLine: 'underline' },
  langWrapper: { position: 'absolute', top: 50, right: 25, zIndex: 10000 },
  langButton: { backgroundColor: 'rgba(255,255,255,0.2)', width: 50, height: 35, justifyContent: 'center', alignItems: 'center', borderRadius: 12 },
  langText: { color: 'white', fontWeight: 'bold' },
  langMenu: { backgroundColor: 'white', borderRadius: 10, marginTop: 5, elevation: 10, minWidth: 60 },
  langMenuItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', alignItems: 'center' },
  langMenuText: { color: '#004a8d', fontWeight: 'bold' }
});