import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export default function Page(props: any) {
  const { book, chapter, display } = props.params;
  const verse = props.searchParams?.verse;
  const translation = props.searchParams?.translation || 'AKJV';

  const query = new URLSearchParams({
    book,
    chapter,
    display,
    translation,
    ...(verse && { verse }),
  });
  
  redirect(`/?${query.toString()}`);
}

export async function generateMetadata(props: any): Promise<Metadata> {
  const { book, chapter, display } = props.params;
  const verse = props.searchParams?.verse || '1';
  const translation = props.searchParams?.translation || 'AKJV';

  let verseText = 'Bible verse from In His Path.';
  let bookName = book;

  try {
    const booksRes = await fetch(`${API_BASE_URL}/translations/${translation}/books`);
    const books = await booksRes.json();
    const bookData = books.find((b: any) => 
      b.name.toLowerCase() === book.toLowerCase() || 
      String(b.id) === book
    );
    
    if (bookData) {
      bookName = bookData.name;
      const versesRes = await fetch(
        `${API_BASE_URL}/translations/${translation}/books/${bookData.id}/chapters/${chapter}/verses`
      );
      const verses = await versesRes.json();
      
      const verseData = verses.find((v: any) => v.verse === parseInt(verse));
      if (verseData) {
        verseText = verseData.text || verseText;
      }
    }
  } catch (error) {
    console.error('Failed to fetch verse text for metadata:', error);
  }

  const title = `${bookName} ${chapter}:${verse} (${translation}) | In His Path`;

  return {
    title,
    description: verseText,
    openGraph: {
      title,
      description: verseText,
      type: 'website',
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
      images: [
        'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg/960px-Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg',
      ],
    },
  };
} 