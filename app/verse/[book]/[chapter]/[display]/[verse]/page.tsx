import { redirect } from "next/navigation";
import type { Metadata } from "next";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export const metadata: Metadata = {
  title: "In His Path",
  description: "Be among aaaaaaaaaaaaaaaaaaaaaaa the first to join our community, and help shape the future of In His Path.",
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
    url: "https://beta.inhispath.com/",
    title: "In His Path",
    description: "Be among aaaaaaaaaaaaaaaaaaaaaaa the first to join our community, and help shape the future of In His Path.",
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg/960px-Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg",
        width: 960,
        height: 436,
        alt: "Creation of Adam by Michelangelo"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "In His Path",
    description: "Be among aaaaaaaaaaaaaaaaaaaaaaa the first to join our community, and help shape the future of In His Path.",
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg/960px-Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg"
    ]
  }
};

// Awaited params in VersePage
export default async function VersePage({
  params,
}: {
  params: any;
}) {
  const { book, chapter, display, verse } = await params;  // Await the params here
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
