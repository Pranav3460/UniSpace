import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, Image, ActivityIndicator, ScrollView, Linking } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../api/client';
import { useSocket } from '../context/SocketContext';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../context/ThemeContext';
import TechNewsTab from '../components/TechNewsTab';
import { SkeletonLoader } from '../components/ui/SkeletonLoader';
import { EmptyState } from '../components/ui';

type Event = {
  _id: string;
  title: string;
  type: string;
  date: string;
  time: string;
  location: string;
  mode: string;
  organizer: string;
  description: string;
  imageUrl?: string;
  timings?: string;
  registration_deadline?: string;
  max_participants?: number;
  contact_name?: string;
  contact_email?: string;
  notes?: string;
  status: string;
  school?: string;
  createdByEmail: string;
  createdByRole?: string;
  rejectionReason?: string;
  newDate?: string;
  newTime?: string;
  postponeReason?: string;
  reactions?: { emoji: string; user: string }[];
};

export default function EventsScreen() {
  const { userProfile, email, role } = useAuth();
  const { colors, isDark } = useTheme();
  
  const [activeTab, setActiveTab] = useState<'events' | 'news' | 'approvals'>('events');
  
  const [events, setEvents] = useState<Event[]>([]);
  const [pendingEvents, setPendingEvents] = useState<Event[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState('Hackathon');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [mode, setMode] = useState('Offline');
  const [organizer, setOrganizer] = useState(''); 
  const [description, setDescription] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Filter State
  const [filterType, setFilterType] = useState('All');
  
  // Postpone State
  const [postponeModalVisible, setPostponeModalVisible] = useState(false);
  const [postponeEventId, setPostponeEventId] = useState<string | null>(null);
  const [postponeDate, setPostponeDate] = useState(new Date());
  const [showPostponeDatePicker, setShowPostponeDatePicker] = useState(false);
  const [postponeTime, setPostponeTime] = useState('');
  const [postponeReason, setPostponeReason] = useState('');

  // Reject State
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectEventId, setRejectEventId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const isTeacher = userProfile?.role === 'teacher';
  const isAdmin = userProfile?.role === 'admin';
  const isStudent = userProfile?.role === 'student';

  const { socket } = useSocket();

  useEffect(() => {
    fetchEvents();
    if (isTeacher || isAdmin) {
      fetchPendingEvents();
    }
  }, [userProfile]);

  useEffect(() => {
    if (!socket) return;
    
    socket.on('event:create', fetchEvents);
    socket.on('event:request', () => {
       if (isAdmin || isTeacher) fetchPendingEvents();
    });
    socket.on('event:update', () => {
       fetchEvents();
       if (isAdmin || isTeacher) fetchPendingEvents();
    });
    socket.on('event:delete', () => {
       fetchEvents();
       if (isAdmin || isTeacher) fetchPendingEvents();
    });

    return () => {
      socket.off('event:create');
      socket.off('event:request');
      socket.off('event:update');
      socket.off('event:delete');
    };
  }, [socket, userProfile]);

  async function fetchEvents() {
    if (!isAdmin && !userProfile?.school) return;
    setLoading(true);
    try {
      const schoolQuery = (!isAdmin && userProfile?.school) ? `?school=${encodeURIComponent(userProfile.school)}` : '';
      
      // If student, we can also fetch their personal events to show their status
      let url = `${API_BASE_URL}/api/events${schoolQuery}`;
      const response = await fetch(url);
      if (response.ok) {
        let data = await response.json();
        
        // Let's also fetch student's own requests if they are a student
        if (isStudent && email) {
           const personalRes = await fetch(`${API_BASE_URL}/api/events/user/${encodeURIComponent(email)}`);
           if (personalRes.ok) {
             const personalData = await personalRes.json();
             // Merge uniquely by _id
             const merged = [...data, ...personalData];
             const uniqueMap = new Map();
             merged.forEach(item => uniqueMap.set(item._id, item));
             data = Array.from(uniqueMap.values());
           }
        }
        
        setEvents(data.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      }
    } catch (e) {
      console.error('Failed to fetch events', e);
    } finally {
      setLoading(false);
    }
  }

  async function fetchPendingEvents() {
    try {
      const schoolQuery = (!isAdmin && userProfile?.school) ? `?school=${encodeURIComponent(userProfile.school)}` : '';
      const response = await fetch(`${API_BASE_URL}/api/events/pending${schoolQuery}`);
      if (response.ok) {
        const data = await response.json();
        setPendingEvents(data);
      }
    } catch (e) {
      console.error('Failed to fetch pending events', e);
    }
  }

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.5,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  async function uploadImage(uri: string): Promise<string | null> {
    const formData = new FormData();
    formData.append('file', { uri, name: 'event.jpg', type: 'image/jpeg' } as any);

    try {
      const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST', body: formData, headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.ok) {
        const data = await response.json();
        return data.url;
      }
    } catch (e) {
      console.error('Upload failed', e);
    }
    return null;
  }

  async function submitEvent() {
    if (!title || !location || !time) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }

    setCreating(true);
    let imageUrl = '';
    if (selectedImage) {
      const url = await uploadImage(selectedImage);
      if (url) imageUrl = url;
    }

    const endpoint = isStudent ? '/api/events/request' : '/api/events/create';
    
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, type: eventType, date: date.toISOString(), time, location, mode,
          organizer: organizer || (userProfile?.name || 'Unknown'),
          description, imageUrl, timings: time,
          contact_name: contactName || userProfile?.name,
          contact_email: contactEmail || email,
          school: userProfile?.school, createdByEmail: email,
        }),
      });

      if (response.ok) {
        Alert.alert('Success', isStudent ? 'Event request submitted for approval!' : 'Event created successfully!');
        setModalVisible(false);
        resetForm();
        fetchEvents();
      } else {
        Alert.alert('Error', 'Failed to create event');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to submit event request');
    } finally {
      setCreating(false);
    }
  }

  function resetForm() {
    setTitle(''); setEventType('Hackathon'); setDate(new Date()); setTime('');
    setLocation(''); setMode('Offline'); setOrganizer(''); setDescription('');
    setContactName(''); setContactEmail(''); setSelectedImage(null);
  }

  // Admin / Teacher Actions
  async function approveEvent(id: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/events/${id}/approve`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewerEmail: email })
      });
      if (res.ok) {
         fetchPendingEvents();
         fetchEvents();
      }
    } catch(e) {}
  }

  async function executeReject() {
    if (!rejectReason.trim()) {
       Alert.alert('Validation Error', 'Rejection reason is mandatory.');
       return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/events/${rejectEventId}/reject`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason, reviewerEmail: email })
      });
      if (res.ok) {
         setRejectModalVisible(false);
         setRejectReason('');
         setRejectEventId(null);
         fetchPendingEvents();
         fetchEvents();
      }
    } catch(e) {}
  }

  async function deleteEvent(id: string) {
    Alert.alert('Delete Event', 'Are you sure you want to delete this event?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          await fetch(`${API_BASE_URL}/api/events/${id}`, { method: 'DELETE' });
          fetchEvents();
      }}
    ]);
  }

  async function executePostpone() {
    if (!postponeReason.trim() || !postponeTime.trim()) {
       Alert.alert('Validation Error', 'All fields are required.');
       return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/events/${postponeEventId}/postpone`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: postponeReason, newDate: postponeDate.toISOString(), newTime: postponeTime })
      });
      if (res.ok) {
         setPostponeModalVisible(false);
         setPostponeReason('');
         setPostponeTime('');
         fetchEvents();
      }
    } catch(e) {}
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Hackathon': return '#8b5cf6';
      case 'Workshop': return '#3b82f6';
      case 'Seminar': return '#ec4899';
      case 'Competition': return '#f59e0b';
      default: return '#10b981';
    }
  };

  async function toggleReaction(eventId: string, emoji: string) {
    if (!email) return;
    try {
      // Optimistic upate (optional, skip for simplicity)
      const res = await fetch(`${API_BASE_URL}/api/events/${eventId}/reactions`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: email, emoji })
      });
      if (res.ok) fetchEvents(); // re-fetch or rely on socket
    } catch(e) {}
  }

  const dynamicStyles = {
    container: { backgroundColor: colors.background },
    title: { color: colors.text },
    tabText: { color: colors.subText },
    activeTab: { color: '#3b5bfd', fontWeight: 'bold' as const },
    activeTabLine: { backgroundColor: '#3b5bfd' },
    card: { backgroundColor: colors.card, borderColor: colors.border },
    cardTitle: { color: colors.text },
    cardMeta: { color: colors.subText },
    cardDesc: { color: colors.subText },
    label: { color: colors.text },
    input: { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border },
    empty: { color: colors.subText },
  };

  const filteredEvents = events.filter(e => {
    // Only show pending/rejected to the creator, or if admin/teacher exploring events tab?
    // Actually, events tab should just be public approved events for others, and own events.
    if (!isTeacher && !isAdmin) {
       if (e.createdByEmail !== email && e.status !== 'approved' && e.status !== 'postponed' && e.status !== 'completed') {
         return false; // hide others' pending/rejected 
       }
    } else {
       if (e.status === 'pending' || e.status === 'rejected') {
         return false; // they see those in Approvals
       }
    }
    if (filterType !== 'All' && e.type !== filterType) return false;
    return true;
  });

  const renderEventCard = ({ item }: { item: Event }) => {
    const isOwner = email === item.createdByEmail;
    return (
    <View style={[styles.card, dynamicStyles.card]}>
      {item.imageUrl ? <Image source={{ uri: item.imageUrl }} style={styles.cardImage} /> : null}
      
      {item.status === 'pending' && <View style={styles.watermarkContainer}><Text style={styles.watermarkText}>PENDING APPROVAL</Text></View>}
      {item.status === 'rejected' && <View style={[styles.watermarkContainer, {backgroundColor: 'rgba(239, 68, 68, 0.8)'}]}><Text style={styles.watermarkText}>REJECTED</Text></View>}
      
      <View style={styles.cardContent}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Text style={[styles.cardTitle, dynamicStyles.cardTitle, { flex: 1 }]}>{item.title}</Text>
          <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.type) }]}>
             <Text style={styles.badgeText}>{item.type}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color={colors.subText} />
          <Text style={[styles.cardMeta, dynamicStyles.cardMeta]}>
             {item.status === 'postponed' && item.newDate ? new Date(item.newDate).toDateString() : new Date(item.date).toDateString()}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color={colors.subText} />
          <Text style={[styles.cardMeta, dynamicStyles.cardMeta]}>
             {item.status === 'postponed' && item.newTime ? item.newTime : item.time || item.timings}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color={colors.subText} />
          <Text style={[styles.cardMeta, dynamicStyles.cardMeta]}>{item.location} • {item.mode}</Text>
        </View>

        {item.description ? (
          <Text style={[styles.cardDesc, dynamicStyles.cardDesc]} numberOfLines={3}>{item.description}</Text>
        ) : null}

        {item.status === 'postponed' && item.postponeReason && (
          <View style={[styles.alertBox, { backgroundColor: isDark ? '#451a03' : '#fef3c7' }]}>
            <Text style={[styles.alertBoxesText, { color: isDark ? '#fcd34d' : '#b45309' }]}><Text style={{fontWeight: 'bold'}}>Postponed:</Text> {item.postponeReason}</Text>
          </View>
        )}
        
        {item.status === 'rejected' && item.rejectionReason && (
          <View style={[styles.alertBox, {backgroundColor: isDark ? '#450a0a' : '#fee2e2'}]}>
            <Text style={[styles.alertBoxesText, {color: isDark ? '#fca5a5' : '#991b1b'}]}><Text style={{fontWeight: 'bold'}}>Reason:</Text> {item.rejectionReason}</Text>
          </View>
        )}

        <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
           <Text style={[styles.organizerText, { color: colors.subText }]}>By {item.organizer}</Text>
           
           {item.status === 'approved' && (
             <View style={{flexDirection: 'row', gap: 6, alignItems: 'center', marginHorizontal: 12}}>
               {['👍', '🔥'].map(emoji => {
                 const count = item.reactions?.filter(r => r.emoji === emoji).length || 0;
                 const hasReacted = item.reactions?.some(r => r.emoji === emoji && r.user === email);
                 return (
                   <TouchableOpacity key={emoji} onPress={() => toggleReaction(item._id, emoji)} style={[styles.actionBtnOutline, { borderColor: colors.border, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: hasReacted ? colors.primary + '20' : 'transparent' }]}>
                     <Text style={{fontSize: 12}}>{emoji} {count > 0 ? count : ''}</Text>
                   </TouchableOpacity>
                 )
               })}
             </View>
           )}

           <View style={{flexDirection: 'row', gap: 8, marginLeft: 'auto'}}>
             {(isTeacher || isAdmin) && !isOwner && (
                <TouchableOpacity style={[styles.actionBtnOutline, { borderColor: colors.border }]} onPress={() => Linking.openURL(`mailto:${item.contact_email}`)}>
                   <Ionicons name="mail" size={16} color="#3b5bfd" />
                   <Text style={[styles.actionBtnText, {color: '#3b5bfd'}]}>Contact</Text>
                </TouchableOpacity>
             )}
             
             {isAdmin && item.status !== 'postponed' && item.status === 'approved' && (
                <TouchableOpacity style={[styles.actionBtnOutline, { borderColor: colors.border }]} onPress={() => { setPostponeEventId(item._id); setPostponeModalVisible(true); }}>
                   <Text style={[styles.actionBtnText, {color: '#f59e0b'}]}>Postpone</Text>
                </TouchableOpacity>
             )}
             
             {isAdmin && (
                <TouchableOpacity style={[styles.actionBtnOutline, { borderColor: colors.border }]} onPress={() => deleteEvent(item._id)}>
                   <Ionicons name="trash" size={16} color="#ef4444" />
                </TouchableOpacity>
             )}
           </View>
        </View>
      </View>
    </View>
    );
  };

  const renderApprovalCard = ({ item }: { item: Event }) => {
    return (
      <View style={[styles.card, dynamicStyles.card]}>
         <View style={styles.cardContent}>
            <Text style={[styles.cardTitle, dynamicStyles.cardTitle]}>{item.title}</Text>
            <Text style={dynamicStyles.cardDesc}>Requested by: {item.createdByEmail} (Student)</Text>
            <Text style={[dynamicStyles.cardDesc, {marginVertical: 8}]}>{item.description}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
               <TouchableOpacity style={[styles.btn, {backgroundColor: '#ef4444'}]} onPress={() => {setRejectEventId(item._id); setRejectModalVisible(true); }}>
                  <Text style={styles.btnText}>Reject</Text>
               </TouchableOpacity>
               <TouchableOpacity style={[styles.btn, {backgroundColor: '#10b981'}]} onPress={() => approveEvent(item._id)}>
                  <Text style={styles.btnText}>Approve</Text>
               </TouchableOpacity>
            </View>
         </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <View style={styles.header}>
        <Text style={[styles.title, dynamicStyles.title]}>Event Hub</Text>
        <TouchableOpacity style={styles.createBtn} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.btnText}>Create Event</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        {['events', 'news', ...(isTeacher || isAdmin ? ['approvals'] : [])].map((tab) => (
          <TouchableOpacity key={tab} onPress={() => setActiveTab(tab as any)} style={styles.tabItem}>
            <Text style={[styles.tabText, dynamicStyles.tabText, activeTab === tab && dynamicStyles.activeTab]}>
              {tab === 'events' ? '🏆 Hackathons & Events' : tab === 'news' ? '📰 Tech News' : '📝 Approvals'}
            </Text>
            {activeTab === tab && <View style={[styles.tabLine, dynamicStyles.activeTabLine]} />}
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'events' && (
        <>
          <View style={styles.filterBar}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {['All', 'Hackathon', 'Workshop', 'Seminar', 'Competition'].map(f => (
                <TouchableOpacity 
                   key={f} 
                   style={[
                     styles.filterChip, 
                     { backgroundColor: isDark ? colors.card : '#f3f4f6', borderColor: colors.border },
                     filterType === f && { backgroundColor: '#3b5bfd', borderColor: '#3b5bfd' }
                   ]} 
                   onPress={() => setFilterType(f)}>
                   <Text style={[styles.filterText, { color: isDark ? colors.text : '#4b5563' }, filterType === f && {color: '#fff'}]}>{f}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          {loading ? (
             <View style={{ padding: 16, gap: 16 }}>
               <SkeletonLoader variant="card" height={260} />
               <SkeletonLoader variant="card" height={260} />
               <SkeletonLoader variant="card" height={260} />
             </View>
          ) : (
             <FlatList data={filteredEvents} keyExtractor={item => item._id} renderItem={renderEventCard} 
             contentContainerStyle={{ paddingBottom: 80, paddingHorizontal: 16 }}
             ListEmptyComponent={<EmptyState title="No events found" subtitle="Check back later or adjust your filters." />} />
          )}
        </>
      )}

      {activeTab === 'news' && (
        <TechNewsTab />
      )}

      {activeTab === 'approvals' && (
        <FlatList data={pendingEvents} keyExtractor={item => item._id} renderItem={renderApprovalCard} 
         contentContainerStyle={{ paddingBottom: 80, paddingHorizontal: 16 }}
         ListEmptyComponent={<EmptyState title="No pending approvals" subtitle="You're all caught up!" />} />
      )}

      {/* CREATE MAIN MODAL */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modalContainer, {backgroundColor: colors.background}]}>
          <View style={[styles.modalHeader, {backgroundColor: colors.card, borderBottomColor: colors.border}]}>
            <Text style={[styles.modalTitle, dynamicStyles.title]}>{isStudent ? 'Request Event' : 'Create Event'}</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={{color: '#3b5bfd', fontSize: 16, fontWeight: '600'}}>Cancel</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={{padding: 20}}>
            {isStudent && (
               <View style={[styles.alertBox, {backgroundColor: '#eaf0ff', marginBottom: 16}]}>
                  <Text style={{color: '#1e3a8a'}}>As a student, your event will require approval from a Teacher or Admin before being published to the Hub.</Text>
               </View>
            )}
            
            <Text style={dynamicStyles.label}>Event Name</Text>
            <TextInput style={[styles.input, dynamicStyles.input]} placeholderTextColor={colors.subText} value={title} onChangeText={setTitle} placeholder="Manthan 2026" />

            <View style={{flexDirection: 'row', gap: 12, marginTop: 12}}>
               <View style={{flex: 1}}>
                  <Text style={dynamicStyles.label}>Date</Text>
                  <TouchableOpacity style={[styles.input, dynamicStyles.input]} onPress={() => setShowDatePicker(true)}>
                    <Text style={{color: colors.text}}>{date.toDateString()}</Text>
                  </TouchableOpacity>
                  {showDatePicker && <DateTimePicker value={date} mode="date" display="default" onChange={(e, d) => { setShowDatePicker(false); if(d) setDate(d); }} />}
               </View>
               <View style={{flex: 1}}>
                  <Text style={dynamicStyles.label}>Time</Text>
                  <TextInput style={[styles.input, dynamicStyles.input]} placeholderTextColor={colors.subText} value={time} onChangeText={setTime} placeholder="10:00 AM" />
               </View>
            </View>

            <View style={{flexDirection: 'row', gap: 12, marginTop: 12}}>
               <View style={{flex: 1}}>
                  <Text style={dynamicStyles.label}>Type</Text>
                  <TextInput style={[styles.input, dynamicStyles.input]} placeholderTextColor={colors.subText} value={eventType} onChangeText={setEventType} placeholder="Hackathon" />
               </View>
               <View style={{flex: 1}}>
                  <Text style={dynamicStyles.label}>Mode</Text>
                  <TextInput style={[styles.input, dynamicStyles.input]} placeholderTextColor={colors.subText} value={mode} onChangeText={setMode} placeholder="Offline" />
               </View>
            </View>

            <Text style={[dynamicStyles.label, {marginTop: 12}]}>Venue / Link</Text>
            <TextInput style={[styles.input, dynamicStyles.input]} placeholderTextColor={colors.subText} value={location} onChangeText={setLocation} placeholder="A BLOCK, Room 213" />

            <Text style={[dynamicStyles.label, {marginTop: 12}]}>Description</Text>
            <TextInput style={[styles.input, dynamicStyles.input, { height: 80 }]} placeholderTextColor={colors.subText} value={description} onChangeText={setDescription} placeholder="Detailed brief..." multiline />

            <Text style={[dynamicStyles.label, {marginTop: 12}]}>Cover Image</Text>
            <TouchableOpacity style={[styles.imageBtn, {borderColor: colors.border, backgroundColor: colors.inputBg}]} onPress={pickImage}>
              {selectedImage ? <Image source={{ uri: selectedImage }} style={{ width: '100%', height: 160, borderRadius: 8 }} /> : <Text style={{color: colors.subText}}>Tap to select image</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.submitBtn} onPress={submitEvent} disabled={creating}>
              {creating ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>{isStudent ? 'Submit Request' : 'Publish Event'}</Text>}
            </TouchableOpacity>
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Modal>

      {/* REJECT MODAL */}
      <Modal visible={rejectModalVisible} transparent animationType="fade">
         <View style={styles.modalOverlay}>
            <View style={[styles.popupCard, {backgroundColor: colors.card}]}>
               <Text style={[dynamicStyles.title, {fontSize: 18, fontWeight: 'bold'}]}>Reason for Rejection</Text>
               <Text style={[dynamicStyles.cardDesc, {marginVertical: 8}]}>Please provide a mandatory reason for rejecting this request.</Text>
               <TextInput style={[styles.input, dynamicStyles.input, {height: 80}]} multiline placeholder="Reason..." placeholderTextColor={colors.subText} value={rejectReason} onChangeText={setRejectReason} />
               <View style={{flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 16}}>
                  <TouchableOpacity style={[styles.btn, {backgroundColor: 'transparent'}]} onPress={() => {setRejectModalVisible(false); setRejectReason('');}}>
                     <Text style={{color: colors.subText}}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.btn, {backgroundColor: '#ef4444'}]} onPress={executeReject}>
                     <Text style={styles.btnText}>Confirm Reject</Text>
                  </TouchableOpacity>
               </View>
            </View>
         </View>
      </Modal>

      {/* POSTPONE MODAL */}
      <Modal visible={postponeModalVisible} transparent animationType="fade">
         <View style={styles.modalOverlay}>
            <View style={[styles.popupCard, {backgroundColor: colors.card}]}>
               <Text style={[dynamicStyles.title, {fontSize: 18, fontWeight: 'bold'}]}>Postpone Event</Text>
               <Text style={[dynamicStyles.label, {marginTop: 12}]}>New Date</Text>
               <TouchableOpacity style={[styles.input, dynamicStyles.input]} onPress={() => setShowPostponeDatePicker(true)}>
                  <Text style={{color: colors.text}}>{postponeDate.toDateString()}</Text>
               </TouchableOpacity>
               {showPostponeDatePicker && <DateTimePicker value={postponeDate} mode="date" display="default" onChange={(e, d) => { setShowPostponeDatePicker(false); if(d) setPostponeDate(d); }} />}
               
               <Text style={[dynamicStyles.label, {marginTop: 12}]}>New Time</Text>
               <TextInput style={[styles.input, dynamicStyles.input]} placeholder="10:00 AM" placeholderTextColor={colors.subText} value={postponeTime} onChangeText={setPostponeTime} />
               
               <Text style={[dynamicStyles.label, {marginTop: 12}]}>Reason</Text>
               <TextInput style={[styles.input, dynamicStyles.input]} placeholder="Due to..." placeholderTextColor={colors.subText} value={postponeReason} onChangeText={setPostponeReason} />

               <View style={{flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 16}}>
                  <TouchableOpacity style={[styles.btn, {backgroundColor: 'transparent'}]} onPress={() => setPostponeModalVisible(false)}>
                     <Text style={{color: colors.subText}}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.btn, {backgroundColor: '#f59e0b'}]} onPress={executePostpone}>
                     <Text style={styles.btnText}>Postpone</Text>
                  </TouchableOpacity>
               </View>
            </View>
         </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 20 },
  title: { fontSize: 28, fontWeight: '800' },
  createBtn: { backgroundColor: '#3b5bfd', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, gap: 4 },
  btnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  btn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  
  tabContainer: { flexDirection: 'row', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  tabItem: { marginRight: 24, paddingVertical: 12, position: 'relative' },
  tabText: { fontSize: 15, fontWeight: '600' },
  tabLine: { position: 'absolute', bottom: -1, left: 0, right: 0, height: 3, borderTopLeftRadius: 3, borderTopRightRadius: 3 },
  
  filterBar: { flexDirection: 'row', padding: 16, gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  filterText: { fontSize: 13, fontWeight: '600' },
  
  card: { borderRadius: 20, marginBottom: 16, overflow: 'hidden', borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  cardImage: { width: '100%', height: 160 },
  cardContent: { padding: 16 },
  cardTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 6 },
  cardMeta: { fontSize: 13, fontWeight: '500' },
  cardDesc: { marginTop: 8, fontSize: 14, lineHeight: 20 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 16, borderTopWidth: 1 },
  organizerText: { fontSize: 12, fontWeight: '600' },
  
  actionBtnOutline: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  actionBtnText: { fontSize: 12, fontWeight: '600' },
  
  watermarkContainer: { position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: 'rgba(245, 158, 11, 0.9)', paddingVertical: 6, alignItems: 'center', zIndex: 10 },
  watermarkText: { color: '#fff', fontSize: 11, fontWeight: 'bold', letterSpacing: 2 },
  
  alertBox: { padding: 12, borderRadius: 12, marginTop: 12 },
  alertBoxesText: { fontSize: 13 },
  
  modalContainer: { flex: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1 },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  input: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 15, marginTop: 4 },
  imageBtn: { borderWidth: 1, borderRadius: 12, padding: 24, alignItems: 'center', borderStyle: 'dashed', marginTop: 4 },
  submitBtn: { backgroundColor: '#3b5bfd', borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 32 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  popupCard: { width: '100%', borderRadius: 24, padding: 24, elevation: 10 },
  empty: { textAlign: 'center', marginTop: 40, fontSize: 16 }
});
