import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Linking, Image, ScrollView, TextInput, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLiveNews, UnifiedNewsItem } from '../hooks/useLiveNews';
import { useNewsArchive } from '../hooks/useNewsArchive';
import { toggleBookmark, getBookmarks, getReadHistory, markAsRead } from '../utils/newsLocalStorage';

// --- Sub-Components ---
const NewsCard = ({ item, isLive = false, onOpen }: { item: UnifiedNewsItem, isLive?: boolean, onOpen: (url: string, id: string) => void }) => {
  const { colors } = useTheme();
  const [bookmarked, setBookmarked] = useState(false);
  const [read, setRead] = useState(false);

  useEffect(() => {
    // Async reads from AsyncStorage
    getBookmarks().then(bms => setBookmarked(bms.some(b => b.id === item.id)));
    getReadHistory().then(hist => setRead(hist.includes(item.id)));
  }, [item.id]);

  const handleBookmark = () => {
    toggleBookmark(item).then(updated => setBookmarked(updated.some(b => b.id === item.id)));
  };

  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => onOpen(item.url, item.id)}>
      <View style={styles.imageContainer}>
         {item.image ? (
            <Image source={{ uri: item.image }} style={styles.cardCover} />
         ) : (
            <View style={[styles.cardCover, { backgroundColor: item.sourceColor, justifyContent: 'center', alignItems: 'center' }]}>
               <Text style={{color: '#fff', fontSize: 24, fontWeight: 'bold'}}>{item.title.substring(0, 2)}</Text>
            </View>
         )}
         <View style={[styles.sourceBadge, { backgroundColor: item.sourceColor }]}>
            <Text style={styles.sourceText}>{item.sourceLabel}</Text>
         </View>
         {isLive && item.isNew && (
            <View style={styles.newBadge}>
               <Text style={styles.newText}>NEW</Text>
            </View>
         )}
      </View>
      <View style={styles.cardContent}>
         <Text style={[styles.cardTitle, { color: colors.text, opacity: read ? 0.6 : 1 }]} numberOfLines={2}>{item.title}</Text>
         <Text style={[styles.cardDesc, { color: colors.subText }]} numberOfLines={3}>{item.description}</Text>
         
         <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8}}>
            {item.authorAvatar ? (
               <Image source={{ uri: item.authorAvatar }} style={{width: 20, height: 20, borderRadius: 10}} />
            ) : (
               <Ionicons name="person-circle-outline" size={20} color={colors.subText} />
            )}
            <Text style={{color: colors.subText, fontSize: 12}}>{item.author}</Text>
            <Text style={{color: colors.subText, fontSize: 12}}>•</Text>
            <Text style={{color: colors.subText, fontSize: 12}}>{new Date(item.publishedAt).toLocaleDateString()}</Text>
         </View>
         
         <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 16}}>
            <View style={{flexDirection: 'row', gap: 12}}>
               <Text style={{color: colors.subText, fontSize: 12}}>⬆ {item.score || 0}</Text>
               <Text style={{color: colors.subText, fontSize: 12}}>💬 {item.comments || 0}</Text>
               {item.readTime && <Text style={{color: colors.subText, fontSize: 12}}>⏱ {item.readTime}</Text>}
            </View>
            <TouchableOpacity onPress={handleBookmark}>
               <Ionicons name={bookmarked ? "bookmark" : "bookmark-outline"} size={20} color={bookmarked ? "#3b5bfd" : colors.subText} />
            </TouchableOpacity>
         </View>
      </View>
    </TouchableOpacity>
  );
};

