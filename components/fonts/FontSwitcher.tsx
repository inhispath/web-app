'use client';

import React, { useState } from 'react';
import { useFont } from './FontProvider';

export default function FontSwitcher() {
  const { 
    primaryFont, 
    secondaryFont, 
    setPrimaryFont, 
    setSecondaryFont, 
    availableFonts 
  } = useFont();
  
  const [isPrimaryOpen, setIsPrimaryOpen] = useState(false);
  const [isSecondaryOpen, setIsSecondaryOpen] = useState(false);

  const handlePrimaryFontChange = (fontId: string) => {
    setPrimaryFont(fontId);
    setIsPrimaryOpen(false);
  };

  const handleSecondaryFontChange = (fontId: string) => {
    setSecondaryFont(fontId);
    setIsSecondaryOpen(false);
  };

  return (
    <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
      {/* Primary Font Selector */}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setIsPrimaryOpen(!isPrimaryOpen);
            setIsSecondaryOpen(false);
          }}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-card rounded-md border border-border shadow-sm hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400"
          aria-expanded={isPrimaryOpen}
          aria-haspopup="listbox"
        >
          <span>Primary Font: {availableFonts.find(f => f.id === primaryFont)?.name || 'Albert Sans'}</span>
          <svg 
            className={`h-4 w-4 transition-transform ${isPrimaryOpen ? 'rotate-180' : ''}`} 
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

        {isPrimaryOpen && (
          <div 
            className="absolute z-50 mt-1 w-64 rounded-md shadow-lg bg-card ring-1 ring-black ring-opacity-5"
            role="listbox"
            aria-label="Primary Font options"
          >
            <div className="py-1 max-h-60 overflow-auto">
              {availableFonts.map((font) => (
                <button
                  key={font.id}
                  onClick={() => handlePrimaryFontChange(font.id)}
                  className={`
                    ${font.id === primaryFont ? 'bg-primary-100 text-primary-900' : 'text-foreground hover:bg-muted'} 
                    block w-full text-left px-4 py-2 text-sm
                  `}
                  role="option"
                  aria-selected={font.id === primaryFont}
                >
                  {font.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Secondary Font Selector */}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setIsSecondaryOpen(!isSecondaryOpen);
            setIsPrimaryOpen(false);
          }}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-card rounded-md border border-border shadow-sm hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400"
          aria-expanded={isSecondaryOpen}
          aria-haspopup="listbox"
        >
          <span>Secondary Font: {availableFonts.find(f => f.id === secondaryFont)?.name || 'Lato'}</span>
          <svg 
            className={`h-4 w-4 transition-transform ${isSecondaryOpen ? 'rotate-180' : ''}`} 
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

        {isSecondaryOpen && (
          <div 
            className="absolute z-50 mt-1 w-64 rounded-md shadow-lg bg-card ring-1 ring-black ring-opacity-5"
            role="listbox"
            aria-label="Secondary Font options"
          >
            <div className="py-1 max-h-60 overflow-auto">
              {availableFonts.map((font) => (
                <button
                  key={font.id}
                  onClick={() => handleSecondaryFontChange(font.id)}
                  className={`
                    ${font.id === secondaryFont ? 'bg-primary-100 text-primary-900' : 'text-foreground hover:bg-muted'} 
                    block w-full text-left px-4 py-2 text-sm
                  `}
                  role="option"
                  aria-selected={font.id === secondaryFont}
                >
                  {font.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 