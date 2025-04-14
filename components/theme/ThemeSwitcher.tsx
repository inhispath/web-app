'use client';

import React, { useState } from 'react';
import { useTheme } from './ThemeProvider';

export default function ThemeSwitcher() {
  const { currentTheme, setTheme, availableThemes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const handleThemeChange = (themeId: string) => {
    setTheme(themeId);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-card rounded-md border border-border shadow-sm hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span>Theme: {availableThemes.find(t => t.id === currentTheme)?.name || 'Default'}</span>
        <svg 
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path 
            fillRule="evenodd" 
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
            clipRule="evenodd" 
          />
        </svg>
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-1 w-56 rounded-md shadow-lg bg-card ring-1 ring-black ring-opacity-5 z-50"
          role="listbox"
          aria-label="Theme options"
        >
          <div className="py-1">
            {availableThemes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleThemeChange(theme.id)}
                className={`
                  ${theme.id === currentTheme ? 'bg-primary-100 text-primary-900' : 'text-foreground hover:bg-muted'} 
                  block w-full text-left px-4 py-2 text-sm
                `}
                role="option"
                aria-selected={theme.id === currentTheme}
              >
                {theme.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 