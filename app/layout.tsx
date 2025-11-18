import { Inter } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/providers/SessionProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// Prevent static generation issues with SessionProvider
export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return {
    title: "MovieReview AI - AI-Powered Movie Reviews",
    description: "Find your next movie with AI-aggregated reviews from trusted sources. Make informed decisions in seconds.",
    keywords: ["movies", "reviews", "AI", "movie recommendations", "film reviews"],
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
