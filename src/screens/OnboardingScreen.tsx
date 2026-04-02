import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, TouchableOpacity, Image, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Welcome to UniSpace',
    description: 'The ultimate academic hub. Stay updated with critical notices and events instantly.',
    icon: '🚀'
  },
  {
    id: '2',
    title: 'Collaborate Seamlessly',
    description: 'Join study groups, share high-quality notes, and track live session attendances.',
    icon: '📚'
  },
  {
    id: '3',
    title: 'Never Miss Out',
    description: 'Global searches, real-time push notifications, and a dynamic academic calendar.',
    icon: '🗓️'
  }
];

export default function OnboardingScreen({ navigation }: any) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const handleNext = async () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      navigation.replace('GetStarted');
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    navigation.replace('GetStarted');
  };

  const renderItem = ({ item }: { item: typeof SLIDES[0] }) => {
    return (
      <View style={[styles.slide, { width, backgroundColor: colors.background }]}>
        <View style={[styles.iconContainer, { backgroundColor: isDark ? colors.card : '#f1f5f9' }]}>
           <Text style={{ fontSize: 80 }}>{item.icon}</Text>
        </View>
        <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
        <Text style={[styles.desc, { color: colors.subText }]}>{item.description}</Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: Math.max(insets.top, 20) }]}>
      <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
        <Text style={[styles.skipText, { color: colors.subText }]}>Skip</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
        onMomentumScrollEnd={(e) => {
          setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / width));
        }}
      />

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <View style={styles.indicatorContainer}>
          {SLIDES.map((_, i) => {
            const opacity = scrollX.interpolate({
              inputRange: [(i - 1) * width, i * width, (i + 1) * width],
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });
            const scale = scrollX.interpolate({
              inputRange: [(i - 1) * width, i * width, (i + 1) * width],
              outputRange: [1, 1.25, 1],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View 
                key={i} 
                style={[styles.indicator, { backgroundColor: colors.primary, opacity, transform: [{ scale }] }]} 
              />
            );
          })}
        </View>

        <TouchableOpacity 
          style={[styles.nextBtn, { backgroundColor: colors.primary }]} 
          onPress={handleNext}>
          <Text style={styles.nextText}>{currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  skipBtn: { position: 'absolute', top: 50, right: 20, zIndex: 10 },
  skipText: { fontSize: 16, fontWeight: '600' },
  slide: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  iconContainer: { width: 220, height: 220, borderRadius: 110, justifyContent: 'center', alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 26, fontWeight: '800', textAlign: 'center', marginBottom: 16 },
  desc: { fontSize: 16, textAlign: 'center', lineHeight: 24, paddingHorizontal: 20 },
  footer: { height: 120, justifyContent: 'space-between', paddingHorizontal: 20 },
  indicatorContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 40 },
  indicator: { width: 8, height: 8, borderRadius: 4, marginHorizontal: 6 },
  nextBtn: { borderRadius: 16, height: 56, justifyContent: 'center', alignItems: 'center' },
  nextText: { color: '#fff', fontSize: 18, fontWeight: '700' }
});
