'use client';

import { useState, useEffect } from 'react';

// Type for the setValue function
type SetValue<T> = (value: T | ((prevState: T) => T)) => void;

// Hook to handle local storage with React
export function useLocalStorage<T>(key: string, initialValue: T): [T, SetValue<T>] {
  // State to store the value
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Initialize the value from localStorage when the component mounts
  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return;
    }
    
    try {
      // Get the value from localStorage using the key
      const item = window.localStorage.getItem(key);
      
      // If value exists, parse and set the state, otherwise use initial value
      const value = item ? JSON.parse(item) : initialValue;
      setStoredValue(value);
    } catch (error) {
      // If there's an error, log it and use the initial value
      console.error(`Error reading localStorage key "${key}":`, error);
      setStoredValue(initialValue);
    }
  }, [key, initialValue]);

  // Function to update the value in state and localStorage
  const setValue: SetValue<T> = (value) => {
    try {
      // Allow value to be a function to follow useState pattern
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to localStorage if we're in a browser environment
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      // If there's an error, log it
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
} 