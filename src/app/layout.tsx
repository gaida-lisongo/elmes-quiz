import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import "flatpickr/dist/flatpickr.css";
import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { SoundProvider } from '@/context/SoundContext';

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  title: {
    default: "ELMES-QUIZ — Apprends, Joue et Gagne",
    template: "%s | ELMES-QUIZ",
  },
  description:
    "ELMES-QUIZ est la plateforme de quiz éducatifs qui récompense tes connaissances. Inscris-toi gratuitement, reçois 10 parties offertes et participe aux compétitions chaque weekend pour gagner de l'argent réel par Mobile Money.",
  keywords: ["quiz", "éducation", "argent", "Mobile Money", "RDC", "compétition", "ELMES-QUIZ", "apprendre", "gagner"],
  authors: [{ name: "ELMES-QUIZ" }],
  openGraph: {
    title: "ELMES-QUIZ — Apprends, Joue et Gagne",
    description:
      "La plateforme de quiz éducatifs qui récompense tes connaissances. Compétitions chaque weekend, gains par Mobile Money.",
    type: "website",
    locale: "fr_CD",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${outfit.className} dark:bg-gray-900`} suppressHydrationWarning>
        <ThemeProvider>
          <SidebarProvider>
            <SoundProvider>{children}</SoundProvider>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
