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

export const metadata: Metadata = {
  title: "Website",
  description: "A customizable website with theme and font options",
};

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
            {children}
          </FontProvider>
        </ThemeProvider>
      </body>
    </html>
  );
} 