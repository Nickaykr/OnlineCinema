import React, { createContext, useContext, useState } from 'react';

// 1. Цветовые палитры
export const themeColors = {
  dark: {
    background: '#0f0f0f',
    backgroundSecondary: 'rgba(255, 255, 255, 0.05)',
    card: '#1a1a1a',
    text: '#fff',
    textSecondary: '#888',
    star: '#ffd700',
    border: '#333',
    accent: '#ff4d4d',
    input: '#2a2a2a',
    shadow: '#000',
    cardBackground: '#2e2b2bff',
  },
  light: {
    background: '#F5F5F5',
    card: '#FFFFFF',
    text: '#1a1a1a',
    textSecondary: '#888',
    border: '#ddd',
    star: '#ffd700',
    accent: '#E50914',
    input: '#fff',
    shadow: '#000',
    cardBackground: '#F9F9F9',
  }
};

const ThemeContext = createContext<any>(null);

export const ThemeProvider = ({ children }: any) => {
  const [isDark, setIsDark] = useState(true); 

  const theme = isDark ? themeColors.dark : themeColors.light;

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Хук для удобного использования в файлах
export const useTheme = () => useContext(ThemeContext);