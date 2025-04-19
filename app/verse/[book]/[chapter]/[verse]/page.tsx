import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { headers } from "next/headers";
import Script from "next/script";

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

// This component actually renders content rather than immediately redirecting
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
  });
  
  const redirectUrl = `/?${query.toString()}`;
  
  // Fetch verse content for display
  let verseText = "Loading verse...";
  let bookName = "Bible";
  
  try {
    // Fetch books to get the book name
    const booksRes = await fetch(`${API_BASE_URL}/translations/AKJV/books`, { 
      cache: 'no-store'
    });
    
    if (booksRes.ok) {
      const books = await booksRes.json();
      const bookData = books.find((b: any) => String(b.id) === book);
      
      if (bookData) {
        bookName = bookData.name;
        
        // Fetch verses for the chapter
        const versesRes = await fetch(
          `${API_BASE_URL}/translations/AKJV/books/${bookData.id}/chapters/${chapter}/verses`, 
          { cache: 'no-store' }
        );
        
        if (versesRes.ok) {
          const verses = await versesRes.json();
          const verseData = verses.find((v: { verse: number }) => v.verse === parseInt(verse));
          if (verseData?.text) {
            verseText = verseData.text;
          }
        }
      }
    }
  } catch (error) {
    console.error("Error fetching verse:", error);
  }

  // Render a minimal page with the verse text and auto-redirect
  return (
    <html>
      <head>
        <meta property="og:title" content={`${bookName} ${chapter}:${verse} | In His Path`} />
        <meta property="og:description" content={verseText} />
        <meta property="og:image" content="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg/960px-Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg" />
        <meta property="og:url" content={`https://beta.inhispath.com/verse/${book}/${chapter}/${verse}`} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="In His Path" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${bookName} ${chapter}:${verse} | In His Path`} />
        <meta name="twitter:description" content={verseText} />
        <meta name="twitter:image" content="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg/960px-Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg" />

        <title>{`${bookName} ${chapter}:${verse} | In His Path`}</title>
        <meta name="description" content={verseText} />
      </head>
      <body style={{
        fontFamily: 'system-ui, -apple-system, sans-serif',
        width: '100%',
        margin: '0',
        padding: '0',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        textAlign: 'center',
        overflow: 'hidden'
      }}>
        <div style={{
          textAlign: 'center', 
          padding: '40px 20px',
          lineHeight: 1.6,
          color: '#333',
        }}>
          <h1 style={{ fontSize: '24px', marginBottom: '20px' }} className="font-primary">{`${bookName} ${chapter}:${verse}`}</h1>
          <p style={{ fontSize: '18px', marginBottom: '30px', fontStyle: 'italic', maxWidth: '800px' }} className="font-primary">{verseText}</p>
          <a href={redirectUrl} style={{
            display: 'inline-block',
            background: '#684242',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '8px',
            textDecoration: 'none',
            marginTop: '20px'
          }}>
            View in Chapter
          </a>
        </div>
      </body>
    </html>
  );
} 