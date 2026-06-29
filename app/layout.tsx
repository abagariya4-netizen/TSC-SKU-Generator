import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from 'next/link'

const inter = Inter({ subsets: ["latin"] });

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
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 min-h-screen flex flex-col`}>
        <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">T</div>
                <span className="font-bold text-xl text-slate-900 tracking-tight">SKU Generator</span>
              </div>
              <nav className="flex gap-1">
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
    <Link href={href} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors">
      {children}
    </Link>
  )
}
