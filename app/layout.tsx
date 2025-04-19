import type { Metadata } from "next";
import "./globals.css";

import { ThemeProvider } from "../components/theme/ThemeProvider";
import { FontProvider } from "../components/fonts/FontProvider";
import { 
  inter, 
  roboto, 
  lora, 
  montserrat, 
  jetbrainsMono,
  albertSans,
  lato
} from "../lib/fonts";
import MobileBlocker from "./components/MobileBlocker";

// export const metadata: Metadata = {
//   title: "In His Path",
//   description: "Be among the first to join our community, and help shape the future of In His Path.",
//   icons: {
//     icon: [
//       {
//         url: '/dark.ico',
//         media: '(prefers-color-scheme: light)',
//       },
//       {
//         url: '/light.ico',
//         media: '(prefers-color-scheme: dark)',
//       },
//     ],
//   },
//   openGraph: {
//     type: "website",
//     url: "https://beta.inhispath.com/",
//     title: "In His Path",
//     description: "Be among the first to join our community, and help shape the future of In His Path.",
//     images: [
//       {
//         url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg/960px-Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg",
//         width: 960,
//         height: 436,
//         alt: "Creation of Adam by Michelangelo"
//       }
//     ]
//   },
//   twitter: {
//     card: "summary_large_image",
//     title: "In His Path",
//     description: "Be among the first to join our community, and help shape the future of In His Path.",
//     images: [
//       "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg/960px-Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg"
//     ]
//   }
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`
        ${albertSans.variable} 
        ${lato.variable}
        ${inter.variable} 
        ${roboto.variable} 
        ${lora.variable}
        ${montserrat.variable}
        ${jetbrainsMono.variable}
      `}>
        <ThemeProvider>
          <FontProvider>
            <MobileBlocker>
              {children}
            </MobileBlocker>
          </FontProvider>
        </ThemeProvider>
      </body>
    </html>
  );
} 