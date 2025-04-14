'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { useLocalStorage } from '../../lib/hooks/useLocalStorage';
import { fontOptions, FontOption } from '../../lib/fonts';

// Define the type for the font context
type FontContextType = {
  primaryFont: string;
  secondaryFont: string;
  primaryFontInfo: FontOption;
  secondaryFontInfo: FontOption;
  setPrimaryFont: (font: string) => void;
  setSecondaryFont: (font: string) => void;
  availableFonts: { id: string; name: string }[];
};

// Create the context with a default value
const FontContext = createContext<FontContextType>({
  primaryFont: 'albertSans',
  secondaryFont: 'lato',
  primaryFontInfo: fontOptions.albertSans,
  secondaryFontInfo: fontOptions.lato,
  setPrimaryFont: () => null,
  setSecondaryFont: () => null,
  availableFonts: Object.keys(fontOptions).map(key => ({ id: key, name: fontOptions[key].name })),
});

// Hook to use the font context
export const useFont = () => useContext(FontContext);

// The font provider component
export function FontProvider({ children }: { children: React.ReactNode }) {
  // Get the fonts from local storage or use defaults
  const [primaryFont, setPrimaryFontValue] = useLocalStorage<string>('primaryFont', 'albertSans');
  const [secondaryFont, setSecondaryFontValue] = useLocalStorage<string>('secondaryFont', 'lato');
  
  // Get the font info
  const primaryFontInfo = fontOptions[primaryFont] || fontOptions.albertSans;
  const secondaryFontInfo = fontOptions[secondaryFont] || fontOptions.lato;
  
  // List of available fonts
  const availableFonts = Object.keys(fontOptions).map(key => ({
    id: key,
    name: fontOptions[key].name
  }));

  // Apply font CSS variables when the fonts change
  useEffect(() => {
    if (typeof document !== 'undefined') {
      // Get the selected fonts or use defaults
      const selectedPrimaryFont = fontOptions[primaryFont] || fontOptions.albertSans;
      const selectedSecondaryFont = fontOptions[secondaryFont] || fontOptions.lato;
      
      // Apply primary font directly (not nested in another CSS variable)
      document.documentElement.style.setProperty('--font-primary', selectedPrimaryFont.fontObject.style.fontFamily);
      
      // Apply secondary font directly
      document.documentElement.style.setProperty('--font-secondary', selectedSecondaryFont.fontObject.style.fontFamily);
      
      // Also set the traditional font type variables for backward compatibility
      if (selectedPrimaryFont.type === 'sans') {
        document.documentElement.style.setProperty('--font-sans', selectedPrimaryFont.fontObject.style.fontFamily);
      } else if (selectedSecondaryFont.type === 'sans') {
        document.documentElement.style.setProperty('--font-sans', selectedSecondaryFont.fontObject.style.fontFamily);
      } else {
        document.documentElement.style.setProperty('--font-sans', fontOptions.albertSans.fontObject.style.fontFamily);
      }
      
      if (selectedPrimaryFont.type === 'serif') {
        document.documentElement.style.setProperty('--font-serif', selectedPrimaryFont.fontObject.style.fontFamily);
      } else if (selectedSecondaryFont.type === 'serif') {
        document.documentElement.style.setProperty('--font-serif', selectedSecondaryFont.fontObject.style.fontFamily);
      } else {
        document.documentElement.style.setProperty('--font-serif', fontOptions.lora.fontObject.style.fontFamily);
      }
      
      if (selectedPrimaryFont.type === 'mono') {
        document.documentElement.style.setProperty('--font-mono', selectedPrimaryFont.fontObject.style.fontFamily);
      } else if (selectedSecondaryFont.type === 'mono') {
        document.documentElement.style.setProperty('--font-mono', selectedSecondaryFont.fontObject.style.fontFamily);
      } else {
        document.documentElement.style.setProperty('--font-mono', fontOptions.jetbrainsMono.fontObject.style.fontFamily);
      }
    }
  }, [primaryFont, secondaryFont]);

  // Functions to set the fonts
  const setPrimaryFont = (font: string) => {
    setPrimaryFontValue(font);
  };

  const setSecondaryFont = (font: string) => {
    setSecondaryFontValue(font);
  };

  return (
    <FontContext.Provider
      value={{
        primaryFont,
        secondaryFont,
        primaryFontInfo,
        secondaryFontInfo,
        setPrimaryFont,
        setSecondaryFont,
        availableFonts,
      }}
    >
      {children}
    </FontContext.Provider>
  );
} 