import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { headers } from "next/headers";

// Define API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

// Tell Next.js to use the generateMetadata function
export const generateMetadataExperimental = true;

export async function generateMetadata(props: {
  params: any
}): Promise<Metadata> {
  // Access headers to ensure dynamic rendering
  headers();
  
  // Access params directly without destructuring
  const book = props.params.book;
  const chapter = props.params.chapter;
  const verse = props.params.verse;
  const translation = "AKJV"; // Fixed translation

  console.log(`Generating metadata for verse: ${book} ${chapter}:${verse}`);

  let verseText = "Bible verse from In His Path.";
  let bookName = book;
  
  try {
    // Fetch books to get the book name
    const booksRes = await fetch(`${API_BASE_URL}/translations/${translation}/books`, { 
      cache: 'no-store',
      next: { revalidate: 0 }
    });
    
    if (!booksRes.ok) {
      throw new Error(`Failed to fetch books: ${booksRes.status}`);
    }
    
    const books = await booksRes.json();
    console.log(`Found ${books.length} books`);
    
    const bookData = books.find((b: any) => 
      String(b.id) === book || 
      b.name.toLowerCase() === book.toLowerCase()
    );
    
    if (bookData) {
      bookName = bookData.name;
      console.log(`Found book: ${bookName}`);
      
      // Fetch verses for the chapter
      const versesRes = await fetch(
        `${API_BASE_URL}/translations/${translation}/books/${bookData.id}/chapters/${chapter}/verses`, 
        { 
          cache: 'no-store',
          next: { revalidate: 0 }
        }
      );
      
      if (!versesRes.ok) {
        throw new Error(`Failed to fetch verses: ${versesRes.status}`);
      }
      
      const verses = await versesRes.json();
      console.log(`Found ${verses.length} verses in chapter ${chapter}`);
      
      // Find the specific verse
      const verseData = verses.find((v: { verse: number }) => v.verse === parseInt(verse));
      if (verseData?.text) {
        verseText = verseData.text;
        console.log(`Found verse text: ${verseText.substring(0, 30)}...`);
      } else {
        console.log(`Verse ${verse} not found`);
      }
    } else {
      console.log(`Book ${book} not found`);
    }
  } catch (error) {
    console.error("Failed to fetch verse text for metadata:", error);
  }

  const title = `${bookName} ${chapter}:${verse} | In His Path`;
  console.log(`Generated metadata title: ${title}`);
  
  // Construct the complete metadata object
  const metadata: Metadata = {
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
  
  console.log("Returning verse metadata");
  return metadata;
}

export default function VersePage({
  params
}: {
  params: any
}) {
  // Create the redirect URL with query parameters
  const query = new URLSearchParams({
    book: params.book,
    chapter: params.chapter,
    verse: params.verse,
    translation: "AKJV",
    display: "1" // Default display mode
  });

  // Redirect to home page with the verse parameters
  redirect(`/?${query.toString()}`);
} 