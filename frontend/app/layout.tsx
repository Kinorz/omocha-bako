import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Omocha Bako Dashboard",
  description: "Next.js frontend for the Omocha Bako auth-enabled API",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50`}
      >
        <div className="min-h-screen">
          <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
              <Link
                href="/"
                className="text-lg font-semibold text-zinc-900 transition hover:text-emerald-600 dark:text-zinc-50"
              >
                Omocha Bako
              </Link>
              <nav className="flex items-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-300">
                <Link href="/register" className="transition hover:text-emerald-600">
                  ユーザー登録
                </Link>
                <Link href="/login" className="transition hover:text-emerald-600">
                  ログイン
                </Link>
              </nav>
            </div>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
