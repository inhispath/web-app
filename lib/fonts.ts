import { Inter, Roboto, Lora, Montserrat, JetBrains_Mono, Albert_Sans, Lato } from 'next/font/google';

export type FontOption = {
  name: string;
  className: string;
  fontObject: any;
  type: 'sans' | 'serif' | 'mono';
};

// Define the Inter font with Latin subset
export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

// Define the Roboto font with Latin subset
export const roboto = Roboto({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto',
});

// Define the Lora font (serif) with Latin subset
export const lora = Lora({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lora',
});

// Define the Montserrat font with Latin subset
export const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
});

// Define the JetBrains Mono font (monospace) with Latin subset
export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
});

// Define the Albert Sans font with Latin subset (primary default)
export const albertSans = Albert_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-albert-sans',
});

// Define the Lato font with Latin subset (secondary default)
export const lato = Lato({
  weight: ['400', '700', '900'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lato',
});

// Font options available in the app
export const fontOptions: Record<string, FontOption> = {
  albertSans: {
    name: 'Albert Sans (Sans)',
    className: albertSans.variable,
    fontObject: albertSans,
    type: 'sans',
  },
  lato: {
    name: 'Lato (Sans)',
    className: lato.variable,
    fontObject: lato,
    type: 'sans',
  },
  inter: {
    name: 'Inter (Sans)',
    className: inter.variable,
    fontObject: inter,
    type: 'sans',
  },
  roboto: {
    name: 'Roboto (Sans)',
    className: roboto.variable,
    fontObject: roboto,
    type: 'sans',
  },
  lora: {
    name: 'Lora (Serif)',
    className: lora.variable,
    fontObject: lora,
    type: 'serif',
  },
  montserrat: {
    name: 'Montserrat (Sans)',
    className: montserrat.variable,
    fontObject: montserrat,
    type: 'sans',
  },
  jetbrainsMono: {
    name: 'JetBrains Mono (Monospace)',
    className: jetbrainsMono.variable,
    fontObject: jetbrainsMono,
    type: 'mono',
  },
}; 