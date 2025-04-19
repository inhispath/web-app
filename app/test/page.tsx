import type { Metadata } from "next";

export const generateMetadata = (): Metadata => {
  const title = "/home | In His Path";
  const description = Math.floor(Math.random() * 1000).toString();
  const url = "https://beta.inhispath.com/home";
  const image = "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg/960px-Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg";

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
