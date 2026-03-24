import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function GetStartedScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome! 🎓</Text>
      <Text style={styles.body}>
        CampusConnect centralizes notices, lost & found, study groups, resources, and events in
        one app. Explore real-time updates, collaborate, and stay organized across campus.
      </Text>
      <TouchableOpacity style={styles.btn} onPress={() => navigation.replace('Main') }>
        <Text style={styles.btnText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f6fd', padding: 24, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '800', textAlign: 'center', marginBottom: 12 },
  body: { color: '#4e5874', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  btn: { backgroundColor: '#3b5bfd', borderRadius: 26, paddingVertical: 16, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700' },
});


