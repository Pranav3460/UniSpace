import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ScrollView, ActivityIndicator, useWindowDimensions, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
let COLLEGE_IMG: any;
try { COLLEGE_IMG = require('../../assets/krmu pic.jpg'); } catch (e) { COLLEGE_IMG = undefined; }
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../api/client';

const DESIGNATIONS = ['Student', 'Teacher'];
const SCHOOLS = [
  'SOET',
  'SOMC',
  'SMAS',
  'SLAS',
  'SOAD'
];

export default function SignupScreen({ navigation }: any) {
  const { signup } = useAuth() as any;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [designation, setDesignation] = useState('');
  const [school, setSchool] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  async function pickImage() {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please grant permission to access your photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  }

  async function uploadPhoto(uri: string): Promise<string | null> {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append('file', blob as any, 'profile.jpg');

      const uploadResponse = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (uploadResponse.ok) {
        const data = await uploadResponse.json();
        return data.url;
      }
      return null;
    } catch (error) {
      console.error('Photo upload failed', error);
      return null;
    }
  }

  async function doSignup() {
    if (!email || !password) {
      return Alert.alert('Missing Fields', 'Please provide email and password');
    }
    if (!name || !phone || !designation || !school) {
      return Alert.alert('Missing Fields', 'Please fill in all required fields');
    }

    setUploading(true);
    try {
      let photoUrl: string | undefined = undefined;

      // Upload photo if selected
      if (photoUri) {
        photoUrl = await uploadPhoto(photoUri) || undefined;
      }
      // Create account with all profile data
      const role = designation.toLowerCase(); // 'student' or 'teacher'
      const ok = await signup(email, password, {
        name,
        phone,
        designation,
        school,
        photoUrl,
        role,
      });

      setUploading(false);

      if (!ok) {
        return Alert.alert('Error', 'Account already exists or server error');
      }

      if (designation === 'Teacher') {
        Alert.alert('Signup successful!', 'Please wait for admin approval.');
      }
      // If student, auto-login happens via Firebase auth state change
    } catch (error) {
      setUploading(false);
      Alert.alert('Error', 'Failed to create account');
    }
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
          {COLLEGE_IMG && <Image source={COLLEGE_IMG} style={[styles.hero, isDesktop && styles.heroDesktop]} resizeMode="cover" />}
          <Text style={styles.title}>Sign up</Text>

          {/* Photo Upload */}
          <TouchableOpacity style={styles.photoContainer} onPress={pickImage}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.photoPreview} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoText}>Tap to add photo</Text>
              </View>
            )}
          </TouchableOpacity>

          <TextInput
            placeholder="Full Name *"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
          <TextInput
            placeholder="Email *"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            placeholder="Phone Number *"
            value={phone}
            onChangeText={setPhone}
            style={styles.input}
            keyboardType="phone-pad"
          />

          {/* Designation Dropdown */}
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Designation *</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={designation}
                onValueChange={(itemValue: string) => setDesignation(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Select Designation" value="" />
                {DESIGNATIONS.map((des) => (
                  <Picker.Item key={des} label={des} value={des} />
                ))}
              </Picker>
            </View>
          </View>

          {/* School/Department Dropdown */}
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>School/Department *</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={school}
                onValueChange={(itemValue: string) => setSchool(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Select School/Department" value="" />
                {SCHOOLS.map((sch) => (
                  <Picker.Item key={sch} label={sch} value={sch} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Password with Toggle */}
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Password *"
              value={password}
              secureTextEntry={!showPassword}
              onChangeText={setPassword}
              style={styles.passwordInput}
              onSubmitEditing={doSignup}
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

          <TouchableOpacity
            style={[styles.btn, uploading && styles.btnDisabled]}
            onPress={doSignup}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: '#fff', fontWeight: '700' }}>Create account</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ marginTop: 12 }}>
            <Text style={styles.linkText}>Already have an account? Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f5f8ff',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  scrollContainerDesktop: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 32,
  },
  contentContainer: {
    width: '100%',
  },
  cardDesktop: {
    width: 500,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    ...Platform.select({
      web: {
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
      }
    })
  },
  hero: { width: '100%', height: 140, borderRadius: 12, marginBottom: 12 },
  heroDesktop: {
    height: 180,
    marginBottom: 24,
  },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 12 },
  photoContainer: { alignSelf: 'center', marginBottom: 16 },
  photoPreview: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: '#3b5bfd' },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e5e9f2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3b5bfd',
    borderStyle: 'dashed',
  },
  photoText: { color: '#3b5bfd', fontWeight: '600', textAlign: 'center', paddingHorizontal: 10 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e9f2'
  },
  pickerContainer: {
    marginBottom: 12,
  },
  pickerLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    marginLeft: 4,
    fontWeight: '600',
  },
  pickerWrapper: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e9f2',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e9f2',
    marginBottom: 12,
    paddingRight: 8,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  eyeButton: {
    padding: 8,
  },
  btn: {
    backgroundColor: '#3b5bfd',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  linkText: {
    color: '#3b5bfd',
    textAlign: 'center',
    fontWeight: '600',
  },
});
