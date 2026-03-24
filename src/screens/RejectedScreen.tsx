import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function RejectedScreen() {
    const { signOut } = useAuth();
    const { colors } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.card}>
                <Ionicons name="close-circle-outline" size={80} color="#ef4444" style={{ marginBottom: 20 }} />
                <Text style={[styles.title, { color: colors.text }]}>Account Rejected</Text>
                <Text style={[styles.message, { color: colors.subText }]}>
                    Your account request has been rejected by the administrators.
                    You cannot access this application.
                </Text>

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
    logoutBtn: {
        backgroundColor: '#ef4444',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
    },
    logoutBtnText: {
        color: '#fff',
        fontWeight: '600',
    },
});
