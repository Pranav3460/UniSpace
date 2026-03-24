import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Image, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '../api/client';
import { useTheme } from '../context/ThemeContext';

export default function SettingsScreen() {
  const { email, userProfile, signOut } = useAuth();
  const navigation = useNavigation() as any;
  const { isDark, toggleTheme, colors } = useTheme();
  const [notify, setNotify] = useState(true);

  // Password Change State
  const [pwdModalVisible, setPwdModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const n = await AsyncStorage.getItem('settings_notify');
      if (n !== null) setNotify(n === 'true');
    } catch (e) {
      console.error('Failed to load settings', e);
    }
  };

  const toggleNotify = async (val: boolean) => {
    setNotify(val);
    await AsyncStorage.setItem('settings_notify', String(val));
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert('Success', 'Password changed successfully');
        setPwdModalVisible(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        Alert.alert('Error', data.error || 'Failed to change password');
      }
    } catch (e) {
      Alert.alert('Error', 'Network error');
    } finally {
      setLoading(false);
    }
  };

  // Dynamic Styles
  const dynamicStyles = {
    container: { backgroundColor: colors.background },
    title: { color: colors.text },
    card: { backgroundColor: colors.card, borderColor: colors.border },
    text: { color: colors.text },
    subText: { color: colors.subText },
    rowLabel: { color: colors.text },
    input: { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border },
    modalContent: { backgroundColor: colors.card },
  };

  return (
    <ScrollView style={[styles.container, dynamicStyles.container]}>
      <Text style={[styles.title, dynamicStyles.title]}>Settings</Text>

      {/* Profile Card */}
      <View style={[styles.profileCard, dynamicStyles.card]}>
        {userProfile?.photoUrl ? (
          <Image source={{ uri: userProfile.photoUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, { justifyContent: 'center', alignItems: 'center' }]}>
            <Ionicons name="person" size={32} color="#3b5bfd" />
          </View>
        )}
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={[styles.name, dynamicStyles.text]}>{userProfile?.name || email || 'Guest User'}</Text>
          <Text style={[styles.sub, dynamicStyles.subText]}>
            {userProfile?.designation || 'Member'} • {userProfile?.school || 'CampusConnect'}
          </Text>
          {userProfile?.phone && (
            <Text style={[styles.phone, dynamicStyles.subText]}>{userProfile.phone}</Text>
          )}
        </View>
        <TouchableOpacity style={[styles.editBtn, { backgroundColor: isDark ? '#374151' : '#eaf0ff' }]} onPress={() => navigation.navigate('ProfileEdit')}>
          <Text style={{ color: '#3b5bfd', fontWeight: '700' }}>Edit</Text>
        </TouchableOpacity>
      </View>

      {/* Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={[styles.row, dynamicStyles.card]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name={isDark ? "sunny-outline" : "moon-outline"} size={22} color="#3b5bfd" style={{ marginRight: 12 }} />
            <Text style={[styles.rowLabel, dynamicStyles.rowLabel]}>{isDark ? "Bright Mode" : "Dark Mode"}</Text>
          </View>
          <Switch value={isDark} onValueChange={toggleTheme} trackColor={{ false: '#d1d5db', true: '#3b5bfd' }} thumbColor="#fff" />
        </View>
        <View style={[styles.row, dynamicStyles.card]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="notifications-outline" size={22} color="#3b5bfd" style={{ marginRight: 12 }} />
            <Text style={[styles.rowLabel, dynamicStyles.rowLabel]}>Notifications</Text>
          </View>
          <Switch value={notify} onValueChange={toggleNotify} trackColor={{ false: '#d1d5db', true: '#3b5bfd' }} thumbColor="#fff" />
        </View>
      </View>

      {/* Account */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity style={[styles.row, dynamicStyles.card]} onPress={() => navigation.navigate('ProfileEdit')}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="person-circle-outline" size={22} color="#3b5bfd" style={{ marginRight: 12 }} />
            <Text style={[styles.rowLabel, dynamicStyles.rowLabel]}>Manage Account</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.subText} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.row, dynamicStyles.card]} onPress={() => setPwdModalVisible(true)}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="lock-closed-outline" size={22} color="#3b5bfd" style={{ marginRight: 12 }} />
            <Text style={[styles.rowLabel, dynamicStyles.rowLabel]}>Change Password</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.subText} />
        </TouchableOpacity>
      </View>

      {/* Support */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <TouchableOpacity style={[styles.row, dynamicStyles.card]} onPress={() => Alert.alert('Help Center', 'Coming soon!')}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="help-circle-outline" size={22} color="#3b5bfd" style={{ marginRight: 12 }} />
            <Text style={[styles.rowLabel, dynamicStyles.rowLabel]}>Help Center</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.subText} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.row, dynamicStyles.card]} onPress={() => Alert.alert('Privacy Policy', 'Your data is safe with us.')}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="shield-checkmark-outline" size={22} color="#3b5bfd" style={{ marginRight: 12 }} />
            <Text style={[styles.rowLabel, dynamicStyles.rowLabel]}>Privacy Policy</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.subText} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[styles.logout, { backgroundColor: isDark ? '#7f1d1d' : '#fee2e2', borderColor: isDark ? '#991b1b' : '#fecaca' }]} onPress={() => { signOut(); navigation.replace('Login'); }}>
        <Text style={{ color: '#ef4444', fontWeight: '800' }}>Logout</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />

      {/* Change Password Modal */}
      <Modal visible={pwdModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, dynamicStyles.modalContent]}>
            <Text style={[styles.modalTitle, dynamicStyles.title]}>Change Password</Text>

            <Text style={[styles.label, dynamicStyles.text]}>Current Password</Text>
            <TextInput
              style={[styles.input, dynamicStyles.input]}
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Enter current password"
              placeholderTextColor="#6b7280"
            />

            <Text style={[styles.label, dynamicStyles.text]}>New Password</Text>
            <TextInput
              style={[styles.input, dynamicStyles.input]}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter new password"
              placeholderTextColor="#6b7280"
            />

            <Text style={[styles.label, dynamicStyles.text]}>Confirm New Password</Text>
            <TextInput
              style={[styles.input, dynamicStyles.input]}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm new password"
              placeholderTextColor="#6b7280"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.cancelBtn, { backgroundColor: isDark ? '#374151' : '#f3f4f6' }]} onPress={() => setPwdModalVisible(false)}>
                <Text style={[styles.cancelBtnText, dynamicStyles.text]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleChangePassword} disabled={loading}>
                <Text style={styles.saveBtnText}>{loading ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 16, marginTop: 10 },
  profileCard: {
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#e0e7ff' },
  name: { fontWeight: '700', fontSize: 18 },
  sub: { fontSize: 14, marginTop: 2 },
  phone: { fontSize: 12, marginTop: 2 },
  editBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  section: { marginBottom: 24 },
  sectionTitle: { color: '#6b7280', marginBottom: 12, fontWeight: '700', fontSize: 14, textTransform: 'uppercase', letterSpacing: 1, marginLeft: 8 },
  row: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  rowLabel: { fontWeight: '600', fontSize: 16 },
  logout: {
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
  },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 10 },
  modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 20, textAlign: 'center' },
  label: { marginBottom: 8, fontSize: 14, fontWeight: '600' },
  input: { borderRadius: 12, padding: 14, marginBottom: 16, fontSize: 16, borderWidth: 1 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 12, marginRight: 8, alignItems: 'center' },
  cancelBtnText: { fontWeight: '600' },
  saveBtn: { flex: 1, padding: 14, backgroundColor: '#3b5bfd', borderRadius: 12, marginLeft: 8, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '600' },
});
