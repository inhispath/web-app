'use client';

import { useEffect, useState, MouseEvent as ReactMouseEvent } from "react";
import { ChevronDown, ChevronRight, SeparatorVertical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import React from "react";

interface Translation {
  title: string;
  translation: string;
}

interface Book {
  id: number;
  name: string;
}

export default function Home() {
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

  useEffect(() => {
    async function fetchTranslationsAndBooks() {
      try {
        const res = await fetch("http://localhost:8000/translations");
        const data = await res.json();
        setTranslations(data);
  
        const defaultTranslation = data.find(
          (t: Translation) => t.translation === selectedTranslationShort
        );
  
        if (!defaultTranslation) return;
  
        const booksRes = await fetch(
          `http://localhost:8000/translations/${selectedTranslationShort}/books`
        );
        const booksData = await booksRes.json();
        setBooks(booksData);
  
        if (booksData.length > 0) {
          const firstBook = booksData[0];
          setLoadingBooks(prev => ({ ...prev, [firstBook.id]: true }));
          const chaptersRes = await fetch(
            `http://localhost:8000/translations/${selectedTranslationShort}/books/${firstBook.id}/chapters`
          );
          const chaptersData = await chaptersRes.json();
          setChapterCounts(prev => ({
            ...prev,
            [firstBook.id]: Object.keys(chaptersData).length,
          }));
          setOpenBook(firstBook.name);
          setLoadingBooks(prev => ({ ...prev, [firstBook.id]: false }));
        }
      } catch (error) {
        console.error("Error loading translations or books:", error);
      }
    }
  
    fetchTranslationsAndBooks();
  }, []);
  

  useEffect(() => {
    document.body.style.userSelect = 'none';

    async function fetchBooks() {
      try {
        const response = await fetch(`http://localhost:8000/translations/${selectedTranslationShort}/books`);
        const data = await response.json();
        setBooks(data);
        if (data.length > 0) setOpenBook(data[0].name);
      } catch (error) {
        console.error('Error fetching books:', error);
      }
    }

    if (selectedTranslationShort) fetchBooks();
  }, [selectedTranslationShort]);

  const filteredTranslations = translations.filter((t) =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTranslationSelect = (translation: Translation) => {
    setSelectedTranslation(translation.title.replace(/^#\s*\w+:?\s*/, ''));
    setSelectedTranslationShort(translation.translation);
    const modal = document.getElementById('my_modal_2') as HTMLDialogElement;
    if (modal) modal.close();
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
      return;
    }
  
    setLoadingBooks(prev => ({ ...prev, [book.id]: true }));
  
    try {
      const res = await fetch(`http://localhost:8000/translations/${selectedTranslationShort}/books/${book.id}/chapters`);
      const data = await res.json();
      setChapterCounts(prev => ({ ...prev, [book.id]: Object.keys(data).length }));
      setOpenBook(bookName);
    } catch (err) {
      console.error(`Failed to fetch chapters for ${bookName}`, err);
    } finally {
      setLoadingBooks(prev => ({ ...prev, [book.id]: false }));
    }
  };

  const handleChapterClick = async (bookId: number, chapter: number) => {
    setPrevChapter(selectedChapter);
    setPrevBookId(selectedBookId);
    
    setSelectedChapter(chapter);
    setSelectedBookId(bookId);
    
    try {
      const res = await fetch(
        `http://localhost:8000/translations/${selectedTranslationShort}/books/${bookId}/chapters/${chapter}/verses`
      );
      const data = await res.json();
      setVerses(data);
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
    startX = e.clientX;
    const leftSection = document.getElementById("left-section");
    if (!leftSection) return;
    startWidth = leftSection.offsetWidth - 32;
    document.addEventListener("mousemove", onDrag);
    document.addEventListener("mouseup", stopDrag);
  };

  const startRightDrag = (e: ReactMouseEvent<HTMLDivElement>) => {
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
    document.removeEventListener("mousemove", onDrag);
    document.removeEventListener("mouseup", stopDrag);
  };

  const stopRightDrag = () => {
    setDragging(false);
    document.removeEventListener("mousemove", onRightDrag);
    document.removeEventListener("mouseup", stopRightDrag);
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
    setPrevDisplayMode(displayMode);
    setDisplayMode(newMode);
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

  return (
    <main className="min-h-screen h-full bg-[var(--background)] text-black p-[0px] m-[0px]">
      <header className="w-full h-[60px] bg-[var(--foreground)] text-[var(--primary-black)] flex items-center justify-center border-b-[1px] border-[var(--border)]">
        <div
          tabIndex={0}
          role="button"
          className="flex items-center text-[var(--primary-gray)] text-[15px] cursor-pointer font-primary gap-[4px] h-[32px] px-[10px] bg-[var(--background)] text-[#555555] font-medium rounded-[12px] shadow-[0_0_14px_0_rgba(108,103,97,0.06)] border-none hover:bg-[#f0ece6] transition-all duration-200"
          onClick={() => {
            const modal = document.getElementById('my_modal_2') as HTMLDialogElement;
            if (modal) modal.showModal();
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
              className="w-full shadow-[0_0_14px_0_rgba(108,103,97,0.06)] outline-[1px] outline-[#F1EBE1] bg-[var(--foreground)] border-none rounded-[12px] px-[16px] py-[12px] placeholder:text-[var(--primary-gray)] box-border"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="flex justify-between items-center mt-2">
              <div className="flex-grow"></div>
              <p className="font-primary text-[12px] mt-[8px]">
                Powered by <a className="text-blue-500 no-underline" href="https://github.com/scrollmapper/bible_databases" target="_blank" rel="noopener noreferrer">scrollmapper</a>
              </p>
            </div>
            <div className="max-h-[50vh] overflow-y-auto mt-[12px]">
              {filteredTranslations.map((translation, index) => (
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
      </header>

      <div className="container mx-auto px-4 mr-[10px] flex h-full text-[var(--primary-black)]">
        <div id="left-section" className="w-1/3 p-[16px] overflow-auto flex justify-end">
          <div className="space-y-2 text-[26px] font-primary mt-[20px]">
            {books.map((book) => (
              <div key={book.name}>
                <div
                  className="cursor-pointer flex items-center gap-[6px] mb-[16px] hover:text-primary-600 transition-colors duration-200"
                  onClick={() => toggleBook(book.name)}
                >
                  {book.name}
                  <motion.div
                    initial="closed"
                    animate={openBook === book.name ? "open" : "closed"}
                    variants={chevronVariants}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronRight size={20} />
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
                                ? "bg-[var(--foreground)] border-[var(--border)]"
                                : "border-[var(--border)] bg-transparent"
                            } text-sm flex items-center justify-center hover:bg-primary-50 hover:border-primary-200 transition-all duration-50`}
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
          <div className="w-[1px] cursor-col-resize bg-[var(--border)] min-h-[calc(100vh-60px)]" />
          <div className="shadow-[0_0_14px_0_rgba(108,103,97,0.06)] flex justify-center items-center absolute mt-[24px] -translate-y-1/2 w-[24px] h-[24px] rounded-full bg-[var(--foreground)] border-[1px] border-[var(--border)]">
              <SeparatorVertical size={16} color="#E1D9D0" />
          </div>
        </div>



        {/* Center/Text Section */}
        <div 
          id="center-section" 
          className="flex-1 bg-white p-4 overflow-auto p-[24px]"
        >
          
          <motion.div layout transition={{ type: "spring", stiffness: 300, damping: 30 }} className="flex justify-end mb-[24px]">
            <div className="flex gap-6 px-4 py-3 shadow-[0_0_14px_0_rgba(108,103,97,0.06)] rounded-[12px] border border-[#F1ECE5] shadow-sm">
              
              {/* Align Left */}
              <button
                onClick={() => handleDisplayModeChange(1)}
                className={`w-[36px] h-[36px] border-none flex items-center justify-center transition rounded-full ${
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
                className={`w-[36px] h-[36px] border-none flex items-center justify-center transition rounded-full ${
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
                className={`w-[36px] h-[36px] border-none flex items-center justify-center transition rounded-full ${
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
                {displayMode === 1 ? (
                  verses.map((verse) => (
                    <p key={verse.verse}>
                      <strong>{verse.verse}</strong> {verse.text}
                    </p>
                  ))
                ) : displayMode === 2 ? (
                  <div className="flex flex-wrap gap-x-2 text-justify">
                    {verses.map((verse) => (
                      <React.Fragment key={verse.verse}>
                        <strong className="mr-1">{verse.verse}{'\u00A0'}</strong>
                        {verse.text.trim().split(" ").map((word, index) => (
                          <span key={`${verse.verse}-${index}`} className="inline-block">
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
                            <strong className="mr-1">{verse.verse}{'\u00A0'}</strong>
                            {verse.text.trim().split(" ").map((word, index) => (
                              <span key={`left-${verse.verse}-${index}`} className="inline-block">
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
                            <strong className="mr-1">{verse.verse}{'\u00A0'}</strong>
                            {verse.text.trim().split(" ").map((word, index) => (
                              <span key={`right-${verse.verse}-${index}`} className="inline-block">
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
            <div className="w-[1px] cursor-col-resize bg-[var(--border)] min-h-[calc(100vh-60px)]" />
            <div className="shadow-[0_0_14px_0_rgba(108,103,97,0.06)] flex justify-center items-center absolute mt-[24px] -translate-y-1/2 w-[24px] h-[24px] rounded-full bg-[var(--foreground)] border-[1px] border-[var(--border)]">
              <SeparatorVertical size={16} color="#E1D9D0" />
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
    </main>
  );
}
