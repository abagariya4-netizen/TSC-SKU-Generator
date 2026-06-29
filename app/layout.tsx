import type { Metadata } from "next";
import { Inter, Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";
import Link from 'next/link'

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });
const spaceMono = Space_Mono({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-space-mono" });

export const metadata: Metadata = {
  title: "TSC SKU Generator",
  description: "Internal tool for generating SKUs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${spaceMono.variable}`}>
      <body className="font-sans bg-navy text-foreground min-h-screen flex flex-col antialiased">
        <header className="bg-card border-b border-border shadow-md sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white font-heading font-bold text-xl shadow-lg shadow-primary/20">T</div>
                <span className="font-heading font-bold text-xl text-foreground tracking-tight">SKU Generator</span>
              </div>
              <nav className="flex gap-2">
                <NavLink href="/">Single Entry</NavLink>
                <NavLink href="/csv">Bulk CSV</NavLink>
                <NavLink href="/history">History</NavLink>
                <NavLink href="/mappings">Mappings</NavLink>
              </nav>
            </div>
          </div>
        </header>
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}

function NavLink({ href, children }: { href: string, children: React.ReactNode }) {
  return (
    <Link href={href} className="px-4 py-2 rounded-lg text-sm font-medium text-muted hover:text-white hover:bg-white/5 transition-colors">
      {children}
    </Link>
  )
}
