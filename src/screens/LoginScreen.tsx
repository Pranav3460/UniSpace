import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Switch, useWindowDimensions, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const HERO_DEFAULT = require('../../assets/splash-icon.png');
let COLLEGE_IMG: any;
try { COLLEGE_IMG = require('../../assets/krmu pic.jpg'); } catch (e) { COLLEGE_IMG = HERO_DEFAULT; }

export default function LoginScreen({ navigation }: any) {
  const { signInWithCredentials } = useAuth() as any;
  const { colors, isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const { width } = useWindowDimensions();

  const isDesktop = width > 768;

  async function onLogin() {
    const e = email.trim().toLowerCase();
    if (!e || !password) {
      alert('Enter email and password');
      return;
    }
    setLoading(true);
    const ok = await signInWithCredentials(e, password);
    setLoading(false);
    if (!ok) alert('Invalid credentials. Please try again or sign up.');
  }

  return (
    <KeyboardAvoidingView style={[styles.mainContainer, { backgroundColor: colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={[
        styles.scrollContainer,
        isDesktop && styles.scrollContainerDesktop
      ]} showsVerticalScrollIndicator={false}>
        
        <View style={[
          styles.contentContainer,
          isDesktop && styles.cardDesktop,
          isDesktop && { backgroundColor: colors.card, borderColor: colors.border }
        ]}>
          <Text style={styles.header}>Login to CampusConnect</Text>
          <View style={styles.heroWrap}>
            <Image
              source={COLLEGE_IMG}
              style={[styles.hero, isDesktop && styles.heroDesktop]}
              resizeMode="cover"
            />
          </View>
          <Text style={styles.welcome}>Welcome to CampusConnect</Text>
          <TextInput
            placeholder="Email or Student ID"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Password"
              placeholderTextColor={colors.subText}
              value={password}
              onChangeText={setPassword}
              style={[styles.passwordInput, { color: colors.text }]}
              secureTextEntry={!showPassword}
              onSubmitEditing={onLogin}
              returnKeyType="go"
            />
            <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={22} color={colors.subText} />
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Switch value={remember} onValueChange={setRemember} trackColor={{ false: '#d1d5db', true: '#3b5bfd' }} thumbColor="#fff" style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }} />
              <Text style={[styles.muted, { color: colors.subText, marginLeft: 4 }]}>Remember me</Text>
            </View>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.link}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.loginBtn, loading && { opacity: 0.7 }]} 
            onPress={onLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>{loading ? 'Logging in...' : 'Login'}</Text>
          </TouchableOpacity>
          
          <Text style={[styles.signup, { color: colors.subText }]}>
            Don't have an account?{' '}
            <Text style={styles.link} onPress={() => navigation.navigate('Signup')}>Sign Up</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  scrollContainerDesktop: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  contentContainer: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  cardDesktop: {
    borderRadius: 24,
    padding: 40,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  header: { textAlign: 'center', fontSize: 20, fontWeight: '700', marginBottom: 20 },
  heroWrap: { alignItems: 'center', marginBottom: 20 },
  hero: { width: '100%', height: 160, borderRadius: 20 },
  heroDesktop: { height: 200 },
  welcome: { fontSize: 26, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  subtitle: { textAlign: 'center', fontSize: 15, marginBottom: 28 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    marginBottom: 16,
    height: 56,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16 },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingLeft: 16,
    paddingRight: 8,
    marginBottom: 16,
    height: 56,
  },
  passwordInput: { flex: 1, fontSize: 16 },
  eyeButton: { padding: 8 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  muted: { fontSize: 14 },
  link: { color: '#3b5bfd', fontWeight: '700', fontSize: 14 },
  loginBtn: { 
    backgroundColor: '#3b5bfd', 
    alignItems: 'center', 
    justifyContent: 'center',
    paddingVertical: 16, 
    borderRadius: 16,
    shadowColor: '#3b5bfd',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  signup: { textAlign: 'center', marginTop: 24, fontSize: 15 },
});
