import { redirect } from "next/navigation";
import type { Metadata } from "next";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export async function generateMetadata({
  params,
}: {
  params: {
    book: string;
    chapter: string;
    display: string;
    verse: string;
  };
}): Promise<Metadata> {
  const { book, chapter, display, verse } = await params;
  const translation = "AKJV";

  let verseText = "Bible verse from In His Path.";
  let bookName = book;

  try {
    const booksRes = await fetch(`${API_BASE_URL}/translations/${translation}/books`);
    const books = await booksRes.json();

    const bookData = books.find((b: any) =>
      b.name.toLowerCase() === book.toLowerCase() || String(b.id) === book
    );

    if (bookData) {
      bookName = bookData.name;
      const versesRes = await fetch(
        `${API_BASE_URL}/translations/${translation}/books/${bookData.id}/chapters/${chapter}/verses`
      );
      const verses = await versesRes.json();

      const verseData = verses.find((v: { verse: number }) => v.verse === parseInt(verse));
      if (verseData?.text) {
        verseText = verseData.text;
      }
    }
  } catch (error) {
    console.error("Failed to fetch verse text for metadata:", error);
  }

  const title = `${bookName} ${chapter}:${verse} (${translation}) | In His Path`;
  const url = `https://beta.inhispath.com/verse/${book}/${chapter}/${display}/${verse}`;
  const image =
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg/960px-Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg";

  return {
    title,
    description: verseText,
    openGraph: {
      title,
      description: verseText,
      type: "website",
      url,
      images: [{ url: image, width: 960, height: 436, alt: "Creation of Adam by Michelangelo" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: verseText,
      images: [image],
    },
  };
}

export default async function VersePage({
  params,
}: {
  params: {
    book: string;
    chapter: string;
    display: string;
    verse: string;
  };
}) {
  const { book, chapter, display, verse } = await params;
  const translation = "AKJV";

  const query = new URLSearchParams({
    book,
    chapter,
    display,
    verse,
    translation,
  });

  redirect(`/?${query.toString()}`);
}
