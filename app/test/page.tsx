import type { Metadata } from "next";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const title = "/home | In His Path";
  let description = "For God so loved the world..."; // Default in case API fails
  const url = "https://beta.inhispath.com/home";
  const image = "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg/960px-Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg";

  try {
    // Fetch John 3:16 (book 43, chapter 3, verse 16)
    const bookId = 43;
    const chapter = 3;
    const verseNumber = 16;
    const translation = "AKJV";
    
    // Fetch verses for the chapter
    const res = await fetch(
      `${API_BASE_URL}/translations/${translation}/books/${bookId}/chapters/${chapter}/verses`,
      { cache: 'no-store' }
    );
    
    if (!res.ok) {
      throw new Error(`Failed to fetch verses: ${res.status}`);
    }
    
    const verses = await res.json();
    
    // Find verse 16
    const verse = verses.find((v: { verse: number }) => v.verse === verseNumber);
    if (verse?.text) {
      description = verse.text;
      console.log(`Found John 3:16: ${description}`);
    }
  } catch (error) {
    console.error("Failed to fetch verse text for metadata:", error);
  }

  return {
    title,
    description,
    icons: {
      icon: [
        {
          url: '/dark.ico',
          media: '(prefers-color-scheme: light)',
        },
        {
          url: '/light.ico',
          media: '(prefers-color-scheme: dark)',
        },
      ],
    },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      images: [
        {
          url: image,
          width: 960,
          height: 436,
          alt: "Creation of Adam by Michelangelo"
        }
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    }
  };
};

export default function HomePage() {
  return <div>Welcome to the Home Page</div>;
}
