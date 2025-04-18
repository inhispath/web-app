'use client';

import { useEffect, useState, MouseEvent as ReactMouseEvent, useCallback, useRef } from "react";
import { ChevronDown, ChevronRight, SeparatorVertical, Search, X, Share2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import React, { Suspense } from 'react';
import confetti from 'canvas-confetti';
import Link from "next/link";
import { useRouter, useSearchParams } from 'next/navigation';

// Get API URL from environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

interface Translation {
  title: string;
  translation: string;
}

interface Book {
  id: number;
  name: string;
}

interface Highlight {
  id: string;
  bookId: number;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
  createdAt: number;
}

interface Note {
  id: string;
  bookId: number;
  bookName: string;
  chapter: number;
  verse: number | null;
  text: string;
  category: string;
  createdAt: number;
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="animate-spin mr-2"><Loader2 size={24} /></div>
      <p className="font-primary text-[var(--primary-black)]">Loading...</p>
    </div>}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTranslation, setSelectedTranslation] = useState("American King James Version");
  const [selectedTranslationShort, setSelectedTranslationShort] = useState("AKJV");
  const [books, setBooks] = useState<Book[]>([]);
  const [chapterCounts, setChapterCounts] = useState<{ [bookId: number]: number }>({});
  const [openBook, setOpenBook] = useState<string | null>(null);
  const [loadingBooks, setLoadingBooks] = useState<{ [bookId: number]: boolean }>({});
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);
  const [verses, setVerses] = useState<{ verse: number; text: string }[]>([]);
  const [displayMode, setDisplayMode] = useState<1 | 2 | 3>(1);
  const [prevDisplayMode, setPrevDisplayMode] = useState<1 | 2 | 3>(1);
  const [rightSectionWidth, setRightSectionWidth] = useState(200);
  const [dragging, setDragging] = useState<true | false>(false);
  const [prevChapter, setPrevChapter] = useState<number | null>(null);
  const [prevBookId, setPrevBookId] = useState<number | null>(null);
  const [readChapters, setReadChapters] = useState<{[key: string]: boolean}>({});
  const [completedBooks, setCompletedBooks] = useState<{[bookId: number]: boolean}>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [translationSearchTerm, setTranslationSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<{
    type: 'book' | 'chapter' | 'verse' | 'loading' | 'error' | 'suggestions' | 'multiple_books',
    bookId?: number,
    bookName?: string | null,
    chapter?: number | null,
    verse?: number | null,
    verseContent?: string,
    chapterCount?: number,
    message?: string,
    suggestions?: Book[],
    matchingBooks?: Book[]
  } | null>(null);
  const debouncedSearchRef = useRef<NodeJS.Timeout | null>(null);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteCategories, setNoteCategories] = useState<string[]>(['General', 'Prayer', 'Study', 'Question', 'Insight']);
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [showNotesPanel, setShowNotesPanel] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const [shareVerse, setShareVerse] = useState<number | null>(null);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [hoveredVerse, setHoveredVerse] = useState<number | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    verse: number;
  } | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlParamsProcessed = useRef(false);
  const [isInitialRender, setIsInitialRender] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    async function fetchTranslationsAndBooks() {
      try {
        const res = await fetch(`${API_BASE_URL}/translations`);
        const data = await res.json();
        setTranslations(data);
  
        const defaultTranslation = data.find(
          (t: Translation) => t.translation === selectedTranslationShort
        );
  
        if (!defaultTranslation) return;
  
        const booksRes = await fetch(
          `${API_BASE_URL}/translations/${selectedTranslationShort}/books`
        );
        const booksData = await booksRes.json();
        setBooks(booksData);
  
        if (booksData.length > 0) {
          // Check if there's a book ID in the URL
          const urlBookId = searchParams.get('book');
          const bookIdToOpen = urlBookId ? parseInt(urlBookId) : null;
          
          // Find the book to open - either from URL or default to first
          const bookToOpen = bookIdToOpen 
            ? booksData.find((b: Book) => b.id === bookIdToOpen) || booksData[0]
            : booksData[0];
          
          setLoadingBooks(prev => ({ ...prev, [bookToOpen.id]: true }));
          const chaptersRes = await fetch(
            `${API_BASE_URL}/translations/${selectedTranslationShort}/books/${bookToOpen.id}/chapters`
          );
          const chaptersData = await chaptersRes.json();
          setChapterCounts(prev => ({
            ...prev,
            [bookToOpen.id]: Object.keys(chaptersData).length,
          }));
          setOpenBook(bookToOpen.name);
          setLoadingBooks(prev => ({ ...prev, [bookToOpen.id]: false }));
        }
      } catch (error) {
        console.error("Error loading translations or books:", error);
      }
    }
  
    fetchTranslationsAndBooks();
  }, []);
  

  useEffect(() => {
    async function fetchBooks() {
      try {
        const response = await fetch(`${API_BASE_URL}/translations/${selectedTranslationShort}/books`);
        const data = await response.json();
        setBooks(data);
        if (data.length > 0) setOpenBook(data[0].name);
      } catch (error) {
        console.error('Error fetching books:', error);
      }
    }

    if (selectedTranslationShort) fetchBooks();
  }, [selectedTranslationShort]);

  // Add useEffect for loading preferences from localStorage
  useEffect(() => {
    // Try to get saved translation preferences from localStorage
    const savedTranslation = localStorage.getItem('selectedTranslation');
    const savedTranslationShort = localStorage.getItem('selectedTranslationShort');
    const savedDisplayMode = localStorage.getItem('displayMode');
    
    // Set default note categories if they don't exist
    const savedNoteCategories = localStorage.getItem('noteCategories');
    if (!savedNoteCategories) {
      const defaultCategories = ['General', 'Prayer', 'Study', 'Question', 'Insight'];
      localStorage.setItem('noteCategories', JSON.stringify(defaultCategories));
    }

    // Set translation state if saved values exist
    if (savedTranslation) {
      setSelectedTranslation(savedTranslation);
    } else {
      // If no saved value, set the default and save it
      localStorage.setItem('selectedTranslation', 'American King James Version');
    }

    // Set translation short code if saved value exists
    if (savedTranslationShort) {
      setSelectedTranslationShort(savedTranslationShort);
    } else {
      // If no saved value, set the default and save it
      localStorage.setItem('selectedTranslationShort', 'AKJV');
    }
    
    // Set display mode if saved value exists
    if (savedDisplayMode) {
      const displayModeNum = parseInt(savedDisplayMode);
      if (!isNaN(displayModeNum) && [1, 2, 3].includes(displayModeNum)) {
        setDisplayMode(displayModeNum as 1 | 2 | 3);
      }
    } else {
      // If no saved value, set the default to 1 and save it
      localStorage.setItem('displayMode', '1');
    }
  }, []);

  // Load read chapters and completed books from localStorage on initial render
  useEffect(() => {
    // Load read chapters
    const savedReadChapters = localStorage.getItem('readChapters');
    if (savedReadChapters) {
      try {
        const parsed = JSON.parse(savedReadChapters);
        setReadChapters(parsed);
      } catch (error) {
        console.error('Error parsing saved read chapters:', error);
        // If error parsing, initialize with empty object
        localStorage.setItem('readChapters', JSON.stringify({}));
      }
    } else {
      // Initialize localStorage if it doesn't exist
      localStorage.setItem('readChapters', JSON.stringify({}));
    }
    
    // Load completed books
    const savedCompletedBooks = localStorage.getItem('completedBooks');
    if (savedCompletedBooks) {
      try {
        const parsed = JSON.parse(savedCompletedBooks);
        setCompletedBooks(parsed);
      } catch (error) {
        console.error('Error parsing saved completed books:', error);
        // If error parsing, initialize with empty object
        localStorage.setItem('completedBooks', JSON.stringify({}));
      }
    } else {
      // Initialize localStorage if it doesn't exist
      localStorage.setItem('completedBooks', JSON.stringify({}));
    }
  }, []);

  // Load highlights and notes from localStorage on initial render
  useEffect(() => {
    // Load notes from localStorage
    const savedNotes = localStorage.getItem('notes');
    if (savedNotes) {
      try {
        const parsed = JSON.parse(savedNotes) as Note[];
        setNotes(parsed);
      } catch (error) {
        console.error('Error parsing saved notes:', error);
      }
    }
    
    // Load categories from localStorage
    const savedCategories = localStorage.getItem('noteCategories');
    if (savedCategories) {
      try {
        const parsedCategories = JSON.parse(savedCategories) as string[];
        setNoteCategories(parsedCategories);
      } catch (error) {
        console.error('Error parsing saved categories:', error);
        // If there's an error, we'll use the default categories that were set in useState
      }
    }
    
    // Load highlights from localStorage
    const savedHighlights = localStorage.getItem('highlights');
    if (savedHighlights) {
      try {
        const parsed = JSON.parse(savedHighlights) as Highlight[];
        setHighlights(parsed);
      } catch (error) {
        console.error('Error parsing saved highlights:', error);
      }
    }
  }, []);

  // Add an effect to update book completion status whenever chapterCounts or readChapters change
  useEffect(() => {
    // Only proceed if we have books, chapter counts, and read chapters loaded
    if (books.length > 0 && Object.keys(chapterCounts).length > 0 && Object.keys(readChapters).length > 0) {
      // Create a new completed books object
      const newCompletedBooks = { ...completedBooks };
      let hasChanges = false;
      
      // Check each book with chapter information
      books.forEach(book => {
        if (chapterCounts[book.id]) {
          const totalChapters = chapterCounts[book.id];
          let readCount = 0;
          
          for (let i = 1; i <= totalChapters; i++) {
            if (readChapters[`${book.id}-${i}`]) {
              readCount++;
            }
          }
          
          const isCompleted = readCount === totalChapters && totalChapters > 0;
          
          // Update if the completion status has changed
          if (isCompleted !== !!completedBooks[book.id]) {
            hasChanges = true;
            if (isCompleted) {
              newCompletedBooks[book.id] = true;
            } else {
              delete newCompletedBooks[book.id];
            }
          }
        }
      });
      
      // Only update state and localStorage if there were changes
      if (hasChanges) {
        setCompletedBooks(newCompletedBooks);
        localStorage.setItem('completedBooks', JSON.stringify(newCompletedBooks));
      }
    }
  }, [books, chapterCounts, readChapters, completedBooks]);

  const filteredTranslations = useCallback(() => {
    if (!translationSearchTerm) return translations;
    return translations.filter((t) =>
      t.title.toLowerCase().includes(translationSearchTerm.toLowerCase())
    );
  }, [translations, translationSearchTerm]);

  // Create a debounced search handler
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Clear any existing timeout
    if (debouncedSearchRef.current) {
      clearTimeout(debouncedSearchRef.current);
    }
    
    // Only search if the input has value
    if (value.trim().length > 0) {
      // Set a debounced search that will run after a short delay
      debouncedSearchRef.current = setTimeout(() => {
        // Make sure we're using the latest value
        handleSearch(value);
      }, 300); // 300ms delay before triggering search
    } else {
      // Clear search results if input is empty
      setSearchResults(null);
    }
  };
  
  // Create a debounced translation search handler
  const handleTranslationSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Clear any existing timeout
    if (debouncedSearchRef.current) {
      clearTimeout(debouncedSearchRef.current);
    }
    
    // Set a new timeout
    debouncedSearchRef.current = setTimeout(() => {
      setTranslationSearchTerm(value);
    }, 150);
  };
  
  // Existing translation handler - optimize it
  const handleTranslationSelect = (translation: Translation) => {
    // Extract the full title, removing any prefix
    const fullTitle = translation.title.replace(/^#\s*\w+:?\s*/, '');
    const shortCode = translation.translation;
    
    // Store current chapter info before changing translation
    const currentBookId = selectedBookId;
    const currentChapter = selectedChapter;
    
    // Update state
    setSelectedTranslation(fullTitle);
    setSelectedTranslationShort(shortCode);
    
    // Reset search term
    setTranslationSearchTerm("");
    
    // Save to localStorage
    localStorage.setItem('selectedTranslation', fullTitle);
    localStorage.setItem('selectedTranslationShort', shortCode);
    
    // Close the modal
    const modal = document.getElementById('my_modal_2') as HTMLDialogElement;
    if (modal) modal.close();
    
    // If a chapter is currently open, reload it with animation
    if (currentBookId && currentChapter) {
      // First clear the verses to trigger exit animation
      setVerses([]);
      
      // Then fetch and load the new verses after a short delay
      setTimeout(() => {
        handleChapterClick(currentBookId, currentChapter);
      }, 300); // Wait for exit animation to complete
    }
  };

  const toggleBook = async (bookName: string) => {
    const book = books.find(b => b.name === bookName);
    if (!book) return;
  
    if (openBook === bookName) {
      setOpenBook(null);
      return;
    }
  
    if (chapterCounts[book.id]) {
      setOpenBook(bookName);
      updateBookCompletionStatus(book.id, readChapters);      
      return;
    }
  
    setLoadingBooks(prev => ({ ...prev, [book.id]: true }));
  
    try {
      const res = await fetch(`${API_BASE_URL}/translations/${selectedTranslationShort}/books/${book.id}/chapters`);
      const data = await res.json();
      const newChapterCounts = { ...chapterCounts, [book.id]: Object.keys(data).length };
      setChapterCounts(newChapterCounts);
      setOpenBook(bookName);
      updateBookCompletionStatus(book.id, readChapters);
      
      
    } catch (err) {
      console.error(`Failed to fetch chapters for ${bookName}`, err);
    } finally {
      setLoadingBooks(prev => ({ ...prev, [book.id]: false }));
    }
  };

  const handleChapterClick = async (bookId: number, chapter: number) => {
    // Store previous values for animation
    setPrevChapter(selectedChapter);
    setPrevBookId(selectedBookId);
    
    // Update current values
    setSelectedChapter(chapter);
    setSelectedBookId(bookId);
    
    // Reset the selected verse when changing chapters
    // This prevents verse highlighting from persisting when navigating to a different chapter
    setSelectedVerse(null);
    
    try {
      const res = await fetch(
        `${API_BASE_URL}/translations/${selectedTranslationShort}/books/${bookId}/chapters/${chapter}/verses`
      );
      const data = await res.json();
      setVerses(data);
      
      // Scroll to the top of the page after loading chapter data
      window.scrollTo({
        top: 0,
        behavior: 'smooth' // Use smooth scrolling for better UX
      });
      
      // Also scroll the center section to the top if it exists
      const centerSection = document.getElementById('center-section');
      if (centerSection) {
        centerSection.scrollTop = 0;
      }
      
      // Check if we need to update book completion status after loading chapter
      updateBookCompletionStatus(bookId, readChapters);
    } catch (error) {
      console.error("Error fetching verses:", error);
      setVerses([]);
    }
  };
  
  

  // Variables to control the resizing logic
  let startX: number;
  let startWidth: number;
  let startRightX: number;
  let startRightWidth: number;

  const startDrag = (e: ReactMouseEvent<HTMLDivElement>) => {
    document.body.style.userSelect = 'none';
    startX = e.clientX;
    const leftSection = document.getElementById("left-section");
    if (!leftSection) return;
    startWidth = leftSection.offsetWidth - 32;
    document.addEventListener("mousemove", onDrag);
    document.addEventListener("mouseup", stopDrag);
  };

  const startRightDrag = (e: ReactMouseEvent<HTMLDivElement>) => {
    document.body.style.userSelect = 'none';
    setDragging(true);
    startRightX = e.clientX;
    const centerSection = document.getElementById("center-section");
    if (!centerSection) return;
    startRightWidth = centerSection.offsetWidth;
    document.addEventListener("mousemove", onRightDrag);
    document.addEventListener("mouseup", stopRightDrag);
  };

  const onDrag = (e: globalThis.MouseEvent) => {
    const diff = e.clientX - startX;
    const newWidth = startWidth + diff;
    const leftSection = document.getElementById("left-section");
    if (leftSection) {
      leftSection.style.width = `${newWidth}px`;
    }
  };

  const onRightDrag = (e: globalThis.MouseEvent) => {
    const diff = e.clientX - startRightX;
    const newWidth = rightSectionWidth - diff;

    console.log(diff, newWidth, rightSectionWidth);
  
    // // Update right spacer width to match
    const rightSpacer = document.getElementById("right-spacer");
    if (rightSpacer) {
      rightSpacer.style.width = `${newWidth}px`;
    }
  
    setRightSectionWidth(newWidth);
  };
  

  const stopDrag = () => {
    document.body.style.userSelect = '';
    document.removeEventListener("mousemove", onDrag);
    document.removeEventListener("mouseup", stopDrag);
  };

  const stopRightDrag = () => {
    document.body.style.userSelect = '';
    setDragging(false);
    document.removeEventListener("mousemove", onRightDrag);
    document.removeEventListener("mouseup", stopRightDrag);
  };

  // Function to fetch chapters for a book
  const fetchChaptersForBook = async (bookId: number): Promise<void> => {
    try {
      const res = await fetch(`${API_BASE_URL}/translations/${selectedTranslationShort}/books/${bookId}/chapters`);
      const data = await res.json();
      setChapterCounts(prev => ({
        ...prev,
        [bookId]: Object.keys(data).length,
      }));
      return Promise.resolve();
    } catch (error) {
      console.error(`Error fetching chapters for book ${bookId}:`, error);
      return Promise.reject(error);
    }
  };

  const bookContentVariants = {
    hidden: {
      height: 0,
      opacity: 0,
      transition: {
        height: { duration: 0.3, ease: "easeInOut" },
        opacity: { duration: 0.2 }
      }
    },
    visible: {
      height: "auto",
      opacity: 1,
      transition: {
        height: { duration: 0.3, ease: "easeInOut" },
        opacity: { duration: 0.2, delay: 0.1 }
      }
    }
  };

  const chevronVariants = {
    closed: { rotate: 0 },
    open: { rotate: 90 }
  };

  // Create a function to handle display mode changes with tracking
  const handleDisplayModeChange = (newMode: 1 | 2 | 3) => {
    if (newMode === displayMode) return;
    
    // Store prev mode for transition animations
    setPrevDisplayMode(displayMode);
    
    // Update the current display mode
    setDisplayMode(newMode);
    
    // Save to localStorage
    localStorage.setItem('displayMode', newMode.toString());
    
    // Animation logic to handle changing display modes
    const contentContainer = document.getElementById('center-section');
    if (contentContainer) {
      contentContainer.classList.add('transitioning');
      setTimeout(() => {
        contentContainer.classList.remove('transitioning');
      }, 400);
    }
    
    // Update right section visibility
    const rightSpacer = document.getElementById('right-spacer');
    if (rightSpacer) {
      if (newMode === 2) {
        rightSpacer.style.width = `${rightSectionWidth}px`;
      } else {
        rightSpacer.style.width = '0';
      }
    }
  };

  // Enhanced animation variants to handle both display mode and chapter changes
  const contentAnimationVariants = {
    // Initial state (entering)
    initial: (custom: { 
      fromMode?: number; 
      toMode?: number;
      isChapterChange?: boolean;
    }) => {
      // Check if this is a chapter change
      if (custom.isChapterChange) {
        return { opacity: 0, y: 8 };
      }
      
      // For display mode transitions between 1 and 3
      if ((custom.fromMode === 1 && custom.toMode === 3) || 
          (custom.fromMode === 3 && custom.toMode === 1)) {
        return { opacity: 0, y: 8 };
      }
      
      // No animation for other mode transitions
      return { opacity: 1, y: 0 };
    },
    // Animate state (visible)
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" }
    },
    // Exit state (leaving)
    exit: (custom: { 
      fromMode?: number; 
      toMode?: number;
      isChapterChange?: boolean;
    }) => {
      // Check if this is a chapter change
      if (custom.isChapterChange) {
        return { 
          opacity: 0, 
          y: -8,
          transition: { duration: 0.2, ease: "easeIn" }
        };
      }
      
      // For display mode transitions between 1 and 3
      if ((custom.fromMode === 1 && custom.toMode === 3) || 
          (custom.fromMode === 3 && custom.toMode === 1)) {
        return { 
          opacity: 0, 
          y: -8,
          transition: { duration: 0.2, ease: "easeIn" }
        };
      }
      
      // No animation for other mode transitions
      return { 
        opacity: 1, 
        y: 0,
        transition: { duration: 0 }
      };
    }
  };

  // Function to check if a chapter is read
  const isChapterRead = (bookId: number, chapter: number): boolean => {
    const chapterKey = `${bookId}-${chapter}`;
    return !!readChapters[chapterKey];
  };

  // Updated function to check if a book is completed - now uses the completedBooks state
  const isBookCompleted = (bookId: number): boolean => {
    return !!completedBooks[bookId];
  };
  
  // Helper to update book completion status based on read chapters
  const updateBookCompletionStatus = (bookId: number, readChapters: {[key: string]: boolean}) => {
    const totalChapters = chapterCounts[bookId];
    if (totalChapters === undefined) return;

    let readCount = 0;
    for (let i = 1; i <= totalChapters; i++) {
      if (readChapters[`${bookId}-${i}`]) {
        readCount++;
      }
    }
    
    const isCompleted = readCount === totalChapters && totalChapters > 0;
    const bookCompletedKey = bookId.toString();
    
    // Only update if there's a change in completion status
    if (isCompleted !== !!completedBooks[bookId]) {
      const newCompletedBooks = { ...completedBooks };
      
      if (isCompleted) {
        newCompletedBooks[bookId] = true;
        // Show confetti animation when completing a book
        if (!completedBooks[bookId]) {
          // Position confetti based on the open book in the sidebar
          const bookElement = document.getElementById(`book-${bookId}`);
          if (bookElement) {
            const rect = bookElement.getBoundingClientRect();
            const x = rect.right;
            const y = rect.top + rect.height / 2;
            
            // Configure and launch confetti
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { 
                x: x / window.innerWidth,
                y: y / window.innerHeight
              },
              colors: ['#5DC75D', '#36A136', '#B2E5B2', '#4EB14E', '#297629'],
              gravity: 1,
              scalar: 1.2
            });
          }
        }
      } else {
        delete newCompletedBooks[bookId];
      }
      
      setCompletedBooks(newCompletedBooks);
      localStorage.setItem('completedBooks', JSON.stringify(newCompletedBooks));
    }
  };

  // Updated toggle function to also update book completion status
  const toggleChapterReadStatus = (bookId: number, chapter: number) => {
    const chapterKey = `${bookId}-${chapter}`;
    // Check if already marked as read to determine if we're marking or unmarking
    const isCurrentlyRead = !!readChapters[chapterKey];
    
    let updatedReadChapters;
    
    if (isCurrentlyRead) {
      // If already read, remove it from read chapters (unmark)
      updatedReadChapters = { ...readChapters };
      delete updatedReadChapters[chapterKey];
    } else {
      // If not read, mark it as read
      updatedReadChapters = { ...readChapters, [chapterKey]: true };
      // Only trigger confetti when marking as read (not when unmarking)
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6, x: 0.5 },
        colors: ['#FF6B6B', '#FFA94D', '#FFD93D', '#FF7F50', '#FFB347', '#FF5E78', '#F9AFAE', '#F4A261', '#E76F51', '#D26A5C'],
        zIndex: 9999,
      });
    }
    
    // Update state
    setReadChapters(updatedReadChapters);
    
    // Save to localStorage
    localStorage.setItem('readChapters', JSON.stringify(updatedReadChapters));
    
    // Update book completion status
    updateBookCompletionStatus(bookId, updatedReadChapters);
  };

  // Function to handle search logic
  const handleSearch = (queryOverride?: string) => {
    // Reset previous search results
    setSearchResults(null);
    
    // Use the override query if provided, otherwise use the state value
    const queryToUse = queryOverride !== undefined ? queryOverride : searchQuery;
    
    if (!queryToUse.trim()) return;
    
    // Parse search query - need to handle book names with spaces like "I Kings"
    const query = queryToUse.trim();
    
    // First, check if any book name is a complete prefix of the search query
    // Sort by length (descending) to match longest book names first
    const sortedBooks = [...books].sort((a, b) => b.name.length - a.name.length);
    
    let matchedBook: Book | undefined;
    let remainingQuery = '';
    
    // Try to find if any book name is at the start of the query
    for (const book of sortedBooks) {
      // Check if query starts with book name followed by space or end of string
      const bookNameWithSpace = book.name + ' ';
      if (query.toLowerCase() === book.name.toLowerCase() || 
          query.toLowerCase().startsWith(book.name.toLowerCase() + ' ')) {
        matchedBook = book;
        // Extract the remaining part of the query (after the book name)
        remainingQuery = query.slice(book.name.length).trim();
        break;
      }
    }
    
    // If no book name match found, try the old parsing method for backward compatibility
    if (!matchedBook) {
      return handleLegacySearch(query);
    }
    
    // Book found, now parse the remaining query for chapter and verse
    if (remainingQuery === '') {
      // Only book is specified - Need to fetch chapter count if not already loaded
      handleBookOnlySearch(matchedBook);
      return;
    }
    
    // Parse chapter and verse - expected formats:
    // "1" (chapter only)
    // "1:1" (chapter and verse)
    
    // Check for chapter:verse format first
    const chapterVerseMatch = remainingQuery.match(/^(\d+):(\d+)$/);
    if (chapterVerseMatch) {
      const chapterNum = parseInt(chapterVerseMatch[1]);
      const verseNum = parseInt(chapterVerseMatch[2]);
      
      if (isNaN(chapterNum) || isNaN(verseNum)) {
        // Invalid chapter or verse
        setSearchResults({
          type: 'error',
          message: `Invalid chapter or verse: ${remainingQuery}`
        });
        return;
      }
      
      handleBookChapterVerseSearch(matchedBook, chapterNum, verseNum);
      return;
    }
    
    // Try chapter only format
    const chapterMatch = remainingQuery.match(/^(\d+)$/);
    if (chapterMatch) {
      const chapterNum = parseInt(chapterMatch[1]);
      
      if (isNaN(chapterNum)) {
        // Invalid chapter
        setSearchResults({
          type: 'chapter',
          bookId: matchedBook.id,
          bookName: matchedBook.name,
          chapter: null
        });
        return;
      }
      
      handleBookChapterSearch(matchedBook, chapterNum);
      return;
    }
    
    // If we got here, the format after the book name is not recognized
    setSearchResults({
      type: 'error',
      message: `Invalid format. Try "${matchedBook.name} 1" for chapter or "${matchedBook.name} 1:1" for verse.`
    });
  };
  
  // Helper for handling legacy search format
  const handleLegacySearch = (query: string) => {
    // Fallback to the old split method for backward compatibility
    const parts = query.split(/[\s:]+/);
    
    if (parts.length === 0) return;
    
    // Try to find the book - first with exact match, then with fuzzy match
    const bookQuery = parts[0].toLowerCase();
    
    // Try exact match first
    let matchedBook = books.find(book => 
      book.name.toLowerCase() === bookQuery
    );
    
    // If no exact match, check for multiple matches (like "Kings" matching "1 Kings" and "2 Kings")
    const multipleMatches = books.filter(book => 
      book.name.toLowerCase().includes(bookQuery) && 
      bookQuery.length >= 3 // Require at least 3 characters to avoid too many matches
    );
    
    if (multipleMatches.length > 1 && !matchedBook) {
      // Show all matching books
      setSearchResults({
        type: 'multiple_books',
        matchingBooks: multipleMatches
      });
      return;
    }
    
    // If no exact match, try starts with
    if (!matchedBook) {
      matchedBook = books.find(book => 
        book.name.toLowerCase().startsWith(bookQuery)
      );
    }
    
    // If still no match, try includes
    if (!matchedBook) {
      matchedBook = books.find(book => 
        book.name.toLowerCase().includes(bookQuery)
      );
    }
    
    // If still no match, try to find books that match parts of the query
    if (!matchedBook) {
      // Find books that match at least one word in the query
      const queryWords = bookQuery.split(/\s+/);
      
      // Find books that contain any of the words in the query
      const possibleMatches = books.filter(book => {
        const bookNameLower = book.name.toLowerCase();
        return queryWords.some(word => 
          word.length > 2 && bookNameLower.includes(word)
        );
      });
      
      if (possibleMatches.length > 0) {
        // Show suggestions instead
        setSearchResults({
          type: 'suggestions',
          suggestions: possibleMatches.slice(0, 5) // Limit to 5 suggestions
        });
        return;
      }
      
      // No matching book found
      setSearchResults({
        type: 'book',
        bookName: null
      });
      return;
    }
    
    // Book found, check if chapter is specified
    if (parts.length === 1) {
      // Only book is specified
      handleBookOnlySearch(matchedBook);
      return;
    }
    
    const chapterNum = parseInt(parts[1]);
    if (isNaN(chapterNum)) {
      // Invalid chapter number
      setSearchResults({
        type: 'chapter',
        bookId: matchedBook.id,
        bookName: matchedBook.name,
        chapter: null
      });
      return;
    }
    
    // Handle chapter search (with possible verse)
    if (parts.length === 2) {
      handleBookChapterSearch(matchedBook, chapterNum);
      return;
    }
    
    // Check if verse is specified
    const verseNum = parseInt(parts[2]);
    if (isNaN(verseNum)) {
      // Invalid verse number
      setSearchResults({
        type: 'verse',
        bookId: matchedBook.id,
        bookName: matchedBook.name,
        chapter: chapterNum,
        verse: null
      });
      return;
    }
    
    // For verse search
    handleBookChapterVerseSearch(matchedBook, chapterNum, verseNum);
  };
  
  // Helper for handling book-only search
  const handleBookOnlySearch = (matchedBook: Book) => {
    // Need to fetch chapter count if not already loaded
    if (!chapterCounts[matchedBook.id]) {
      // Start loading indicator
      setSearchResults({
        type: 'loading',
        bookName: matchedBook.name,
        bookId: matchedBook.id
      });
      
      // Fetch chapters for this book
      fetch(`${API_BASE_URL}/translations/${selectedTranslationShort}/books/${matchedBook.id}/chapters`)
        .then(res => res.json())
        .then(data => {
          const totalChapters = Object.keys(data).length;
          // Update chapter counts
          setChapterCounts(prev => ({ ...prev, [matchedBook.id]: totalChapters }));
          
          // Update search results with chapter count
          setSearchResults({
            type: 'book',
            bookId: matchedBook.id,
            bookName: matchedBook.name,
            chapterCount: totalChapters
          });
        })
        .catch(error => {
          console.error("Error fetching chapters:", error);
          // Still show the book, but with unknown chapter count
          setSearchResults({
            type: 'book',
            bookId: matchedBook.id,
            bookName: matchedBook.name,
            chapterCount: 0
          });
        });
    } else {
      // We already have the chapter count
      setSearchResults({
        type: 'book',
        bookId: matchedBook.id,
        bookName: matchedBook.name,
        chapterCount: chapterCounts[matchedBook.id]
      });
    }
  };
  
  // Helper for handling book+chapter search
  const handleBookChapterSearch = (matchedBook: Book, chapterNum: number) => {
    // Check if chapter exists for this book (load chapters if needed)
    if (!chapterCounts[matchedBook.id]) {
      // Need to load chapters first
      setSearchResults({
        type: 'loading',
        bookName: matchedBook.name,
        bookId: matchedBook.id
      });
      
      // Load chapters
      fetch(`${API_BASE_URL}/translations/${selectedTranslationShort}/books/${matchedBook.id}/chapters`)
        .then(res => res.json())
        .then(data => {
          // Update chapter counts
          const totalChapters = Object.keys(data).length;
          setChapterCounts(prev => ({ ...prev, [matchedBook.id]: totalChapters }));
          
          // Check if chapter is valid
          if (chapterNum < 1 || chapterNum > totalChapters) {
            // Chapter out of range
            setSearchResults({
              type: 'chapter',
              bookId: matchedBook.id,
              bookName: matchedBook.name,
              chapter: null,
              chapterCount: totalChapters
            });
          } else {
            // Valid chapter
            setSearchResults({
              type: 'chapter',
              bookId: matchedBook.id,
              bookName: matchedBook.name,
              chapter: chapterNum
            });
          }
        })
        .catch(error => {
          console.error("Error loading chapters:", error);
          setSearchResults({
            type: 'error',
            message: "Error loading chapter information. Please try again."
          });
        });
      
      return;
    }
    
    // Check if chapter is valid
    const totalChapters = chapterCounts[matchedBook.id];
    if (chapterNum < 1 || chapterNum > totalChapters) {
      // Chapter out of range
      setSearchResults({
        type: 'chapter',
        bookId: matchedBook.id,
        bookName: matchedBook.name,
        chapter: null,
        chapterCount: totalChapters
      });
    } else {
      // Valid chapter
      setSearchResults({
        type: 'chapter',
        bookId: matchedBook.id,
        bookName: matchedBook.name,
        chapter: chapterNum
      });
    }
  };
  
  // Helper for handling book+chapter+verse search
  const handleBookChapterVerseSearch = (matchedBook: Book, chapterNum: number, verseNum: number) => {
    // Check if chapter exists for this book (load chapters if needed)
    if (!chapterCounts[matchedBook.id]) {
      // Need to load chapters first
      setSearchResults({
        type: 'loading',
        bookName: matchedBook.name,
        bookId: matchedBook.id
      });
      
      // Load chapters
      fetch(`${API_BASE_URL}/translations/${selectedTranslationShort}/books/${matchedBook.id}/chapters`)
        .then(res => res.json())
        .then(data => {
          // Update chapter counts
          const totalChapters = Object.keys(data).length;
          setChapterCounts(prev => ({ ...prev, [matchedBook.id]: totalChapters }));
          
          // Check if chapter is valid
          if (chapterNum < 1 || chapterNum > totalChapters) {
            // Chapter out of range
            setSearchResults({
              type: 'chapter',
              bookId: matchedBook.id,
              bookName: matchedBook.name,
              chapter: null,
              chapterCount: totalChapters
            });
          } else {
            // Valid chapter, continue with verse search
            fetchVerse(matchedBook.id, chapterNum, verseNum);
          }
        })
        .catch(error => {
          console.error("Error loading chapters:", error);
          setSearchResults({
            type: 'error',
            message: "Error loading chapter information. Please try again."
          });
        });
      
      return;
    }
    
    // Check if chapter is valid
    const totalChapters = chapterCounts[matchedBook.id];
    if (chapterNum < 1 || chapterNum > totalChapters) {
      // Chapter out of range
      setSearchResults({
        type: 'chapter',
        bookId: matchedBook.id,
        bookName: matchedBook.name,
        chapter: null,
        chapterCount: totalChapters
      });
    } else {
      // Valid chapter, continue with verse search
      fetchVerse(matchedBook.id, chapterNum, verseNum);
    }
  };
  
  // Function to fetch a specific verse
  const fetchVerse = async (bookId: number, chapter: number, verse: number) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/translations/${selectedTranslationShort}/books/${bookId}/chapters/${chapter}/verses`
      );
      const data = await res.json();
      
      // Find the specific verse
      const verseData = data.find((v: { verse: number }) => v.verse === verse);
      
      if (verseData) {
        setSearchResults({
          type: 'verse',
          bookId,
          bookName: books.find(b => b.id === bookId)?.name,
          chapter,
          verse,
          verseContent: verseData.text
        });
      } else {
        // Verse not found
        setSearchResults({
          type: 'verse',
          bookId,
          bookName: books.find(b => b.id === bookId)?.name,
          chapter,
          verse: null
        });
      }
    } catch (error) {
      console.error("Error fetching verse:", error);
      setSearchResults({
        type: 'verse',
        bookId,
        bookName: books.find(b => b.id === bookId)?.name,
        chapter,
        verse: null
      });
    }
  };
  
  // Function to navigate to a book/chapter/verse
  const navigateToLocation = (bookId: number, chapter: number, verse?: number) => {
    // Load the chapter
    handleChapterClick(bookId, chapter);
    
    // Open the book in the sidebar
    const book = books.find(b => b.id === bookId);
    if (book && openBook !== book.name) {
      toggleBook(book.name);
    }
    
    // Close the search modal
    const modal = document.getElementById('search_modal') as HTMLDialogElement;
    if (modal) modal.close();
    
    // Reset search
    setSearchQuery("");
    setSearchResults(null);
    
    if (verse) {
      setTimeout(() => {
        const verseElement = document.getElementById(`verse-${verse}`);
        if (verseElement) {
          verseElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          verseElement.classList.add("!bg-[var(--border)]");
          
          if (displayMode !== 1) {
            const parent = verseElement.parentElement;
            let nextSibling = verseElement.nextElementSibling;
            
            while (nextSibling && nextSibling.tagName !== 'STRONG') {
              nextSibling.classList.add("!bg-[var(--border)]");
              nextSibling = nextSibling.nextElementSibling;
            }
          }
        }
      }, 800);
    }
  };

  // Handle navigating to the next chapter
  const handleNextChapter = () => {
    if (!selectedBookId || !selectedChapter) return;
    
    // Find the current book
    const currentBookIndex = books.findIndex(book => book.id === selectedBookId);
    if (currentBookIndex === -1) return;
    
    const currentBook = books[currentBookIndex];
    const totalChapters = chapterCounts[currentBook.id] || 0;
    
    // If there are more chapters in this book
    if (selectedChapter < totalChapters) {
      handleChapterClick(selectedBookId, selectedChapter + 1);
    } else {
      // If we're at the last chapter of the book, move to the next book
      if (currentBookIndex < books.length - 1) {
        const nextBook = books[currentBookIndex + 1];
        setOpenBook(nextBook.name);
        
        // Fetch chapters for the next book if needed
        if (!chapterCounts[nextBook.id]) {
          fetchChaptersForBook(nextBook.id).then(() => {
            // Once we have chapters, navigate to chapter 1
            handleChapterClick(nextBook.id, 1);
          });
        } else {
          // If we already have chapters, navigate directly
          handleChapterClick(nextBook.id, 1);
        }
      }
    }
  };
  
  // Handle verse hover
  const handleVerseHover = (verse: number | null) => {
    setHoveredVerse(verse);
  };
  
  // Handle context menu visibility
  const handleContextMenu = (e: ReactMouseEvent, verse: number) => {
    e.preventDefault();
    
    // Set context menu position and verse
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      verse: verse
    });
  };
  
  // Handle normal click on verse to show context menu
  const handleVerseClick = (e: ReactMouseEvent, verse: number) => {
    e.preventDefault();
    
    // Set context menu position and verse
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      verse: verse
    });
  };
  
  // Close context menu
  const closeContextMenu = () => {
    setContextMenu(null);
  };
  
  // Save a note
  const handleSaveNote = (text: string, category: string) => {
    if (!selectedBookId || !selectedChapter || !contextMenu) return;
    
    // Create a new note
    const newNote: Note = {
      id: `note-${Date.now()}`,
      bookId: selectedBookId,
      bookName: books.find(b => b.id === selectedBookId)?.name || '',
      chapter: selectedChapter,
      verse: contextMenu.verse,
      text,
      category,
      createdAt: Date.now()
    };
    
    // Update state and localStorage
    const updatedNotes = [...notes, newNote];
    setNotes(updatedNotes);
    localStorage.setItem('notes', JSON.stringify(updatedNotes));
    
    // Close the context menu
    closeContextMenu();
  };
  
  // Get verse text by verse number
  const getVerseText = (verseNumber: number): string => {
    const verse = verses.find(v => v.verse === verseNumber);
    return verse ? verse.text : '';
  };
  
  // Handle document click to close context menu when clicking outside
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      // Skip if context menu is not visible
      if (!contextMenu?.visible) return;
      
      // Check if the click is inside the context menu
      const contextMenuElement = document.getElementById('verse-context-menu');
      if (contextMenuElement && !contextMenuElement.contains(e.target as Node)) {
        closeContextMenu();
      }
    };
    
    // Add event listener
    document.addEventListener('click', handleDocumentClick);
    
    // Clean up
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [contextMenu]);

  // Add useEffect for URL parameters at the end of other useEffects
  useEffect(() => {
    // Only process URL parameters once and only after books are loaded
    if (books.length > 0 && !urlParamsProcessed.current) {
      const bookId = searchParams.get('book');
      const chapter = searchParams.get('chapter');
      const verse = searchParams.get('verse');
      const urlDisplayMode = searchParams.get('display');
      const translation = searchParams.get('translation');
      
      // Handle display mode from URL
      if (urlDisplayMode) {
        const displayModeNum = parseInt(urlDisplayMode);
        if (!isNaN(displayModeNum) && [1, 2, 3].includes(displayModeNum)) {
          setDisplayMode(displayModeNum as 1 | 2 | 3);
        }
      }
      
      // Handle translation from URL if it exists
      if (translation && translation !== selectedTranslationShort) {
        const matchingTranslation = translations.find(t => t.translation === translation);
        if (matchingTranslation) {
          setSelectedTranslation(matchingTranslation.title);
          setSelectedTranslationShort(translation);
        }
      }
      
      if (bookId && chapter) {
        const bookIdNum = parseInt(bookId);
        const chapterNum = parseInt(chapter);
        
        if (!isNaN(bookIdNum) && !isNaN(chapterNum)) {
          const book = books.find(b => b.id === bookIdNum);
          if (book) {
            // Mark as processed to prevent infinite loops
            urlParamsProcessed.current = true;
            
            // Use the lower-level functions to avoid chained state updates
            if (openBook !== book.name) {
              setOpenBook(book.name);
            }
            
            setSelectedBookId(bookIdNum);
            setSelectedChapter(chapterNum);
            
            // Fetch the verses directly
            fetch(`${API_BASE_URL}/translations/${selectedTranslationShort}/books/${bookIdNum}/chapters/${chapterNum}/verses`)
              .then(res => res.json())
              .then(data => {
                setVerses(data);
                
                // Handle verse scrolling after content is loaded
                if (verse) {
                  const verseNum = parseInt(verse);
                  if (!isNaN(verseNum)) {
                    setSelectedVerse(verseNum);
                    
                    // Allow time for the render to complete
                    setTimeout(() => {
                      // Get the main verse element
                      const verseElement = document.getElementById(`verse-${verseNum}`);
                      if (verseElement) {
                        // Scroll to the verse
                        verseElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        
                        // Add highlight to the verse number
                        verseElement.classList.add("bg-[var(--border)]");
                        
                        // For display modes 2 and 3, highlight all words in the verse
                        if (displayMode === 2 || displayMode === 3) {
                          // Get all spans that belong to this verse
                          const verseWords = document.querySelectorAll(`[data-verse="${verseNum}"]`);
                          verseWords.forEach(el => {
                            (el as HTMLElement).classList.add("bg-[var(--border)]");
                          });
                        }
                      }
                    }, 1000);
                  }
                }
              })
              .catch(error => {
                console.error("Error fetching verses:", error);
              });
          }
        }
      }
    }
  }, [books, searchParams, selectedTranslationShort, translations, displayMode]);

  // Function to get the share URL of the current chapter or verse
  const getShareUrl = () => {
    if (!selectedBookId || !selectedChapter) return '';
    
    const baseUrl = window.location.origin;
    const bookName = books.find(b => b.id === selectedBookId)?.name || '';
    const verseParam = shareVerse ? `&verse=${shareVerse}` : '';
    const translationParam = `&translation=${selectedTranslationShort}`;
    const displayModeParam = `&display=${displayMode}`;
    
    return `${baseUrl}?book=${selectedBookId}&chapter=${selectedChapter}${verseParam}${translationParam}${displayModeParam}`;
  };
  
  // Function to copy the URL to clipboard
  const copyToClipboard = async () => {
    const shareUrl = getShareUrl();
    if (!shareUrl) return;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setCopySuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Failed to copy: ', err);
      setCopySuccess(false);
    }
  };

  // Function to handle verse selection for sharing
  const handleShareVerseSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const verseNum = parseInt(event.target.value);
    if (!isNaN(verseNum)) {
      setShareVerse(verseNum);
    } else {
      setShareVerse(null);
    }
  };

  // Add useEffect to remove URL query parameters after they've been processed
  useEffect(() => {
    // Only run this after initial data has been loaded and processed
    if (!isInitialRender || !verses.length) return;
    
    // Get current URL and check if it has query parameters
    const hasQueryParams = window.location.search !== '';
    
    if (hasQueryParams && typeof window !== 'undefined') {
      // Use history API to update URL without page refresh
      const url = window.location.pathname;
      window.history.replaceState({}, document.title, url);
    }
    
    // Mark initial render as complete
    setIsInitialRender(false);
  }, [isInitialRender, verses.length]);

  return (
    <main className="min-h-screen h-full bg-[var(--background)] text-black p-[0px] m-[0px]">
      <header className="w-full h-[60px] bg-[var(--foreground)] text-[var(--primary-black)] flex items-center justify-center border-b-[1px] border-[var(--border)]">
        <div
          tabIndex={0}
          role="button"
          className="flex items-center text-[var(--primary-gray)] text-[15px] cursor-pointer font-primary gap-[4px] h-[32px] px-[10px] bg-[var(--background)] text-[#555555] font-medium rounded-[12px] shadow-[0_0_14px_0_rgba(108,103,97,0.06)] border-none hover:bg-[#f0ece6] transition-all duration-200"
          onClick={() => {
            const modal = document.getElementById('my_modal_2') as HTMLDialogElement;
            if (modal) {
              // Reset search term when opening modal
              setTranslationSearchTerm("");
              modal.showModal();
            }
          }}
        >
          {selectedTranslationShort}
          <ChevronDown size={16} className="text-[var(--primary-gray)]" />
        </div>

        <dialog id="my_modal_2" className="modal">
          <div className="modal-box p-[12px] rounded-[14px] bg-[var(--background)]">
            <input
              type="text"
              placeholder={`Search from ${translations.length} translations`}
              className="w-full text-[var(--primary-black)] shadow-[0_0_14px_0_rgba(108,103,97,0.06)] outline-[1px] outline-[#F1EBE1] bg-[var(--foreground)] border-none rounded-[12px] px-[16px] py-[12px] placeholder:text-[var(--primary-gray)] box-border"
              onChange={handleTranslationSearchChange}
              autoFocus
            />
            <div className="flex justify-between items-center mt-2">
              <div className="flex-grow"></div>
              <p className="font-primary text-[12px] mt-[8px]">
                Powered by <a className="text-blue-500 no-underline" href="https://github.com/scrollmapper/bible_databases" target="_blank" rel="noopener noreferrer">scrollmapper</a>
              </p>
            </div>
            <div className="max-h-[50vh] overflow-y-auto mt-[12px]">
              {filteredTranslations().map((translation, index) => (
                <div
                  key={index}
                  className="text-sm text-[var(--primary-black)] font-primary px-[18px] py-[12px] rounded-[8px] hover:bg-[var(--foreground)] transition-all duration-200 text-[14px] cursor-pointer"
                  onClick={() => handleTranslationSelect(translation)}
                >
                  {translation.title.replace(/^#\s*/, '')}
                </div>
              ))}
            </div>
          </div>
          <form method="dialog" className="modal-backdrop opacity-0">
            <button>close</button>
          </form>
        </dialog>

        <h1 className="font-primary font-[400] text-[24px] mx-[20px]">{selectedTranslation}</h1>
        
        <Link 
          href="/notes" 
          className="flex items-center text-[var(--primary-gray)] text-[15px] cursor-pointer font-primary h-[32px] px-[10px] bg-[var(--background)] text-[#555555] font-medium rounded-[12px] shadow-[0_0_14px_0_rgba(108,103,97,0.06)] border-none hover:bg-[#f0ece6] transition-all duration-200 no-underline"
        >
          Notes
        </Link>
      </header>

      <div className="container mx-auto px-4 mr-[10px] flex h-full text-[var(--primary-black)]">
        <div id="left-section" className="w-1/3 p-[16px] overflow-auto flex justify-end">
          <div className="space-y-2 text-[26px] font-primary mt-[20px]">
            {books.map((book) => (
              <div key={book.name}>
                <div
                  id={`book-${book.id}`}
                  className={`cursor-pointer flex items-center gap-[6px] mb-[16px] transition-colors duration-200 ${
                    isBookCompleted(book.id) 
                      ? "text-[#5DC75D]" // Green text for completed books
                      : "hover:text-primary-600"
                  }`}
                  onClick={() => toggleBook(book.name)}
                >
                  {book.name}
                  <motion.div
                    initial="closed"
                    animate={openBook === book.name ? "open" : "closed"}
                    variants={chevronVariants}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronRight size={20} className={isBookCompleted(book.id) ? "text-[#5DC75D]" : ""} />
                  </motion.div>
      </div>

                <AnimatePresence>
                  {openBook === book.name && !loadingBooks[book.id] && (
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      variants={bookContentVariants}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-5 gap-x-[10px] gap-y-[10px] max-w-fit mt-[16px] mb-[36px] px-[1px]">
                        {Array.from({ length: chapterCounts[book.id] || 0 }, (_, i) => (
                          <motion.button
                            key={i}
                            className={`w-[40px] h-[40px] font-primary rounded-[6px] border ${
                              selectedBookId === book.id && selectedChapter === i + 1
                                ? isChapterRead(book.id, i + 1)
                                  ? "bg-[#d4ffd4] border-[#5DC75D]" // Darker green for selected + read
                                  : "bg-[var(--foreground)] border-[var(--border)]" // Default selected
                                : isChapterRead(book.id, i + 1)
                                ? "border-[#5DC75D] bg-[#EEFFEE] !text-[#5DC75D]" // Read but not selected
                                : "border-[var(--border)] bg-transparent" // Unread
                            } text-sm flex items-center justify-center text-[var(--primary-black)] hover:bg-primary-50 hover:border-primary-200 transition-all duration-50`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleChapterClick(book.id, i + 1)}
                          >
                            {i + 1}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* Left Divider */}
        {/* <div
          className="w-[2px] cursor-col-resize bg-[var(--border)] min-h-[calc(100vh-60px)]"
          onMouseDown={startDrag}
        ></div> */}

        <div
          className="relative w-[10px] min-h-[calc(100vh-60px)] flex items-start justify-center cursor-col-resize"
          onMouseDown={startDrag}
        >
          <div className="w-[1px] cursor-col-resize bg-[var(--border)] min-h-[calc(100vh-60px)] h-full" />
          <div className="shadow-[0_0_14px_0_rgba(108,103,97,0.06)] flex justify-center items-center absolute mt-[24px] -translate-y-1/2 w-[24px] h-[24px] rounded-full bg-[var(--foreground)] border-[1px] border-[var(--border)]">
              <SeparatorVertical size={16} className="text-[var(--border)]" />
          </div>
        </div>



        {/* Center/Text Section */}
        <div 
          id="center-section" 
          className="flex-1 bg-white p-4 overflow-auto p-[24px]"
        >
          
          <motion.div layout transition={{ type: "spring", stiffness: 300, damping: 30 }} className="flex justify-between items-center mb-[24px]">
            {/* Mark as Read button - only show if there are verses and selectedBookId/Chapter are set */}
            <AnimatePresence>
              {selectedBookId && selectedChapter ? (
                <motion.div
                  key="read-button"
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -50, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="flex justify-start"
                >
                  <button 
                    className={`
                      px-[12px] py-[6px] rounded-[12px] mt-[4px] border shadow-sm font-primary cursor-pointer
                      shadow-[0_0_14px_0_rgba(108,103,97,0.06)]
                      transition-all duration-200
                      ${selectedBookId !== null && selectedChapter !== null && isChapterRead(selectedBookId, selectedChapter) 
                        ? "bg-[#EEFFEE] text-[#5DC75D] border-[#5DC75D]"
                        : "bg-[var(--foreground)] text-[var(--primary-black)] border-[var(--border)] hover:bg-[#f0ece6]"}
                    `}
                    onClick={() => selectedBookId !== null && selectedChapter !== null && toggleChapterReadStatus(selectedBookId, selectedChapter)}
                  >
                    {selectedBookId !== null && selectedChapter !== null && isChapterRead(selectedBookId, selectedChapter) 
                      ? "Marked as Read" 
                      : "Mark as Read"}
                  </button>
                </motion.div>
              ) : (
                <div></div> /* Empty div to maintain layout when button is not shown */
              )}
            </AnimatePresence>

            <div className="flex items-center gap-[12px]">
              {/* Search Button */}
              <button
                className="px-[12px] h-[36px] font-primary
                  shadow-[0_0_14px_0_rgba(108,103,97,0.06)] rounded-[12px] border border-[#F1ECE5] shadow-sm
                  bg-transparent text-[#684242] hover:bg-[#f0ece6]
                  transition-all duration-200 flex items-center gap-[6px] cursor-pointer"
                onClick={() => {
                  // Reset search when opening modal
                  setSearchQuery("");
                  setSearchResults(null);
                  const modal = document.getElementById('search_modal') as HTMLDialogElement;
                  if (modal) modal.showModal();
                }}
              >
                <Search size={16} className="text-[#684242]" />
                <span>Search</span>
              </button>
              
              {/* Share Button */}
              <button
                className="px-[12px] h-[36px] font-primary
                  shadow-[0_0_14px_0_rgba(108,103,97,0.06)] rounded-[12px] border border-[#F1ECE5] shadow-sm
                  bg-transparent text-[#684242] hover:bg-[#f0ece6]
                  transition-all duration-200 flex items-center gap-[6px] cursor-pointer"
                onClick={() => {
                  // Reset copy success state when opening modal
                  setCopySuccess(false);
                  const modal = document.getElementById('share_modal') as HTMLDialogElement;
                  if (modal) modal.showModal();
                }}
              >
                <Share2 size={16} className="text-[#684242]" />
                <span>Share</span>
              </button>

              {/* Search Modal */}
              <dialog id="search_modal" className="modal">
                <div className="modal-box p-[12px] rounded-[14px] bg-[var(--background)]">
                  <div className="relative flex items-center w-full">
                    <input
                      type="text"
                      placeholder="Search"
                      className="w-full text-[var(--primary-black)] shadow-[0_0_14px_0_rgba(108,103,97,0.06)] outline-[1px] outline-[#F1EBE1] bg-[var(--foreground)] border-none rounded-[12px] px-[16px] py-[12px] placeholder:text-[var(--primary-gray)] box-border"
                      value={searchQuery}
                      onChange={handleSearchInputChange}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSearch();
                        }
                      }}
                      autoFocus
                    />
                    <div
                      className="absolute right-[16px] top-1/2 -translate-y-1/2 cursor-pointer"
                      onClick={() => handleSearch()}
                    >
                      <Search className="text-[#684242]" size={16} />
                    </div>
                  </div>

                  
                  <div className="mt-[12px] p-[12px] text-sm text-[var(--primary-gray)] font-primary">
                    <p className="text-[var(--primary-black)]">Search examples:</p>
                    <ul className="list-none pl-5 mt-[9px]">
                      <li><b className="font-[600] text-[var(--primary-black)]">John</b> - Find the book of John</li>
                      <li><b className="font-[600] text-[var(--primary-black)]">John 3</b> - Go to chapter 3</li>
                      <li><b className="font-[600] text-[var(--primary-black)]">John 3:16</b> - Find specific verses</li>
                    </ul>
                  </div>
                  
                  {/* Search Results */}
                  {searchResults && (
                    <motion.div 
                      className="mt-[24px] p-[12px] bg-[var(--foreground)] rounded-[12px] border border-[var(--border)]"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                      {searchResults.type === 'loading' && (
                        <motion.div 
                          className="flex flex-col items-center justify-center gap-2 py-4"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-black)]"></div>
                          <p className="text-sm text-[var(--primary-gray)]">
                            {searchResults.bookId 
                              ? `Loading chapter information for ${searchResults.bookName}...`
                              : 'Loading...'}
                          </p>
                        </motion.div>
                      )}
                      
                      {searchResults.type === 'error' && (
                        <motion.div 
                          className="text-red-500"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          {searchResults.message}
                        </motion.div>
                      )}
                      
                      {searchResults.type === 'multiple_books' && searchResults.matchingBooks && (
                        <motion.div 
                          className="flex flex-col gap-2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <h3 className="text-lg font-primary font-medium">Multiple books found:</h3>
                          <div className="grid grid-cols-2 gap-[6px] mt-[12px]">
                            {searchResults.matchingBooks.map((book, index) => (
                              <motion.button 
                                key={book.id}
                                className="text-left bg-transparent p-[6px] rounded-[8px] hover:bg-[var(--background)] transition-all duration-200 border border-[var(--border)]"
                                onClick={() => {
                                  setSearchQuery(book.name);
                                  // Pass book name directly to ensure search uses the new value
                                  handleSearch(book.name);
                                }}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                              >
                                {book.name}
                              </motion.button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                      
                      {searchResults.type === 'suggestions' && searchResults.suggestions && (
                        <motion.div 
                          className="flex flex-col gap-2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <h3 className="text-lg font-primary font-medium">Did you mean:</h3>
                          <div className="flex flex-col gap-1">
                            {searchResults.suggestions.map((book, index) => (
                              <motion.button 
                                key={book.id}
                                className="text-left py-2 px-3 rounded-[8px] hover:bg-[var(--background)] transition-all duration-200"
                                onClick={() => {
                                  setSearchQuery(book.name);
                                  // Pass book name directly to ensure search uses the new value
                                  handleSearch(book.name);
                                }}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                              >
                                {book.name}
                              </motion.button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                      
                      {searchResults.type === 'book' && searchResults.bookName && (
                        <motion.div 
                          className="flex flex-col gap-[6px]"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <h3 className="text-lg font-primary font-medium">{searchResults.bookName}</h3>
                          <p className="text-sm text-[var(--primary-gray)]">
                            {searchResults.chapterCount} chapters
                          </p>
                          <motion.button
                            className="mt-2 bg-[var(--background)] px-4 h-[28px] rounded-[12px] border border-[var(--border)] hover:bg-[#f0ece6] transition-all duration-200 text-[var(--primary-black)] font-primary flex items-center justify-center text-xs"
                            onClick={() => searchResults.bookId && navigateToLocation(searchResults.bookId, 1)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Go to Chapter 1
                          </motion.button>
                        </motion.div>
                      )}
                      
                      {searchResults.type === 'book' && !searchResults.bookName && (
                        <motion.div 
                          className="text-[var(--primary-gray)]"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          No matching book found. Try using the full book name.
                        </motion.div>
                      )}
                      
                      {searchResults.type === 'chapter' && (
                        <motion.div 
                          className="flex flex-col gap-[6px]"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <h3 className="text-lg font-primary font-medium">{searchResults.bookName}</h3>
                          {searchResults.chapter ? (
                            <>
                              <p className="text-sm text-[var(--primary-gray)]">
                                Chapter {searchResults.chapter}
                              </p>
                              <motion.button
                                className="mt-2 bg-[var(--background)] px-4 h-[28px] rounded-[12px] border border-[var(--border)] hover:bg-[#f0ece6] transition-all duration-200 text-[var(--primary-black)] font-primary flex items-center justify-center text-xs"
                                onClick={() => searchResults.bookId && searchResults.chapter && navigateToLocation(searchResults.bookId, searchResults.chapter)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                Go to Chapter
                              </motion.button>
                            </>
                          ) : (
                            <p className="text-sm text-[var(--primary-gray)]">
                              {searchResults.chapterCount 
                                ? `Invalid chapter. This book has ${searchResults.chapterCount} chapters.` 
                                : "Invalid chapter."}
                            </p>
                          )}
                        </motion.div>
                      )}
                      
                      {searchResults.type === 'verse' && (
                        <motion.div 
                          className="flex flex-col gap-[6px]"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <h3 className="text-lg font-primary font-medium">
                            {searchResults.bookName} {searchResults.chapter}:{searchResults.verse}
                          </h3>
                          {searchResults.verse && searchResults.verseContent ? (
                            <>
                              <motion.div 
                                className="mt-2 p-3 rounded-[8px] font-primary text-[var(--primary-black)]"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.1 }}
                              >
                                <p>
                                  <strong>{searchResults.verse}</strong> {searchResults.verseContent}
                                </p>
                              </motion.div>
                              <motion.button
                                className="mt-2 bg-[var(--background)] px-4 h-[28px] rounded-[12px] border border-[var(--border)] hover:bg-[#f0ece6] transition-all duration-200 text-[var(--primary-black)] font-primary flex items-center justify-center text-xs"
                                onClick={() => searchResults.bookId && searchResults.chapter && searchResults.verse && navigateToLocation(searchResults.bookId, searchResults.chapter, searchResults.verse)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                Go to Verse
                              </motion.button>
                            </>
                          ) : (
                            <p className="text-sm text-[var(--primary-gray)]">
                              Verse not found.
                            </p>
                          )}
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </div>
                <form method="dialog" className="modal-backdrop opacity-0">
                  <button>close</button>
                </form>
              </dialog>
              
              {/* Share Modal */}
              <dialog id="share_modal" className="modal">
                <div className="modal-box p-[12px] rounded-[14px] bg-[var(--background)]">
                  <h3 className="text-lg font-primary font-medium mb-[16px]">Share Link</h3>
                  
                  <div className="flex flex-col gap-[12px]">
                    {selectedBookId && selectedChapter ? (
                      <>
                        <div className="flex gap-6 px-4 py-3 shadow-[0_0_14px_0_rgba(108,103,97,0.06)] rounded-[12px] border border-[#F1ECE5] shadow-sm">
                          {/* Display Mode Buttons */}
                          <div className="flex items-center gap-6">
                            {/* Align Left */}
                            <button
                              onClick={() => handleDisplayModeChange(1)}
                              className={`w-[36px] h-[36px] border-none flex items-center justify-center transition rounded-full cursor-pointer ${
                                displayMode === 1 ? "bg-transparent" : "bg-transparent"
                              }`}
                              aria-label="Align Left"
                            >
                              <svg width="20" height="20" fill="none" stroke={displayMode === 1 ? "#684242" : "#BBA8A8"} strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M4 6h8M4 12h16M4 18h12" />
                              </svg>
                            </button>

                            {/* Align Center */}
                            <button
                              onClick={() => handleDisplayModeChange(2)}
                              className={`w-[36px] h-[36px] border-none flex items-center justify-center transition rounded-full cursor-pointer ${
                                displayMode === 2 ? "bg-transparent" : "bg-transparent"
                              }`}
                              aria-label="Align Center"
                            >
                              <svg width="20" height="20" fill="none" stroke={displayMode === 2 ? "#684242" : "#BBA8A8"} strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M6 6h12M4 12h16M6 18h12" />
                              </svg>
                            </button>

                            {/* Grid View */}
                            <button
                              onClick={() => handleDisplayModeChange(3)}
                              className={`w-[36px] h-[36px] border-none flex items-center justify-center transition rounded-full cursor-pointer ${
                                displayMode === 3 ? "bg-transparent" : "bg-transparent"
                              }`}
                              aria-label="Grid View"
                            >
                              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect width="6" height="2" rx="1" fill={displayMode === 3 ? "#684242" : "#BBA8A8"} />
                                <rect x="8" width="6" height="2" rx="1" fill={displayMode === 3 ? "#684242" : "#BBA8A8"} />
                                <rect y="4" width="6" height="2" rx="1" fill={displayMode === 3 ? "#684242" : "#BBA8A8"} />
                                <rect x="8" y="4" width="6" height="2" rx="1" fill={displayMode === 3 ? "#684242" : "#BBA8A8"} />
                                <rect y="8" width="6" height="2" rx="1" fill={displayMode === 3 ? "#684242" : "#BBA8A8"} />
                                <rect x="8" y="8" width="6" height="2" rx="1" fill={displayMode === 3 ? "#684242" : "#BBA8A8"} />
                                <rect y="12" width="6" height="2" rx="1" fill={displayMode === 3 ? "#684242" : "#BBA8A8"} />
                                <rect x="8" y="12" width="6" height="2" rx="1" fill={displayMode === 3 ? "#684242" : "#BBA8A8"} />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Verse Selector */}
                        <div className="mt-2">
                          <div className="font-primary text-[var(--primary-black)] mb-[6px]">
                            Select what to share:
                          </div>
                          <select
                            onChange={handleShareVerseSelect}
                            value={shareVerse || ""}
                            className="w-full shadow-[0_0_14px_0_rgba(108,103,97,0.06)] outline-[1px] outline-[#F1EBE1] bg-[var(--foreground)] border-none rounded-[12px] px-[16px] py-[10px] text-sm font-primary text-[var(--primary-black)] appearance-none"
                          >
                            <option value="">Entire Chapter</option>
                            {verses.map(verse => (
                              <option key={verse.verse} value={verse.verse}>
                                Verse {verse.verse}: {verse.text.length > 40 ? verse.text.substring(0, 40) + '...' : verse.text}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* URL Display */}
                        <div className="mt-2">
                          <div className="font-primary text-[var(--primary-black)] mb-[6px]">
                            Share this link to the {shareVerse ? 'verse' : 'chapter'}:
                          </div>
                          <div className="flex items-center w-full">
                            <input
                              type="text"
                              readOnly
                              value={getShareUrl()}
                              className="w-full shadow-[0_0_14px_0_rgba(108,103,97,0.06)] outline-none bg-[var(--foreground)] border border-[#F1ECE5] rounded-l-[12px] rounded-r-none px-[16px] py-[10px] text-sm font-primary text-[var(--primary-gray)] cursor-text overflow-hidden text-ellipsis"
                            />
                            <button
                              onClick={copyToClipboard}
                              className="py-[10px] px-[16px] font-primary shadow-[0_0_14px_0_rgba(108,103,97,0.06)] border border-l-0 border-[#F1ECE5] rounded-r-[12px] rounded-l-none text-[#684242] bg-[var(--foreground)] hover:bg-[#f0ece6] transition-all duration-200 flex items-center gap-[6px] cursor-pointer whitespace-nowrap"
                            >
                              <span>{copySuccess ? 'Copied!' : 'Copy'}</span>
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-[var(--primary-gray)] font-primary">
                        Please select a chapter to get a shareable link.
                      </div>
                    )}
                  </div>

                  {/* Close Button */}
                  <div className="mt-[16px] flex justify-end">
                    <form method="dialog">
                      <button className="px-[12px] py-[6px] rounded-[12px] border border-[var(--border)] shadow-sm font-primary shadow-[0_0_14px_0_rgba(108,103,97,0.06)] bg-[var(--foreground)] text-[var(--primary-black)] hover:bg-[#f0ece6] transition-all duration-200">
                        Close
                      </button>
                    </form>
                  </div>
                </div>
                <form method="dialog" className="modal-backdrop opacity-0">
                  <button>close</button>
                </form>
              </dialog>

              <div className="flex gap-6 px-4 py-3 shadow-[0_0_14px_0_rgba(108,103,97,0.06)] rounded-[12px] border border-[#F1ECE5] shadow-sm cursor-pointer">
                
                {/* Align Left */}
                <button
                  onClick={() => handleDisplayModeChange(1)}
                  className={`w-[36px] h-[36px] border-none flex items-center justify-center transition rounded-full cursor-pointer ${
                    displayMode === 1 ? "bg-transparent" : "bg-transparent"
                  }`}
                  aria-label="Align Left"
                >
                  <svg width="20" height="20" fill="none" stroke={displayMode === 1 ? "#684242" : "#BBA8A8"} strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M4 6h8M4 12h16M4 18h12" />
                  </svg>
                </button>

                {/* Align Center */}
                <button
                  onClick={() => handleDisplayModeChange(2)}
                  className={`w-[36px] h-[36px] border-none flex items-center justify-center transition rounded-full cursor-pointer ${
                    displayMode === 2 ? "bg-transparent" : "bg-transparent"
                  }`}
                  aria-label="Align Center"
                >
                  <svg width="20" height="20" fill="none" stroke={displayMode === 2 ? "#684242" : "#BBA8A8"} strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M6 6h12M4 12h16M6 18h12" />
                  </svg>
                </button>

                {/* Grid View */}
                <button
                  onClick={() => handleDisplayModeChange(3)}
                  className={`w-[36px] h-[36px] border-none flex items-center justify-center transition rounded-full cursor-pointer ${
                    displayMode === 3 ? "bg-transparent" : "bg-transparent"
                  }`}
                  aria-label="Grid View"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="6" height="2" rx="1" fill={displayMode === 3 ? "#684242" : "#BBA8A8"} />
                    <rect x="8" width="6" height="2" rx="1" fill={displayMode === 3 ? "#684242" : "#BBA8A8"} />
                    <rect y="4" width="6" height="2" rx="1" fill={displayMode === 3 ? "#684242" : "#BBA8A8"} />
                    <rect x="8" y="4" width="6" height="2" rx="1" fill={displayMode === 3 ? "#684242" : "#BBA8A8"} />
                    <rect y="8" width="6" height="2" rx="1" fill={displayMode === 3 ? "#684242" : "#BBA8A8"} />
                    <rect x="8" y="8" width="6" height="2" rx="1" fill={displayMode === 3 ? "#684242" : "#BBA8A8"} />
                    <rect y="12" width="6" height="2" rx="1" fill={displayMode === 3 ? "#684242" : "#BBA8A8"} />
                    <rect x="8" y="12" width="6" height="2" rx="1" fill={displayMode === 3 ? "#684242" : "#BBA8A8"} />
                  </svg>
                </button>

              </div>
            </div>
          </motion.div>



          <AnimatePresence 
            mode="wait" 
            custom={{ 
              fromMode: prevDisplayMode, 
              toMode: displayMode,
              isChapterChange: prevChapter !== selectedChapter || prevBookId !== selectedBookId
            }}
          >
            {verses.length > 0 ? (
              <motion.div
                key={`chapter-${selectedBookId}-${selectedChapter}-${displayMode}`}
                custom={{ 
                  fromMode: prevDisplayMode, 
                  toMode: displayMode,
                  isChapterChange: prevChapter !== selectedChapter || prevBookId !== selectedBookId
                }}
                variants={contentAnimationVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex-1 space-y-2 text-[16px] leading-[1.7] font-primary text-[var(--primary-black)] text-justify"
              >
                <h1 className="text-[24px] font-primary font-[600] font-light mb-[16px]">
                  {selectedBookId && selectedChapter ? 
                    `${books.find(b => b.id === selectedBookId)?.name} ${selectedChapter}` : 
                    "Select a chapter to read"}
                </h1>
                
                {displayMode === 1 ? (
                  verses.map((verse) => (
                    <p 
                      key={verse.verse} 
                      id={`verse-${verse.verse}`}
                      className={`transition-colors duration-200 ${hoveredVerse === verse.verse ? 'bg-[#f0ece6]' : ''} ${selectedVerse === verse.verse ? 'bg-[var(--border)]' : ''}`}
                      onMouseEnter={() => handleVerseHover(verse.verse)}
                      onMouseLeave={() => handleVerseHover(null)}
                      onClick={(e) => handleVerseClick(e, verse.verse)}
                      onContextMenu={(e) => handleContextMenu(e, verse.verse)}
                    >
                      <strong>{verse.verse}</strong> {verse.text}
                    </p>
                  ))
                ) : displayMode === 2 ? (
                  <div className="flex flex-wrap gap-x-2 text-justify">
                    {verses.map((verse) => (
                      <React.Fragment key={verse.verse}>
                        <strong 
                          id={`verse-${verse.verse}`}
                          className={`mr-1 ${hoveredVerse === verse.verse ? 'bg-[#f0ece6]' : ''} ${selectedVerse === verse.verse ? 'bg-[var(--border)]' : ''}`}
                          onMouseEnter={() => handleVerseHover(verse.verse)}
                          onMouseLeave={() => handleVerseHover(null)}
                          onClick={(e) => handleVerseClick(e, verse.verse)}
                          onContextMenu={(e) => handleContextMenu(e, verse.verse)}
                        >
                          {verse.verse}{'\u00A0'}
                        </strong>
                        {verse.text.trim().split(" ").map((word, index) => (
                          <span 
                            key={`${verse.verse}-${index}`}
                            data-verse={verse.verse}
                            className={`inline-block ${hoveredVerse === verse.verse ? 'bg-[#f0ece6]' : ''} ${selectedVerse === verse.verse ? 'bg-[var(--border)]' : ''}`}
                            onMouseEnter={() => handleVerseHover(verse.verse)}
                            onMouseLeave={() => handleVerseHover(null)}
                            onClick={(e) => handleVerseClick(e, verse.verse)}
                            onContextMenu={(e) => handleContextMenu(e, verse.verse)}
                          >
                            {word}
                            {'\u00A0'}
                          </span>
                        ))}
                      </React.Fragment>
                    ))}
                  </div>
                ) : (
                  // Display mode 3 - Book style layout with two columns
                  <div className="flex justify-between">
                    {/* Left page */}
                    <div className="w-[48%] pr-4 space-y-2">
                      <div className="flex flex-wrap text-justify">
                        {verses.slice(0, Math.ceil(verses.length / 2)).map((verse) => (
                          <React.Fragment key={`left-${verse.verse}`}>
                            <strong 
                              id={`verse-${verse.verse}`}
                              className={`mr-1 ${hoveredVerse === verse.verse ? 'bg-[#f0ece6]' : ''} ${selectedVerse === verse.verse ? 'bg-[var(--border)]' : ''}`}
                              onMouseEnter={() => handleVerseHover(verse.verse)}
                              onMouseLeave={() => handleVerseHover(null)}
                              onClick={(e) => handleVerseClick(e, verse.verse)}
                              onContextMenu={(e) => handleContextMenu(e, verse.verse)}
                            >
                              {verse.verse}{'\u00A0'}
                            </strong>
                            {verse.text.trim().split(" ").map((word, index) => (
                              <span 
                                key={`left-${verse.verse}-${index}`}
                                data-verse={verse.verse}
                                className={`inline-block ${hoveredVerse === verse.verse ? 'bg-[#f0ece6]' : ''} ${selectedVerse === verse.verse ? 'bg-[var(--border)]' : ''}`}
                                onMouseEnter={() => handleVerseHover(verse.verse)}
                                onMouseLeave={() => handleVerseHover(null)}
                                onClick={(e) => handleVerseClick(e, verse.verse)}
                                onContextMenu={(e) => handleContextMenu(e, verse.verse)}
                              >
                                {word}
                                {'\u00A0'}
                              </span>
                            ))}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>

                    {/* Right page */}
                    <div className="w-[48%] pl-4 space-y-2">
                      <div className="flex flex-wrap text-justify">
                        {verses.slice(Math.ceil(verses.length / 2)).map((verse) => (
                          <React.Fragment key={`right-${verse.verse}`}>
                            <strong 
                              id={`verse-${verse.verse}`}
                              className={`mr-1 ${hoveredVerse === verse.verse ? 'bg-[#f0ece6]' : ''} ${selectedVerse === verse.verse ? 'bg-[var(--border)]' : ''}`}
                              onMouseEnter={() => handleVerseHover(verse.verse)}
                              onMouseLeave={() => handleVerseHover(null)}
                              onClick={(e) => handleVerseClick(e, verse.verse)}
                              onContextMenu={(e) => handleContextMenu(e, verse.verse)}
                            >
                              {verse.verse}{'\u00A0'}
                            </strong>
                            {verse.text.trim().split(" ").map((word, index) => (
                              <span 
                                key={`right-${verse.verse}-${index}`}
                                data-verse={verse.verse}
                                className={`inline-block ${hoveredVerse === verse.verse ? 'bg-[#f0ece6]' : ''} ${selectedVerse === verse.verse ? 'bg-[var(--border)]' : ''}`}
                                onMouseEnter={() => handleVerseHover(verse.verse)}
                                onMouseLeave={() => handleVerseHover(null)}
                                onClick={(e) => handleVerseClick(e, verse.verse)}
                                onContextMenu={(e) => handleContextMenu(e, verse.verse)}
                              >
                                {word}
                                {'\u00A0'}
                              </span>
                            ))}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Bottom buttons section */}
                <div className="mt-[24px] flex justify-end items-center">
                  

                  {/* Next Chapter button */}
                  {selectedBookId && selectedChapter && (
                    <button 
                      className="ml-4 px-[12px] py-[6px] rounded-[12px] border border-[var(--border)] shadow-sm font-primary
                        shadow-[0_0_14px_0_rgba(108,103,97,0.06)]
                        bg-[var(--foreground)] text-[var(--primary-black)] hover:bg-[#f0ece6]
                        transition-all duration-200"
                      onClick={handleNextChapter}
                    >
                      {(() => {
                        const currentBookIndex = books.findIndex(book => book.id === selectedBookId);
                        if (currentBookIndex === -1) return "Next Chapter";
                        
                        const currentBook = books[currentBookIndex];
                        const totalChapters = chapterCounts[currentBook.id] || 0;
                        
                        // Check if this is the last chapter of the current book
                        if (selectedChapter >= totalChapters) {
                          // Check if there's another book after this one
                          if (currentBookIndex < books.length - 1) {
                            return "Next Book";
                          }
                          // If it's the last book, disable the button
                          return "Last Chapter";
                        }
                        
                        return "Next Chapter";
                      })()}
                    </button>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.p
                key="no-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-[var(--primary-gray)]"
              >
                Select a chapter to read its content.
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Right Divider - only visible when displayMode is 2 */}
        {displayMode === 2 && (
          <div
            className="relative w-[10px] min-h-[calc(100vh-60px)] flex items-start justify-center cursor-col-resize z-5"
            onMouseDown={startRightDrag}
          >
            <div className="w-[1px] cursor-col-resize bg-[var(--border)] min-h-[calc(100vh-60px)] h-full" />
            <div className="shadow-[0_0_14px_0_rgba(108,103,97,0.06)] flex justify-center items-center absolute mt-[24px] -translate-y-1/2 w-[24px] h-[24px] rounded-full bg-[var(--foreground)] border-[1px] border-[var(--border)]">
              <SeparatorVertical size={16} className="text-[var(--border)]" />
            </div>
          </div>
        )}


        {/* Right spacer section - only needed for displayMode 2 */}
        {displayMode === 2 && (
          <motion.div
            id="right-spacer"
            initial={{ width: 0 }}
            animate={{ width: rightSectionWidth }}
            transition={{ duration: dragging ? 0 : 0.4, ease: "easeInOut" }}
            style={{ width: rightSectionWidth }} // allow dragging to update
          />
        
        )}



      </div>
      
      {/* Context Menu */}
      {contextMenu && contextMenu.visible && (
        <div
          id="verse-context-menu"
          className="fixed bg-[var(--foreground)] rounded-[12px] shadow-[0_0_14px_0_rgba(108,103,97,0.06)] border border-[var(--border)] p-[8px] z-50 max-w-[350px]"
          style={{
            top: `${contextMenu.y}px`,
            left: `${contextMenu.x}px`,
          }}
        >
          <div className="font-primary font-medium text-[var(--primary-black)] mb-[6px] text-[15px]">
            Verse {contextMenu.verse}
          </div>
          <div className="text-[13px] mb-[12px] italic text-[var(--primary-gray)] text-ellipsis font-primary">
            {getVerseText(contextMenu.verse)}
          </div>
          <div className="gap-[2px] flex flex-col border border-[var(--primary-dark)] rounded-[8px] overflow-hidden">
            {noteCategories.map(category => (
              <button
                key={category}
                className="w-full text-left py-[6px] px-[8px] text-sm hover:bg-[#f0ece6] bg-transparent border-none transition-colors duration-200 font-primary text-[var(--primary-black)]"
                onClick={() => handleSaveNote(getVerseText(contextMenu.verse), category)}
              >
                Add to {category}
              </button>
            ))}
          </div>
          <button
            className="absolute top-[6px] right-[6px] bg-transparent border-none text-[var(--primary-gray)] hover:text-[var(--primary-black)] transition-colors duration-200"
            onClick={closeContextMenu}
          >
            <X size={14} />
          </button>
        </div>
      )}
    </main>
  );
}
