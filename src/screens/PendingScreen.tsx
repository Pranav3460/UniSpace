import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function PendingScreen() {
    const { signOut, refreshProfile, userProfile } = useAuth();
    const { isDark, colors } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.card}>
                <Ionicons name="time-outline" size={80} color="#f59e0b" style={{ marginBottom: 20 }} />
                <Text style={[styles.title, { color: colors.text }]}>Approval Pending</Text>
                <Text style={[styles.message, { color: colors.subText }]}>
                    Your teacher account request has been sent to the administrators.
                    Please wait for approval before accessing the platform.
                </Text>

                <View style={styles.infoBox}>
                    <Text style={styles.infoText}>Name: <Text style={styles.bold}>{userProfile?.name}</Text></Text>
                    <Text style={styles.infoText}>Email: <Text style={styles.bold}>{userProfile?.email}</Text></Text>
                    <Text style={styles.infoText}>Role: <Text style={styles.bold}>{userProfile?.role}</Text></Text>
                </View>

                <TouchableOpacity style={styles.checkBtn} onPress={refreshProfile}>
                    <Text style={styles.checkBtnText}>Check Status</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.logoutBtn} onPress={signOut}>
                    <Text style={styles.logoutBtnText}>Logout</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 30,
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 10,
    },
    message: {
        textAlign: 'center',
        marginBottom: 24,
        fontSize: 16,
        lineHeight: 24,
    },
    infoBox: {
        width: '100%',
        backgroundColor: '#f3f4f6',
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
    },
    infoText: {
        color: '#4b5563',
        marginBottom: 4,
    },
    bold: {
        fontWeight: '700',
        color: '#1f2937',
    },
    checkBtn: {
        backgroundColor: '#f59e0b',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        marginBottom: 12,
        width: '100%',
        alignItems: 'center',
    },
    checkBtnText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
    },
    logoutBtn: {
        paddingVertical: 12,
        width: '100%',
        alignItems: 'center',
    },
    logoutBtnText: {
        color: '#ef4444',
        fontWeight: '600',
    },
});
