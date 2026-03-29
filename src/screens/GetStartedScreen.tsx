import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function GetStartedScreen({ navigation }: any) {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <Ionicons name="school" size={120} color="#3b5bfd" />
        </View>

        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: colors.text }]}>Welcome! 🎓</Text>
          <Text style={[styles.body, { color: colors.subText }]}>
            CampusConnect centralizes notices, lost & found, study groups, resources, and events in one app.
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.btn} 
          onPress={() => navigation.replace('Main')}
          activeOpacity={0.8}
        >
          <Text style={styles.btnText}>Get Started</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: (width * 0.6) / 2,
    backgroundColor: 'rgba(59, 91, 253, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 48,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: { fontSize: 32, fontWeight: '800', textAlign: 'center', marginBottom: 16 },
  body: { textAlign: 'center', lineHeight: 24, fontSize: 16 },
  btn: { 
    backgroundColor: '#3b5bfd', 
    borderRadius: 30, 
    flexDirection: 'row',
    paddingVertical: 18, 
    paddingHorizontal: 32,
    alignItems: 'center',
    shadowColor: '#3b5bfd',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 18 },
});
