'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocalStorage } from '../../lib/hooks/useLocalStorage';
import { themes, ThemeColors } from '../../lib/themes';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

// Define the type for the theme context
type ThemeContextType = {
  currentTheme: string;
  themeColors: ThemeColors;
  setTheme: (theme: string) => void;
  availableThemes: { id: string; name: string }[];
};

// Create the context with a default value
const ThemeContext = createContext<ThemeContextType>({
  currentTheme: 'default',
  themeColors: themes.default,
  setTheme: () => null,
  availableThemes: Object.keys(themes).map(key => ({ id: key, name: themes[key].name })),
});

// Hook to use the theme context
export const useTheme = () => useContext(ThemeContext);

// The theme provider component
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Get the theme from local storage or use default
  const [currentTheme, setCurrentTheme] = useLocalStorage<string>('theme', 'default');
  
  // Get the theme colors object
  const [themeColors, setThemeColors] = useState<ThemeColors>(themes[currentTheme] || themes.default);
  
  // List of available themes
  const availableThemes = Object.keys(themes).map(key => ({
    id: key,
    name: themes[key].name
  }));

  // Update theme colors when the current theme changes
  useEffect(() => {
    // Get the selected theme or default to the 'default' theme
    const selectedTheme = themes[currentTheme] || themes.default;
    setThemeColors(selectedTheme);
    
    // Apply the theme's CSS variables to the document root
    applyTheme(selectedTheme);
  }, [currentTheme]);

  // Function to apply theme CSS variables
  const applyTheme = (theme: ThemeColors) => {
    const root = document.documentElement;
    
    // Apply primary colors
    Object.entries(theme.colors.primary).forEach(([shade, value]) => {
      root.style.setProperty(`--primary-${shade}`, value as string);
    });
    
    // Apply secondary colors
    Object.entries(theme.colors.secondary).forEach(([shade, value]) => {
      root.style.setProperty(`--secondary-${shade}`, value as string);
    });
    
    // Apply accent colors
    Object.entries(theme.colors.accent).forEach(([shade, value]) => {
      root.style.setProperty(`--accent-${shade}`, value as string);
    });
    
    // Apply success colors
    Object.entries(theme.colors.success).forEach(([shade, value]) => {
      root.style.setProperty(`--success-${shade}`, value as string);
    });
    
    // Apply danger colors
    Object.entries(theme.colors.danger).forEach(([shade, value]) => {
      root.style.setProperty(`--danger-${shade}`, value as string);
    });
    
    // Apply warning colors
    Object.entries(theme.colors.warning).forEach(([shade, value]) => {
      root.style.setProperty(`--warning-${shade}`, value as string);
    });
    
    // Apply info colors
    Object.entries(theme.colors.info).forEach(([shade, value]) => {
      root.style.setProperty(`--info-${shade}`, value as string);
    });
    
    // Apply base colors
    root.style.setProperty('--background', theme.colors.background);
    root.style.setProperty('--foreground', theme.colors.foreground);
    root.style.setProperty('--card', theme.colors.card);
    root.style.setProperty('--card-foreground', theme.colors.cardForeground);
    root.style.setProperty('--muted', theme.colors.muted);
    root.style.setProperty('--muted-foreground', theme.colors.mutedForeground);
    root.style.setProperty('--border', theme.colors.border);
  };

  // Function to set the theme
  const setTheme = (theme: string) => {
    setCurrentTheme(theme);
  };

  return (
    <NextThemesProvider attribute="class">
      <ThemeContext.Provider
        value={{
          currentTheme,
          themeColors,
          setTheme,
          availableThemes,
        }}
      >
        {children}
      </ThemeContext.Provider>
    </NextThemesProvider>
  );
} 