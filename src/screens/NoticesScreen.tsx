import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../api/client';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';

type Notice = {
  _id: string;
  id?: string;
  title: string;
  department?: string;
  year?: string;
  type?: string;
  content?: string;
  createdAt?: string;
};

export default function NoticesScreen() {
  const { email, userProfile } = useAuth();
  const { colors, isDark } = useTheme();
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<Notice[]>([]);
  const [modal, setModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  // New State for Dropdowns
  const [targetAudience, setTargetAudience] = useState('All');
  const [targetYear, setTargetYear] = useState('All Years');
  const [noticeType, setNoticeType] = useState('General');

  const { socket } = useSocket();

  useFocusEffect(
    React.useCallback(() => {
      fetchNotices();
    }, [])
  );

  useEffect(() => {
    if (!socket) return;

    socket.on('notice:create', (newNotice: Notice) => {
      setItems((prev) => [newNotice, ...prev]);
    });

    socket.on('notice:delete', (deletedId: string) => {
      setItems((prev) => prev.filter((item) => (item._id || item.id) !== deletedId));
    });

    return () => {
      socket.off('notice:create');
      socket.off('notice:delete');
    };
  }, [socket]);

  async function fetchNotices() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notices`);
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (e) {
      console.error('Failed to fetch notices', e);
    }
  }

  async function createNotice() {
    if (!newTitle) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/notices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          content: newContent,
          department: targetAudience === 'All' ? 'All' : targetAudience,
          type: noticeType,
          year: targetYear,
          createdByEmail: email,
        }),
      });

      if (response.ok) {
        setModal(false);
        setNewTitle('');
        setNewContent('');
        // Reset defaults
        setTargetAudience('All');
        setTargetYear('All Years');
        setNoticeType('General');
        fetchNotices();
      }
    } catch (e) {
      console.error('Failed to create notice', e);
    }
  }

  async function handleDelete(id: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notices/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setItems((prev) => prev.filter((item) => (item._id || item.id) !== id));
      }
    } catch (e) {
      console.error('Failed to delete notice', e);
    }
  }

  const filteredItems = useMemo(() => {
    if (!search) return items;
    const needle = search.toLowerCase();
    return items.filter((notice) =>
      [notice.title, notice.content, notice.department, notice.type]
        .filter(Boolean)
        .some((field) => (field || '').toLowerCase().includes(needle))
    );
  }, [items, search]);

  // Dynamic Styles
  const dynamicStyles = {
    container: { backgroundColor: colors.background },
    title: { color: colors.text },
    input: { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border },
    card: { backgroundColor: colors.card, borderColor: colors.border },
    cardTitle: { color: colors.text },
    cardBody: { color: colors.subText },
    cardMeta: { color: colors.subText },
    iconContainer: { backgroundColor: isDark ? '#1e293b' : '#eaf0ff' },
    empty: { color: colors.subText },
    modalCard: { backgroundColor: colors.card },
    label: { color: colors.text },
    dropdownBtn: { backgroundColor: colors.inputBg, borderColor: colors.border },
    dropdownBtnText: { color: colors.text },
    dropdownList: { backgroundColor: colors.card, borderColor: colors.border },
    dropdownItem: { borderBottomColor: colors.border },
    dropdownItemText: { color: colors.text },
  };

  // Custom Dropdown Component
  const Dropdown = ({ label, value, options, onSelect }: { label: string, value: string, options: string[], onSelect: (val: string) => void }) => {
    const [visible, setVisible] = useState(false);
    return (
      <View style={{ marginBottom: 16, zIndex: visible ? 1000 : 1 }}>
        <Text style={[styles.label, dynamicStyles.label]}>{label}</Text>
        <TouchableOpacity style={[styles.dropdownBtn, dynamicStyles.dropdownBtn]} onPress={() => setVisible(!visible)}>
          <Text style={[styles.dropdownBtnText, dynamicStyles.dropdownBtnText]}>{value}</Text>
          <Text style={{ color: '#3b5bfd' }}>▼</Text>
        </TouchableOpacity>
        {visible && (
          <View style={[styles.dropdownList, dynamicStyles.dropdownList]}>
            {options.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[styles.dropdownItem, dynamicStyles.dropdownItem]}
                onPress={() => {
                  onSelect(opt);
                  setVisible(false);
                }}
              >
                <Text style={[styles.dropdownItemText, dynamicStyles.dropdownItemText, value === opt && { color: '#3b5bfd', fontWeight: '700' }]}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <Text style={[styles.title, dynamicStyles.title]}>Notices</Text>
      <TextInput
        placeholder="Search notices, keywords, department..."
        placeholderTextColor={colors.subText}
        value={search}
        onChangeText={setSearch}
        style={[styles.input, dynamicStyles.input]}
      />
      <FlatList
        data={filteredItems}
        keyExtractor={(n) => n._id || n.id || Math.random().toString()}
        contentContainerStyle={{ paddingBottom: 32 }}
        renderItem={({ item }) => (
          <View style={[styles.card, dynamicStyles.card]}>
            <View style={[styles.iconContainer, dynamicStyles.iconContainer]}>
              <Text style={{ fontSize: 20 }}>📢</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={[styles.cardTitle, dynamicStyles.cardTitle]}>{item.title}</Text>
              {!!item.content && <Text style={[styles.cardBody, dynamicStyles.cardBody]}>{item.content}</Text>}
              <Text style={[styles.cardMeta, dynamicStyles.cardMeta]}>
                {[item.department, item.type, item.year].filter(Boolean).join(' • ')}
              </Text>
            </View>
            {(userProfile?.designation === 'Teacher' || userProfile?.role === 'admin') && (
              <TouchableOpacity onPress={() => handleDelete(item._id || item.id || '')} style={{ padding: 8 }}>
                <Text style={{ fontSize: 18, color: '#ef4444' }}>🗑️</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        ListEmptyComponent={<Text style={[styles.empty, dynamicStyles.empty]}>No notices yet.</Text>}
      />

      {/* Only show Add button for Teachers */}
      {userProfile?.designation === 'Teacher' && (
        <TouchableOpacity style={styles.fab} onPress={() => setModal(true)}>
          <Text style={{ color: '#fff', fontWeight: '600' }}>Add</Text>
        </TouchableOpacity>
      )}

      <Modal visible={modal} transparent animationType="slide" onRequestClose={() => setModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, dynamicStyles.modalCard]}>
            <Text style={[styles.cardTitle, dynamicStyles.cardTitle]}>Create Notice</Text>

            <TextInput placeholder="Title" placeholderTextColor={colors.subText} value={newTitle} onChangeText={setNewTitle} style={[styles.input, dynamicStyles.input]} />

            <Dropdown
              label="Target Audience"
              value={targetAudience}
              options={['All', ...(userProfile?.school ? [userProfile.school] : [])]}
              onSelect={setTargetAudience}
            />

            <Dropdown
              label="Year"
              value={targetYear}
              options={['All Years', '1st Year', '2nd Year', '3rd Year', '4th Year']}
              onSelect={setTargetYear}
            />

            <Dropdown
              label="Type"
              value={noticeType}
              options={['General', 'Event', 'Placement', 'Academic']}
              onSelect={setNoticeType}
            />

            <TextInput
              placeholder="Description"
              placeholderTextColor={colors.subText}
              value={newContent}
              onChangeText={setNewContent}
              style={[styles.input, dynamicStyles.input, { height: 80, textAlignVertical: 'top' }]}
              multiline
            />

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 10 }}>
              <TouchableOpacity style={[styles.fab, { position: 'relative', backgroundColor: isDark ? '#374151' : '#eaf0ff', flex: 1, right: 0, bottom: 0 }]} onPress={() => setModal(false)}>
                <Text style={{ color: '#3b5bfd', fontWeight: '700' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.fab, { position: 'relative', flex: 1, right: 0, bottom: 0 }]}
                onPress={createNotice}
              >
                <Text style={{ color: '#fff', fontWeight: '700' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 16 },
  input: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  cardBody: { lineHeight: 22, fontSize: 15 },
  cardMeta: { fontSize: 12, marginTop: 8, fontWeight: '600' },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  empty: { textAlign: 'center', marginTop: 40, fontSize: 16 },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    backgroundColor: '#3b5bfd',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#3b5bfd',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modalCard: { borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 10, maxHeight: '80%' },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  dropdownBtn: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownBtnText: { fontSize: 15 },
  dropdownList: {
    borderWidth: 1,
    borderRadius: 12,
    marginTop: 4,
    padding: 4,
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  dropdownItem: { padding: 12, borderBottomWidth: 1 },
  dropdownItemText: { fontSize: 14 },
});
