import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { headers } from "next/headers";

// Define API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

// Force dynamic rendering to ensure fresh metadata on each request
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({
  params
}: {
  params: any
}): Promise<Metadata> {
  // Access headers to ensure dynamic rendering
  headers();

  // Await params before accessing properties
  const resolvedParams = await Promise.resolve(params);
  const book = resolvedParams.book;
  const chapter = resolvedParams.chapter;
  const verse = resolvedParams.verse;
  const translation = "AKJV";

  console.log(`Generating metadata for verse: ${book} ${chapter}:${verse}`);

  let verseText = "Bible verse from In His Path.";
  let bookName = "Bible";
  
  try {
    // Fetch books to get the book name
    const booksRes = await fetch(`${API_BASE_URL}/translations/${translation}/books`, { 
      cache: 'no-store'
    });
    
    if (!booksRes.ok) {
      throw new Error(`Failed to fetch books: ${booksRes.status}`);
    }
    
    const books = await booksRes.json();
    
    // Find book by ID or name
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
      
      if (!versesRes.ok) {
        throw new Error(`Failed to fetch verses: ${versesRes.status}`);
      }
      
      const verses = await versesRes.json();
      
      // Find the specific verse
      const verseData = verses.find((v: { verse: number }) => v.verse === parseInt(verse));
      if (verseData?.text) {
        verseText = verseData.text;
        console.log(`Found verse text: ${verseText}`);
      }
    }
  } catch (error) {
    console.error("Failed to fetch verse text for metadata:", error);
  }

  // Create the page title in format "Book Chapter:Verse | In His Path"
  const title = `${bookName} ${chapter}:${verse} | In His Path`;
  
  // Build complete metadata object with verse content as description
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

export default async function VersePage({
  params
}: {
  params: any
}) {
  // Await params before accessing properties
  const resolvedParams = await Promise.resolve(params);
  const book = resolvedParams.book;
  const chapter = resolvedParams.chapter;
  const verse = resolvedParams.verse;
  
  // Create the redirect URL with query parameters
  const query = new URLSearchParams({
    book,
    chapter,
    verse,
    translation: "AKJV"
  });

  // Redirect to home page with the verse parameters
  redirect(`/?${query.toString()}`);
} 