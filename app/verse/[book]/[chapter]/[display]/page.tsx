import { redirect } from "next/navigation";
import type { Metadata } from "next";

// Define API base URL - using the same one as in the main app
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

type Params = {
  book: string;
  chapter: string;
  display: string;
};

type SearchParams = {
  verse?: string;
  translation?: string;
};

/**
 * Generate metadata for social media embeds with verse content
 */
export async function generateMetadata(
  { params, searchParams }: { params: Params; searchParams: SearchParams }
): Promise<Metadata> {
  const { book, chapter, display } = params;
  const verse = searchParams.verse || "1";
  const translation = searchParams.translation || "AKJV";

  let verseText = "Bible verse from In His Path.";
  let bookName = book;
  
  try {
    // Fetch books to get the proper book ID and name
    const booksRes = await fetch(`${API_BASE_URL}/translations/${translation}/books`);
    const books = await booksRes.json();
    const bookData = books.find((b: any) => 
      b.name.toLowerCase() === book.toLowerCase() || 
      String(b.id) === book
    );
    
    if (bookData) {
      bookName = bookData.name;
      // Fetch all verses from the chapter
      const versesRes = await fetch(
        `${API_BASE_URL}/translations/${translation}/books/${bookData.id}/chapters/${chapter}/verses`
      );
      const verses = await versesRes.json();
      
      // Find the specific verse
      const verseData = verses.find((v: { verse: number }) => v.verse === parseInt(verse));
      if (verseData) {
        verseText = verseData.text || verseText;
      }
    }
  } catch (error) {
    console.error("Failed to fetch verse text for metadata:", error);
  }

  const title = `${bookName} ${chapter}:${verse} (${translation}) | In His Path`;

  return {
    title,
    description: verseText,
    openGraph: {
      title,
      description: verseText,
      type: "website",
      url: `https://beta.inhispath.com/verse/${book}/${chapter}/${display}${verse ? `?verse=${verse}` : ''}${translation ? `&translation=${translation}` : ''}`,
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

/**
 * Default page function that redirects to the home page with the proper parameters
 */
export default function VersePage({ 
  params, 
  searchParams 
}: { 
  params: Params; 
  searchParams: SearchParams;
}) {
  const { book, chapter, display } = params;
  const verse = searchParams.verse;
  const translation = searchParams.translation || "AKJV";

  // Build the query parameters for redirection
  const query = new URLSearchParams({
    book,
    chapter,
    display,
    translation,
    ...(verse && { verse }),
  });

  // Redirect to the home page with the parameters
  redirect(`/?${query.toString()}`);
} 