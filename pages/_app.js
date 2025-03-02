import { Inter, Hanken_Grotesk } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import '../styles.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const hankenGrotesk = Hanken_Grotesk({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

export default function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider attribute="class">
      <main className={`${inter.variable} ${hankenGrotesk.className}`}>
        <Component {...pageProps} />
      </main>
    </ThemeProvider>
  );
} ``