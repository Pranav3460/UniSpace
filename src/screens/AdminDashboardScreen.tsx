import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function AdminDashboardScreen({ navigation }: any) {
    const { signOut, userProfile } = useAuth();

    const menuItems = [
        {
            title: 'Pending Teacher Requests',
            icon: 'people-circle-outline',
            screen: 'AdminTeacherList',
            color: '#FF9800'
        },
        {
            title: 'Manage Notices',
            icon: 'newspaper-outline',
            screen: 'Notices', // We reuse Notices screen but with admin powers
            color: '#2196F3'
        },
        {
            title: 'Manage Study Groups',
            icon: 'library-outline',
            screen: 'StudyGroups', // We reuse StudyGroups screen but with admin powers
            color: '#4CAF50'
        },
    ];

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.welcome}>Welcome Admin</Text>
                    <Text style={styles.name}>{userProfile?.name || 'Administrator'}</Text>
                </View>
                <TouchableOpacity onPress={signOut} style={styles.logoutBtn}>
                    <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
                </TouchableOpacity>
            </View>

            <View style={styles.grid}>
                {menuItems.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.card}
                        onPress={() => navigation.navigate(item.screen)}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                            <Ionicons name={item.icon as any} size={32} color={item.color} />
                        </View>
                        <Text style={styles.cardTitle}>{item.title}</Text>
                        <Ionicons name="chevron-forward" size={20} color="#ccc" style={styles.arrow} />
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f8ff',
    },
    header: {
        padding: 24,
        backgroundColor: '#fff',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    welcome: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
    },
    name: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    logoutBtn: {
        padding: 8,
        backgroundColor: '#FFF0F0',
        borderRadius: 8,
    },
    grid: {
        padding: 16,
        gap: 16,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        flex: 1,
    },
    arrow: {
        marginLeft: 8,
    }
});
