import { Inter, Roboto, Lora, Montserrat, JetBrains_Mono, Albert_Sans, Lato } from 'next/font/google';

export type FontOption = {
  name: string;
  className: string;
  fontObject: any;
  type: 'sans' | 'serif' | 'mono';
};

// Define the Inter font with all weights
export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

// Define the Roboto font with all weights
export const roboto = Roboto({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto',
});

// Define the Lora font (serif) with all weights
export const lora = Lora({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lora',
});

// Define the Montserrat font with all weights
export const montserrat = Montserrat({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
});

// Define the JetBrains Mono font (monospace) with all weights
export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
});

// Define the Albert Sans font with all weights
export const albertSans = Albert_Sans({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-albert-sans',
});

// Define the Lato font with all weights
export const lato = Lato({
  weight: ['100', '300', '400', '700', '900'],
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