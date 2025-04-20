'use client';

import { useEffect, useState } from "react";
import { ArrowLeft, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

interface Prayer {
  id: number;
  title: string;
  text: string;
}

export default function PrayersPage() {
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPrayers, setExpandedPrayers] = useState<{[id: number]: boolean}>({});
  const [focusedPrayer, setFocusedPrayer] = useState<number | null>(null);

  // Toggle prayer expansion state
  const togglePrayerExpansion = (prayerId: number) => {
    setExpandedPrayers(prev => ({
      ...prev,
      [prayerId]: !prev[prayerId]
    }));
  };

  // Focus on a single prayer
  const focusOnPrayer = (prayerId: number) => {
    setFocusedPrayer(prayerId);
  };

  // Reset focus to show all prayers
  const resetFocus = () => {
    setFocusedPrayer(null);
  };

  // Fetch prayers from API
  useEffect(() => {
    const fetchPrayers = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/prayers`);
        if (!response.ok) {
          throw new Error('Failed to fetch prayers');
        }
        const data = await response.json();
        setPrayers(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setLoading(false);
      }
    };

    fetchPrayers();
  }, []);

  // Get filtered prayers based on focus mode
  const getFilteredPrayers = () => {
    if (focusedPrayer === null) return prayers;
    
    // Move focused prayer to the top
    const focused = prayers.find(p => p.id === focusedPrayer);
    return focused ? [focused] : [];
  };

  return (
    <main className="min-h-screen h-full bg-[var(--background)] text-black overflow-x-hidden">
      <header className="relative w-full h-[60px] bg-[var(--foreground)] text-[var(--primary-black)] flex items-center border-b-[1px] border-[var(--border)] px-6">
        <Link href="/" className="absolute ml-[16px] flex items-center gap-[6px] text-sm text-[#684242] hover:opacity-80 font-primary transition-opacity no-underline">
          <ArrowLeft size={18} />
          <span className="font-primary text-[16px]">Back</span>
        </Link>

        <h1 className="mx-auto font-primary font-[400] text-[24px] text-center">
          Prayers
        </h1>
      </header>

      <div className="w-full max-w-[1000px] mx-auto py-[9px] pb-[50px]">
        <div className="max-w-[1000px] mx-auto px-[8px]">
          {loading ? (
            <div className="text-center py-8 text-[var(--primary-gray)] font-primary">
              Loading prayers...
            </div>
          ) : error ? (
            <div className="text-center py-8 text-[var(--primary-gray)] font-primary">
              Error: {error}
            </div>
          ) : prayers.length === 0 ? (
            <div className="text-center py-8 text-[var(--primary-gray)] font-primary">
              No prayers found.
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-[12px]"
            >
              {focusedPrayer && (
                <button 
                  onClick={resetFocus}
                  className="flex items-center hover:opacity-[0.8] gap-[3px] px-[9px] py-[3px] border-none rounded-full text-sm font-primary transition-all duration-200 shadow-[0_0_14px_0_rgba(108,103,97,0.06)] bg-[#684242]"
                >
                  <X size={16} />
                  <span>Show all prayers</span>
                </button>
              )}

              <AnimatePresence mode="popLayout">
                {getFilteredPrayers().map((prayer, index) => (
                  <motion.div 
                    key={prayer.id}
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
                    className={`bg-[var(--foreground)] mt-[16px] rounded-[12px] px-[12px] py-[9px] shadow-[0_0_14px_0_rgba(108,103,97,0.06)] border border-[var(--border)] ${
                      focusedPrayer === prayer.id ? 'focus-mode' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <h2 className={`font-primary font-medium text-[var(--primary-black)] font-[400]`}>
                        {prayer.title}
                      </h2>

                      {!focusedPrayer && (
                        <button 
                          className="px-[12px] py-[6px] rounded-[6px] border border-[var(--border)] shadow-sm font-primary shadow-[0_0_14px_0_rgba(108,103,97,0.06)] bg-[var(--foreground)] text-[var(--primary-black)] hover:bg-[#f0ece6] transition-all duration-200"
                          onClick={() => togglePrayerExpansion(prayer.id)}
                        >
                          {expandedPrayers[prayer.id] ? 'Show less' : 'Show more'}
                        </button>
                      )}
                    </div>
                    
                    <div className={`font-primary text-[var(--primary-black)] my-[8px] whitespace-pre-line ${
                      expandedPrayers[prayer.id] || focusedPrayer ? '' : 'line-clamp-3'
                    } ${
                      focusedPrayer === prayer.id ? 'text-center text-[24px] mt-[24px]' : ''
                    }`}>
                      {prayer.text}
                    </div>

                    {!focusedPrayer && (
                      <div className="flex justify-end mt-3 pt-2">
                        <button
                          onClick={() => focusOnPrayer(prayer.id)}
                          className="px-[12px] py-[6px] rounded-[6px] border border-[var(--border)] shadow-sm font-primary shadow-[0_0_14px_0_rgba(108,103,97,0.06)] bg-[#684242] text-white hover:opacity-90 transition-all duration-200"
                        >
                          Remove distractions
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
}