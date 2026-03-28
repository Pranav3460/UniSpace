import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Switch, useWindowDimensions, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const HERO_DEFAULT = require('../../assets/splash-icon.png');
// College image (saved as 'krmu pic.jpg' in assets)
let COLLEGE_IMG: any;
try { COLLEGE_IMG = require('../../assets/krmu pic.jpg'); } catch (e) { COLLEGE_IMG = HERO_DEFAULT; }

import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }: any) {
  const { signInWithCredentials } = useAuth() as any;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const { width } = useWindowDimensions();

  const isDesktop = width > 768;

  async function onLogin() {
    const e = email.trim().toLowerCase();
    if (!e || !password) {
      alert('Enter email and password');
      return;
    }
    const ok = await signInWithCredentials(e, password);
    if (!ok) alert('Invalid credentials. Please try again or sign up.');
    // If ok, AuthContext updates state -> App.tsx re-renders -> MainStack appears automatically.
    // No need to manually navigate or replace.
  }

  return (
    <View style={styles.mainContainer}>
      <ScrollView contentContainerStyle={[
        styles.scrollContainer,
        isDesktop && styles.scrollContainerDesktop
      ]}>
        <View style={[
          styles.contentContainer,
          isDesktop && styles.cardDesktop
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
              value={password}
              onChangeText={setPassword}
              style={styles.passwordInput}
              secureTextEntry={!showPassword}
              onSubmitEditing={onLogin}
              returnKeyType="go"
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={24}
                color="#666"
              />
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <Text style={styles.muted}>Remember me</Text>
            <Switch value={remember} onValueChange={setRemember} />
            <View style={{ flex: 1 }} />
            <TouchableOpacity>
              <Text style={styles.link}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.loginBtn} onPress={onLogin}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>Login</Text>
          </TouchableOpacity>
          <Text style={styles.signup}>Don't have an account? <Text style={styles.link} onPress={() => navigation.navigate('Signup')}>Sign Up</Text></Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f3f6fd',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },
  scrollContainerDesktop: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 0,
  },
  contentContainer: {
    width: '100%',
  },
  cardDesktop: {
    width: 480,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10, // for Android
    // Web-specific shadow if needed
    ...Platform.select({
      web: {
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
      }
    })
  },
  header: { textAlign: 'center', fontSize: 22, fontWeight: '700', marginBottom: 12 },
  heroWrap: { alignItems: 'center', marginBottom: 12 },
  hero: { width: '100%', height: 140, borderRadius: 18 },
  heroDesktop: {
    height: 180,
  },
  welcome: { fontSize: 22, fontWeight: '800', textAlign: 'center', marginVertical: 12 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    borderColor: '#e8ecf4',
    borderWidth: 1,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#e8ecf4',
    marginBottom: 12,
    paddingRight: 8,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  eyeButton: {
    padding: 8,
  },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  muted: { color: '#6b7280', marginRight: 8 },
  link: { color: '#3b5bfd', fontWeight: '600' },
  loginBtn: { backgroundColor: '#3b5bfd', alignItems: 'center', paddingVertical: 16, borderRadius: 26, marginTop: 4 },
  signup: { textAlign: 'center', marginTop: 16, color: '#6b7280' },
});
