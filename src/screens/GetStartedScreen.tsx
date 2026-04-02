import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function GetStartedScreen({ navigation }: any) {
  const { colors, isDark } = useTheme();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // Scale the icon circle to fit smaller screens
  const circleSize = Math.min(width * 0.45, 200);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Top section — icon */}
      <View style={styles.topSection}>
        <View style={[styles.imageContainer, { width: circleSize, height: circleSize, borderRadius: circleSize / 2 }]}>
          <Ionicons name="school" size={circleSize * 0.45} color="#3b5bfd" />
        </View>
      </View>

      {/* Middle section — text */}
      <View style={styles.midSection}>
        <Text style={[styles.title, { color: colors.text }]}>Welcome! 🎓</Text>
        <Text style={[styles.body, { color: colors.subText }]}>
          UniSpace centralizes notices, lost & found, study groups, resources, and events in one app.
        </Text>
      </View>

      {/* Bottom section — button */}
      <View style={styles.bottomSection}>
        <TouchableOpacity 
          style={styles.btn} 
          onPress={() => navigation.replace('Login')}
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
  container: { flex: 1, paddingHorizontal: 32 },
  topSection: {
    flex: 3,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 24,
  },
  imageContainer: {
    backgroundColor: 'rgba(59, 91, 253, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  midSection: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { fontSize: 30, fontWeight: '800', textAlign: 'center', marginBottom: 12 },
  body: { textAlign: 'center', lineHeight: 22, fontSize: 15, paddingHorizontal: 8 },
  bottomSection: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btn: { 
    backgroundColor: '#3b5bfd', 
    borderRadius: 30, 
    flexDirection: 'row',
    paddingVertical: 16, 
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