export default function TechNewsTab() {
  const { colors, isDark } = useTheme();
  const [activeSubTab, setActiveSubTab] = useState<'live' | 'archive'>('live');

  // Hooks
  const live = useLiveNews();
  const archive = useNewsArchive();

  const handleOpenLink = (url: string, id: string) => {
     Linking.openURL(url);
     markAsRead(id); // async but fire-and-forget is fine
  };

  const renderLiveHeader = () => (
     <View style={[styles.liveHeader, { backgroundColor: isDark ? '#1e293b' : '#f8fafc', borderColor: colors.border }]}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
           <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
              <View style={[styles.liveDot, { backgroundColor: live.refreshing ? '#f59e0b' : '#22c55e' }]} />
              <Text style={{color: colors.text, fontWeight: 'bold'}}>{live.refreshing ? 'UPDATING...' : 'LIVE FEED'}</Text>
           </View>
           <Text style={{color: colors.subText, fontSize: 12}}>Next refresh: {live.nextRefreshIn}s</Text>
           <TouchableOpacity onPress={live.manualRefresh} disabled={live.refreshing} style={{padding: 4}}>
              <Ionicons name="refresh" size={18} color={live.refreshing ? colors.subText : '#3b5bfd'} />
           </TouchableOpacity>
        </View>
        
        {/* Progress Bar */}
        <View style={{height: 2, backgroundColor: colors.border, marginTop: 8, borderRadius: 2, overflow: 'hidden'}}>
           <View style={{height: '100%', width: `${(live.nextRefreshIn / 60) * 100}%`, backgroundColor: live.nextRefreshIn <= 10 ? '#f59e0b' : '#3b5bfd'}} />
        </View>
     </View>
  );

  return (
    <View style={{ flex: 1 }}>
      {/* Tab Switcher */}
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
         <TouchableOpacity 
           onPress={() => setActiveSubTab('live')}
           style={[styles.subTab, activeSubTab === 'live' ? {backgroundColor: '#3b5bfd'} : {backgroundColor: colors.card, borderColor: colors.border}]}>
           <Text style={[styles.subTabText, {color: activeSubTab === 'live' ? '#fff' : colors.text}]}>📡 Live Feed</Text>
           {live.newCount > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{live.newCount}</Text></View>}
         </TouchableOpacity>

         <TouchableOpacity 
           onPress={() => setActiveSubTab('archive')}
           style={[styles.subTab, activeSubTab === 'archive' ? {backgroundColor: '#3b5bfd'} : {backgroundColor: colors.card, borderColor: colors.border}]}>
           <Text style={[styles.subTabText, {color: activeSubTab === 'archive' ? '#fff' : colors.text}]}>📚 News Archive</Text>
         </TouchableOpacity>
      </View>

      {/* BREAKING NEWS BANNER */}
      {live.breakingNews && activeSubTab === 'live' && (
         <View style={styles.breakingBanner}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 14, flex: 1}}>⚡ BREAKING: {live.breakingNews.article.title}</Text>
                <TouchableOpacity onPress={live.dismissBreaking} style={{marginLeft: 12}}><Ionicons name="close" size={18} color="#fff" /></TouchableOpacity>
            </View>
            <TouchableOpacity style={{marginTop: 8}} onPress={() => handleOpenLink(live.breakingNews!.article.url, live.breakingNews!.article.id)}>
               <Text style={{color: '#ffedd5', textDecorationLine: 'underline'}}>Read Now →</Text>
            </TouchableOpacity>
         </View>
      )}

      {/* NEW ARTICLES BANNER */}
      {live.newCount > 0 && activeSubTab === 'live' && (
         <TouchableOpacity style={styles.newArticleBanner} onPress={live.markNewsAsSeen}>
            <Text style={{color: '#fff', fontWeight: 'bold'}}>⬆ {live.newCount} new articles arrived — Click to mark seen</Text>
         </TouchableOpacity>
      )}

      {/* LIVE VIEW */}
      {activeSubTab === 'live' && (
         <FlatList
           data={live.articles}
           keyExtractor={(item) => item.id.toString()}
           ListHeaderComponent={renderLiveHeader()}
           renderItem={({item}) => <NewsCard item={item} isLive={true} onOpen={handleOpenLink} />}
           contentContainerStyle={{ paddingBottom: 100 }}
           ItemSeparatorComponent={() => <View style={{height: 16}} />}
           showsVerticalScrollIndicator={false}
           ListEmptyComponent={
              live.loading ? <ActivityIndicator size="large" color="#3b5bfd" style={{marginTop: 40}} /> : 
              <Text style={{color: colors.subText, textAlign: 'center', marginTop: 40}}>No live news available right now.</Text>
           }
         />
      )}

      {/* ARCHIVE VIEW */}
      {activeSubTab === 'archive' && (
         <FlatList
           data={archive.articles}
           keyExtractor={(item) => item.id.toString() + 'ar'}
           ListHeaderComponent={() => (
             <View style={{marginBottom: 16}}>
                <TextInput 
                   style={[styles.searchInput, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
                   placeholder="Search all archived news..."
                   placeholderTextColor={colors.subText}
                   onChangeText={(t) => archive.search(t)}
                />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginTop: 12, paddingBottom: 8}}>
                   {['All', 'Hacker News', 'Dev.to'].map(src => (
                      <TouchableOpacity 
                         key={src}
                         onPress={() => archive.setFilter('source', src === 'All' ? 'all' : src)}
                         style={[styles.filterPill, { 
                            backgroundColor: archive.filters.source === (src==='All'?'all':src) ? '#3b5bfd' : colors.card,
                            borderColor: colors.border
                         }]}>
                         <Text style={{color: archive.filters.source === (src==='All'?'all':src) ? '#fff' : colors.text}}>{src}</Text>
                      </TouchableOpacity>
                   ))}
                </ScrollView>
             </View>
           )}
           renderItem={({item}) => <NewsCard item={item} onOpen={handleOpenLink} />}
           contentContainerStyle={{ paddingBottom: 100 }}
           ItemSeparatorComponent={() => <View style={{height: 16}} />}
           onEndReached={archive.loadMore}
           onEndReachedThreshold={0.5}
           ListFooterComponent={archive.loading ? <ActivityIndicator size="small" color="#3b5bfd" style={{marginVertical: 20}} /> : null}
         />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  subTab: {
     flexDirection: 'row',
     alignItems: 'center',
     paddingVertical: 10,
     paddingHorizontal: 16,
     borderRadius: 8,
     borderWidth: 1,
  },
  subTabText: {
     fontWeight: '600',
     fontSize: 14,
  },
  badge: {
     backgroundColor: '#ef4444',
     borderRadius: 12,
     paddingHorizontal: 6,
     paddingVertical: 2,
     marginLeft: 8,
  },
  badgeText: {
     color: '#fff',
     fontSize: 10,
     fontWeight: 'bold',
  },
  liveHeader: {
     padding: 16,
     borderRadius: 12,
     borderWidth: 1,
     marginBottom: 16,
  },
  liveDot: {
     width: 8,
     height: 8,
     borderRadius: 4,
  },
  breakingBanner: {
     backgroundColor: '#ea580c',
     padding: 16,
     borderRadius: 12,
     marginBottom: 16,
     shadowColor: '#ea580c',
     shadowOffset: { width: 0, height: 4 },
     shadowOpacity: 0.3,
     shadowRadius: 8,
     elevation: 6
  },
  newArticleBanner: {
     backgroundColor: '#3b5bfd',
     padding: 12,
     borderRadius: 8,
     alignItems: 'center',
     marginBottom: 16,
  },
  searchInput: {
     height: 48,
     borderWidth: 1,
     borderRadius: 8,
     paddingHorizontal: 16,
     fontSize: 16,
  },
  filterPill: {
     paddingHorizontal: 16,
     paddingVertical: 8,
     borderRadius: 20,
     borderWidth: 1,
     marginRight: 8,
  },
  card: {
     borderRadius: 16,
     borderWidth: 1,
     overflow: 'hidden',
  },
  imageContainer: {
     height: 180,
     width: '100%',
     position: 'relative',
  },
  cardCover: {
     width: '100%',
     height: '100%',
  },
  sourceBadge: {
     position: 'absolute',
     top: 12,
     left: 12,
     paddingHorizontal: 8,
     paddingVertical: 4,
     borderRadius: 4,
  },
  sourceText: {
     color: '#fff',
     fontSize: 10,
     fontWeight: 'bold',
  },
  newBadge: {
     position: 'absolute',
     top: 12,
     right: 12,
     backgroundColor: '#22c55e',
     paddingHorizontal: 8,
     paddingVertical: 4,
     borderRadius: 4,
  },
  newText: {
     color: '#fff',
     fontSize: 10,
     fontWeight: 'bold',
  },
  cardContent: {
     padding: 16,
  },
  cardTitle: {
     fontSize: 18,
     fontWeight: 'bold',
     marginBottom: 8,
     lineHeight: 24,
  },
  cardDesc: {
     fontSize: 14,
     lineHeight: 20,
  }
});
