'use client';

import { useEffect, useState } from "react";
import { ArrowLeft, ChevronDown, List, Grid, Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface Note {
  id: string;
  bookId: number;
  bookName: string;
  chapter: number;
  verse: number | null;
  verseEnd?: number | null; // Add verseEnd field to support verse ranges
  text: string;
  category: string;
  createdAt: number;
  userNote?: string; // Optional user-provided note
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

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [activeTab, setActiveTab] = useState<'notes' | 'highlights'>('notes');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterBook, setFilterBook] = useState<number | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [books, setBooks] = useState<{id: number, name: string}[]>([]);
  const [expandedNotes, setExpandedNotes] = useState<{[id: string]: boolean}>({});
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [newCategory, setNewCategory] = useState<string>('');
  const [categoryToEdit, setCategoryToEdit] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editedNoteContent, setEditedNoteContent] = useState('');
  
  // Default categories that will always be available
  const DEFAULT_CATEGORIES = ['General', 'Prayer', 'Study', 'Question', 'Insight'];

  // Load notes and highlights from localStorage
  useEffect(() => {
    // Load highlights
    const savedHighlights = localStorage.getItem('highlights');
    if (savedHighlights) {
      try {
        const parsed = JSON.parse(savedHighlights) as Highlight[];
        setHighlights(parsed);
      } catch (error) {
        console.error('Error parsing saved highlights:', error);
      }
    }
    
    // Load notes
    const savedNotes = localStorage.getItem('notes');
    if (savedNotes) {
      try {
        const parsed = JSON.parse(savedNotes) as Note[];
        setNotes(parsed);
        
        // Extract unique categories from notes
        const uniqueCategories = Array.from(new Set(parsed.map(note => note.category)));
        
        // Load saved categories from localStorage or initialize with categories from notes
        const savedCategories = localStorage.getItem('noteCategories');
        if (savedCategories) {
          try {
            const parsedCategories = JSON.parse(savedCategories) as string[];
            // Ensure default categories are always included
            const mergedCategories = Array.from(new Set([...DEFAULT_CATEGORIES, ...parsedCategories, ...uniqueCategories]));
            setCategories(mergedCategories);
          } catch (error) {
            console.error('Error parsing saved categories:', error);
            // If error parsing, ensure default categories are included
            const fallbackCategories = Array.from(new Set([...DEFAULT_CATEGORIES, ...uniqueCategories]));
            setCategories(fallbackCategories);
          }
        } else {
          // If no saved categories, use defaults plus any from notes
          const initialCategories = Array.from(new Set([...DEFAULT_CATEGORIES, ...uniqueCategories]));
          setCategories(initialCategories);
          // Initialize localStorage with these categories
          localStorage.setItem('noteCategories', JSON.stringify(initialCategories));
        }
        
        // Extract unique books
        const uniqueBooks = Array.from(
          new Set(parsed.map(note => JSON.stringify({id: note.bookId, name: note.bookName})))
        ).map(str => JSON.parse(str));
        setBooks(uniqueBooks);
      } catch (error) {
        console.error('Error parsing saved notes:', error);
      }
    } else {
      // If no notes exist yet, at least set up the default categories
      setCategories(DEFAULT_CATEGORIES);
      localStorage.setItem('noteCategories', JSON.stringify(DEFAULT_CATEGORIES));
    }
  }, []);

  // Toggle note expansion state
  const toggleNoteExpansion = (noteId: string) => {
    setExpandedNotes(prev => ({
      ...prev,
      [noteId]: !prev[noteId]
    }));
  };

  // Delete a note
  const handleDeleteNote = (noteId: string) => {
    const updatedNotes = notes.filter(note => note.id !== noteId);
    setNotes(updatedNotes);
    localStorage.setItem('notes', JSON.stringify(updatedNotes));
  };

  // Get filtered notes based on category and book
  const getFilteredNotes = () => {
    return notes.filter(note => {
      const matchesCategory = !filterCategory || note.category === filterCategory;
      const matchesBook = !filterBook || note.bookId === filterBook;
      return matchesCategory && matchesBook;
    });
  };

  // Format date from timestamp
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  // Function to handle creating a new category
  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    
    // Check if category already exists
    if (categories.includes(newCategory.trim())) {
      // Remove alert and just return
      return;
    }
    
    // Add new category
    const updatedCategories = [...categories, newCategory.trim()];
    setCategories(updatedCategories);
    
    // Save updated categories to localStorage
    localStorage.setItem('noteCategories', JSON.stringify(updatedCategories));
    
    // Reset input
    setNewCategory('');
    
    // Close modal
    const modal = document.getElementById('category_modal') as HTMLDialogElement;
    if (modal) modal.close();
  };

  // Function to handle editing an existing category
  const handleEditCategory = () => {
    if (!newCategory.trim() || !categoryToEdit) return;
    
    // Prevent editing "General" category
    if (categoryToEdit === "General") {
      return;
    }
    
    // Check if the edited name already exists (and is not the current category)
    if (categories.includes(newCategory.trim()) && newCategory.trim() !== categoryToEdit) {
      // Remove alert and just return
      return;
    }
    
    // Update all notes with this category
    const updatedNotes = notes.map(note => {
      if (note.category === categoryToEdit) {
        return { ...note, category: newCategory.trim() };
      }
      return note;
    });
    
    // Update notes state and localStorage
    setNotes(updatedNotes);
    localStorage.setItem('notes', JSON.stringify(updatedNotes));
    
    // Update categories list
    const updatedCategories = categories.map(cat => 
      cat === categoryToEdit ? newCategory.trim() : cat
    );
    setCategories(updatedCategories);
    
    // Save updated categories to localStorage
    localStorage.setItem('noteCategories', JSON.stringify(updatedCategories));
    
    // Reset input and selected category
    setNewCategory('');
    setCategoryToEdit(null);
    
    // Close modal
    const modal = document.getElementById('category_modal') as HTMLDialogElement;
    if (modal) modal.close();
  };

  // Function to handle deleting a category
  const handleDeleteCategory = (categoryName: string) => {
    // Prevent deleting "General" category
    if (categoryName === "General") {
      return;
    }
    
    // Update all notes with this category to "General"
    const updatedNotes = notes.map(note => {
      if (note.category === categoryName) {
        return { ...note, category: "General" };
      }
      return note;
    });
    
    // Update notes state and localStorage
    setNotes(updatedNotes);
    localStorage.setItem('notes', JSON.stringify(updatedNotes));
    
    // Remove category from list
    const updatedCategories = categories.filter(cat => cat !== categoryName);
    setCategories(updatedCategories);
    
    // Save updated categories to localStorage
    localStorage.setItem('noteCategories', JSON.stringify(updatedCategories));
    
    // If the deleted category was selected as a filter, reset the filter
    if (filterCategory === categoryName) {
      setFilterCategory(null);
    }
  };

  // Add function to handle starting edit mode
  const handleStartEditing = (note: Note) => {
    setEditingNoteId(note.id);
    setEditedNoteContent(note.userNote || '');
  };

  // Add function to save edited note
  const handleSaveEditedNote = (noteId: string) => {
    const updatedNotes = notes.map(note => {
      if (note.id === noteId) {
        return {
          ...note,
          userNote: editedNoteContent.trim() === '' ? undefined : editedNoteContent.trim()
        };
      }
      return note;
    });
    
    setNotes(updatedNotes);
    localStorage.setItem('notes', JSON.stringify(updatedNotes));
    setEditingNoteId(null);
    setEditedNoteContent('');
  };

  // Add function to cancel editing
  const handleCancelEditing = () => {
    setEditingNoteId(null);
    setEditedNoteContent('');
  };

  return (
    <main className="min-h-screen h-full bg-[var(--background)] text-black overflow-x-hidden">
      <header className="relative w-full h-[60px] bg-[var(--foreground)] text-[var(--primary-black)] flex items-center border-b-[1px] border-[var(--border)] px-6">
        <Link href="/read" className="absolute ml-[16px] flex items-center gap-[6px] text-sm text-[#684242] hover:opacity-80 font-primary transition-opacity no-underline">
          <ArrowLeft size={18} />
          <span className="font-primary text-[16px]">Back to Reading</span>
        </Link>

        <h1 className="mx-auto font-primary font-[400] text-[24px] text-center">
            My Notes & Highlights
        </h1>
      </header>

      <div className="w-full max-w-[1000px] mx-auto py-[9px]">
        <div className="max-w-[1000px] mx-auto px-[8px]">
          {/* Tabs */}
          <div className="flex gap-[6px] mb-6">
            <button
              className={`px-[12px] h-[36px] font-primary
                shadow-[0_0_14px_0_rgba(108,103,97,0.06)] rounded-[12px] border border-[#F1ECE5] shadow-sm
                transition-all duration-200 flex items-center gap-[6px] cursor-pointer
                ${activeTab === 'notes' 
                  ? 'bg-[#684242] text-[#fff]' 
                  : 'bg-transparent text-[#684242] hover:bg-[#f0ece6]'}`}
              onClick={() => setActiveTab('notes')}
            >
              Notes ({notes.length})
            </button>
            <button
              className={`px-[12px] h-[36px] font-primary
                shadow-[0_0_14px_0_rgba(108,103,97,0.06)] rounded-[12px] border border-[#F1ECE5] shadow-sm
                transition-all duration-200 flex items-center gap-[6px] cursor-pointer
                ${activeTab === 'highlights' 
                  ? 'bg-[#684242] text-[var(--foreground)]' 
                  : 'bg-transparent text-[#684242] hover:bg-[#f0ece6]'}`}
              onClick={() => setActiveTab('highlights')}
            >
              Highlights ({highlights.length})
            </button>
          </div>

          {/* Category filter for notes */}
          {activeTab === 'notes' && categories.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-[3px] mt-[12px] items-center">
                <button
                  className={`px-[12px] py-[3px] border-none rounded-full text-sm font-primary transition-all duration-200 ${
                    filterCategory === null
                      ? 'bg-[#684242] text-[#fff]'
                      : 'bg-transparent text-[var(--primary-black)] hover:bg-[#f0ece6]'
                  }`}
                  onClick={() => setFilterCategory(null)}
                >
                  All
                </button>
                {categories.map(category => (
                  <button
                    key={category}
                    className={`px-[12px] py-[3px] border-none rounded-full text-sm font-primary transition-all duration-200 ${
                      filterCategory === category
                        ? 'bg-[#684242] text-[#fff]'
                        : 'bg-transparent text-[var(--primary-black)] hover:bg-[#f0ece6]'
                    }`}
                    onClick={() => setFilterCategory(category)}
                  >
                    {category}
                  </button>
                ))}
                <button
                  className="w-[24px] h-[24px] flex items-center justify-center rounded-full bg-transparent text-[var(--primary-gray)] border-none shadow-[0_0_14px_0_rgba(108,103,97,0.06)] hover:bg-[#f0ece6] transition-all duration-200"
                  onClick={() => {
                    setNewCategory('');
                    setCategoryToEdit(null);
                    const modal = document.getElementById('category_modal') as HTMLDialogElement;
                    if (modal) modal.showModal();
                  }}
                >
                  <Plus size={14} className="text-[var(--primary-black)]" />
                </button>
              </div>
              
              {/* Book filter tabs */}
              {books.length > 0 && (
                <div className="flex flex-wrap gap-[3px] mt-[8px]">
                  <button
                    className={`px-[12px] py-[3px] border-none rounded-full text-sm font-primary transition-all duration-200 ${
                      filterBook === null
                        ? 'bg-[#684242] text-[#fff]'
                        : 'bg-transparent text-[var(--primary-black)] hover:bg-[#f0ece6]'
                    }`}
                    onClick={() => setFilterBook(null)}
                  >
                    All Books
                  </button>
                  {books.map(book => (
                    <button
                      key={book.id}
                      className={`px-[12px] py-[3px] border-none rounded-full text-sm font-primary transition-all duration-200 ${
                        filterBook === book.id
                          ? 'bg-[#684242] text-[#fff]'
                          : 'bg-transparent text-[var(--primary-black)] hover:bg-[#f0ece6]'
                      }`}
                      onClick={() => setFilterBook(book.id)}
                    >
                      {book.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Category Modal */}
          <dialog id="category_modal" className="modal">
            <div className="modal-box p-[12px] rounded-[14px] bg-[var(--background)]">
              <div className="flex justify-between">
                <h3 className="font-primary font-[400] text-[var(--primary-black)]">
                  {categoryToEdit ? 'Edit Category' : 'Add New Category'}
                </h3>
                <button
                  className="absolute top-[12px] right-[12px] bg-transparent border-none text-[var(--primary-gray)] hover:text-[var(--primary-black)] transition-colors duration-200"
                  onClick={() => {
                    const modal = document.getElementById('category_modal') as HTMLDialogElement;
                    if (modal) modal.close();
                  }}
                >
                  <X size={14} />
                </button>
              </div>

              <div className="mt-4">
                <div className="flex w-full overflow-hidden mt-[9px] mb-[12px] rounded-[12px] border outline-[1px] outline-[#F1EBE1] outline bg-[var(--foreground)] shadow-[0_0_14px_0_rgba(108,103,97,0.06)]">
                  <input
                    type="text"
                    placeholder="Category name"
                    className="w-full text-[var(--primary-black)] bg-transparent border-none px-[16px] py-[12px] placeholder:text-[var(--primary-gray)] font-primary outline-none"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        categoryToEdit ? handleEditCategory() : handleAddCategory();
                      }
                    }}
                    autoFocus
                  />
                  <button
                    className="bg-transparent text-[var(--primary-black)] px-[16px] font-primary hover:bg-[#f0ece6] transition-all duration-200 border-none cursor-pointer"
                    onClick={categoryToEdit ? handleEditCategory : handleAddCategory}
                  >
                    {categoryToEdit ? 'Update' : 'Add'}
                  </button>
                </div>


                <div className="flex justify-end mt-4 gap-2">
                  {categoryToEdit && (
                    <button
                      className="px-[12px] py-[6px] rounded-[12px] text-sm bg-transparent  hover:text-white hover:bg-red-500 border border-red-300 font-primary transition-all duration-200"
                      onClick={() => {
                        // Remove confirm dialog and just proceed with deletion
                        handleDeleteCategory(categoryToEdit);
                        setCategoryToEdit(null);
                        const modal = document.getElementById('category_modal') as HTMLDialogElement;
                        if (modal) modal.close();
                      }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>

              {!categoryToEdit && (
                <>
                  <div className="mt-[6px]">
                    <h4 className="font-primary text-sm font-[400] text-[var(--primary-black)] mb-[6px]">Existing Categories</h4>
                  </div>
                  <div className="max-h-[30vh] overflow-y-auto mt-2">
                    {categories.map((category, index) => (
                      <div
                        key={index}
                        className={`flex justify-between items-center px-[18px] py-[10px] rounded-[8px] hover:bg-[var(--foreground)] transition-all duration-200 ${category === "General" ? "opacity-70" : "cursor-pointer"}`}
                        onClick={() => {
                          if (category !== "General") {
                            setNewCategory(category);
                            setCategoryToEdit(category);
                          }
                        }}
                      >
                        <span className="font-primary text-[var(--primary-black)] text-[14px]">
                          {category}
                        </span>
                        <button
                          className={`bg-transparent border-none text-[var(--primary-gray)] hover:text-[var(--danger-500)] transition-colors duration-200 flex items-center justify-center ${category === "General" ? "opacity-30 cursor-not-allowed" : ""}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            // Only allow deletion for non-General categories
                            if (category !== "General") {
                              handleDeleteCategory(category);
                            }
                          }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
            <form method="dialog" className="modal-backdrop opacity-0">
              <button>close</button>
            </form>
          </dialog>

          {/* Notes display */}
          {activeTab === 'notes' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-[12px]"
            >
              {getFilteredNotes().length === 0 ? (
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center text-[var(--primary-gray)] font-primary py-8"
                >
                  No notes yet. Add notes while reading by clicking on a verse.
                </motion.p>
              ) : (
                <AnimatePresence mode="popLayout">
                  {getFilteredNotes().map((note, index) => (
                    <motion.div 
                      key={note.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      layout="position"
                      transition={{ 
                        duration: 0.3,
                        delay: index * 0.05,
                        ease: "easeOut",
                        layout: { duration: 0.3 }
                      }}
                      className="bg-[var(--foreground)] mt-[16px] rounded-[12px] px-[12px] py-[9px] shadow-[0_0_14px_0_rgba(108,103,97,0.06)] border border-[var(--border)]"
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <div className="font-primary font-medium text-[var(--primary-black)]">
                            {note.bookName} {note.chapter}
                            {note.verse ? 
                              note.verseEnd && note.verseEnd !== note.verse ? 
                                `:${note.verse}-${note.verseEnd}` : 
                                `:${note.verse}` 
                              : ''}
                          </div>
                          <div className="text-sm text-[var(--primary-gray)]">
                            {formatDate(note.createdAt)} {' · '} {note.category}
                          </div>
                        </div>
                      </div>
                      
                      <div className={`font-primary text-[var(--primary-black)] my-[8px]`}>
                        {note.text}
                      </div>
                      
                      {note.userNote && (
                        <motion.div layout={false}>
                          {editingNoteId === note.id ? (
                            <div className="mt-3 mb-1">
                              <textarea
                                className="w-full p-[10px] box-border min-h-[80px] bg-[#f9f7f4] border border-[#F1ECE5] rounded-[8px] text-sm font-primary resize-none focus:outline-none text-[var(--primary-black)] placeholder:text-[var(--primary-gray)]"
                                value={editedNoteContent}
                                onChange={(e) => setEditedNoteContent(e.target.value)}
                                autoFocus
                              />
                              <div className="flex justify-end gap-[6px] mt-[6px] mb-[12px]">
                                <button
                                  className="px-[10px] py-[6px] h-[32px] rounded-[8px] text-sm bg-transparent text-[var(--primary-gray)] hover:bg-[#f0ece6] border border-[#F1ECE5] font-primary transition-all duration-200 flex items-center justify-center"
                                  onClick={handleCancelEditing}
                                >
                                  Cancel
                                </button>
                                <button
                                  className="px-[10px] py-[6px] h-[32px] rounded-[8px] text-sm bg-[#684242] text-white hover:opacity-90 border border-[#684242] font-primary transition-all duration-200 flex items-center justify-center"
                                  onClick={() => handleSaveEditedNote(note.id)}
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div 
                              className="font-primary text-[var(--primary-gray)] bg-[#f9f7f4] p-[6px] mt-3 mb-1 rounded-[8px] border border-[#F1ECE5] italic text-[15px] cursor-pointer hover:bg-[#f5f1eb] transition-colors duration-200"
                              onClick={() => handleStartEditing(note)}
                            >
                              {note.userNote}
                            </div>
                          )}
                        </motion.div>
                      )}
                      
                      <div className="flex justify-between items-center mt-3 pt-2 border-t border-[#F1ECE5] pt-[6px]">
                        <Link
                          href={`/?book=${note.bookId}&chapter=${note.chapter}${note.verse ? `&verse=${note.verse}` : ''}`}
                          className="text-sm text-[#684242] hover:opacity-80 font-primary transition-opacity no-underline"
                        >
                          Go to passage
                        </Link>
                        
                        <button
                          className="px-[12px] py-[6px] rounded-[12px] mt-[4px] border shadow-sm font-primary cursor-pointer
                          shadow-[0_0_14px_0_rgba(108,103,97,0.06)]
                          transition-all duration-200
                          bg-[var(--foreground)] text-[var(--primary-black)] border-[var(--border)] hover:bg-[#f0ece6]"
                          onClick={() => handleDeleteNote(note.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </motion.div>
          )}

          {/* Highlights display */}
          {/* {activeTab === 'highlights' && (
            <div className="space-y-4">
              {highlights.length === 0 ? (
                <p className="text-center text-[var(--primary-gray)] font-primary py-8">
                  No highlights yet. Highlight text while reading.
                </p>
              ) : (
                highlights.map(highlight => (
                  <div 
                    key={highlight.id}
                    className="bg-[var(--foreground)] rounded-[12px] shadow-[0_0_14px_0_rgba(108,103,97,0.06)] border border-[var(--border)] p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-primary font-medium text-[var(--primary-black)]">
                          {highlight.bookName} {highlight.chapter}:{highlight.verse}
                        </div>
                        <div className="text-sm text-[var(--primary-gray)]">
                          {formatDate(highlight.createdAt)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="font-primary bg-[#FFFDEA] p-3 rounded-[8px] border border-[#F7F1D0] my-2 text-[var(--primary-black)]">
                      {highlight.text}
                    </div>
                    
                    <div className="flex justify-end items-center mt-2">
                      <Link
                        href={`/?book=${highlight.bookId}&chapter=${highlight.chapter}&verse=${highlight.verse}`}
                        className="text-sm text-[#684242] hover:opacity-80 font-primary transition-opacity px-3 py-1 rounded-full bg-[var(--background)] hover:bg-[#f0ece6]"
                      >
                        Go to passage
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          )} */}
        </div>
      </div>
    </main>
  );
} 