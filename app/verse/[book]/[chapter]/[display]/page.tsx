import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

type Props = {
  params: { book: string; chapter: string; display: string };
  searchParams: { verse?: string; translation?: string };
};

// This needs to be a server component to generate metadata properly
export default function Page(props: any) {
  const { book, chapter, display } = props.params;
  const verse = props.searchParams?.verse;
  const translation = props.searchParams?.translation || 'AKJV';

  // Build the query string for redirection
  const query = new URLSearchParams({
    book,
    chapter,
    display,
    translation,
    ...(verse && { verse }),
  });
  
  // Redirect to home page with parameters
  redirect(`/?${query.toString()}`);
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { book, chapter, display } = props.params;
  const verse = props.searchParams?.verse || '1';
  const translation = props.searchParams?.translation || 'AKJV';

  let verseText = 'Bible verse from In His Path.';
  let bookName = book;

  console.log('Generating metadata for:', { book, chapter, verse, translation });

  try {
    // Make sure to use fetch with the correct cache settings
    const booksRes = await fetch(`${API_BASE_URL}/translations/${translation}/books`, 
      { cache: 'no-store' }
    );
    
    if (!booksRes.ok) {
      console.error('Failed to fetch books:', booksRes.status);
      throw new Error(`API error: ${booksRes.status}`);
    }
    
    const books = await booksRes.json();
    const bookData = books.find((b: any) => 
      b.name.toLowerCase() === book.toLowerCase() || 
      String(b.id) === book
    );
    
    if (bookData) {
      bookName = bookData.name;
      // Fetch verses with no-store to ensure fresh data
      const versesRes = await fetch(
        `${API_BASE_URL}/translations/${translation}/books/${bookData.id}/chapters/${chapter}/verses`,
        { cache: 'no-store' }
      );
      
      if (!versesRes.ok) {
        console.error('Failed to fetch verses:', versesRes.status);
        throw new Error(`API error: ${versesRes.status}`);
      }
      
      const verses = await versesRes.json();
      
      const verseData = verses.find((v: any) => v.verse === parseInt(verse));
      if (verseData) {
        verseText = verseData.text || verseText;
        console.log('Found verse text:', verseText);
      } else {
        console.log('Verse not found in data');
      }
    } else {
      console.log('Book not found:', book);
    }
  } catch (error) {
    console.error('Failed to fetch verse text for metadata:', error);
  }

  const title = `${bookName} ${chapter}:${verse} (${translation}) | In His Path`;
  
  const metadata: Metadata = {
    title,
    description: verseText,
    openGraph: {
      title,
      description: verseText,
      type: 'website',
      siteName: 'In His Path',
      url: `https://beta.inhispath.com/verse/${book}/${chapter}/${display}${verse ? `?verse=${verse}` : ''}${translation ? `&translation=${translation}` : ''}`,
      images: [
        {
          url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg/960px-Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg',
          width: 960,
          height: 436,
          alt: 'Creation of Adam by Michelangelo',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: verseText,
      site: '@inhispath',
      images: [
        'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg/960px-Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg',
      ],
    },
  };

  console.log('Generated metadata:', metadata);
  
  return metadata;
} 