import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

type ThemeContextType = {
    isDark: boolean;
    toggleTheme: () => void;
    colors: {
        background: string;
        card: string;
        text: string;
        subText: string;
        border: string;
        primary: string;
        danger: string;
        success: string;
        warning: string;
        inputBg: string;
    };
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const lightColors = {
    background: '#f5f8ff',
    card: '#ffffff',
    text: '#1f2937',
    subText: '#6b7280',
    border: '#e6e9f3',
    primary: '#3b5bfd',
    danger: '#ef4444',
    success: '#10b981',
    warning: '#f59e0b',
    inputBg: '#f9fafb',
};

export const darkColors = {
    background: '#111827',
    card: '#1f2937',
    text: '#f9fafb',
    subText: '#9ca3af',
    border: '#374151',
    primary: '#60a5fa',
    danger: '#f87171',
    success: '#34d399',
    warning: '#fbbf24',
    inputBg: '#374151',
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const systemScheme = useColorScheme();
    const [isDark, setIsDark] = useState(systemScheme === 'dark');

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const stored = await AsyncStorage.getItem('app_theme');
            if (stored !== null) {
                setIsDark(stored === 'dark');
            }
        } catch (e) {
            console.error('Failed to load theme', e);
        }
    };

    const toggleTheme = async () => {
        const newMode = !isDark;
        setIsDark(newMode);
        await AsyncStorage.setItem('app_theme', newMode ? 'dark' : 'light');
    };

    const colors = isDark ? darkColors : lightColors;

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme, colors }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
