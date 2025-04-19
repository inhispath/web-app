import { redirect } from "next/navigation";
import type { Metadata } from "next";

// Define API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

// Ensure metadata is generated dynamically
export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params
}: {
  params: any
}): Promise<Metadata> {
  const { book, chapter, verse } = params;
  const translation = "AKJV"; // Fixed translation

  let verseText = "Bible verse from In His Path.";
  let bookName = book;
  
  try {
    // Fetch books to get the book name
    const booksRes = await fetch(`${API_BASE_URL}/translations/${translation}/books`, { 
      cache: 'no-store'
    });
    const books = await booksRes.json();
    
    const bookData = books.find((b: any) => 
      String(b.id) === book || 
      b.name.toLowerCase() === book.toLowerCase()
    );
    
    if (bookData) {
      bookName = bookData.name;
      
      // Fetch verses for the chapter
      const versesRes = await fetch(
        `${API_BASE_URL}/translations/${translation}/books/${bookData.id}/chapters/${chapter}/verses`, 
        { cache: 'no-store' }
      );
      const verses = await versesRes.json();
      
      // Find the specific verse
      const verseData = verses.find((v: { verse: number }) => v.verse === parseInt(verse));
      if (verseData?.text) {
        verseText = verseData.text;
      }
    }
  } catch (error) {
    console.error("Failed to fetch verse text for metadata:", error);
  }

  const title = `${bookName} ${chapter}:${verse} | In His Path`;
  
  return {
    title,
    description: verseText,
    openGraph: {
      title,
      description: verseText,
      type: "website",
      url: `https://beta.inhispath.com/verse/${book}/${chapter}/${verse}`,
      siteName: "In His Path",
      images: [
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg/960px-Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg",
          width: 960,
          height: 436,
          alt: "Creation of Adam by Michelangelo",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: verseText,
      images: [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg/960px-Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg",
      ],
    },
  };
}

export default function VersePage({
  params
}: {
  params: any
}) {
  const { book, chapter, verse } = params;
  
  // Create the redirect URL with query parameters
  const query = new URLSearchParams({
    book,
    chapter,
    verse,
  });

  // Redirect to home page with the verse parameters
  redirect(`/?${query.toString()}`);
} 