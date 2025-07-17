import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Plamento',
  description: 'A modern login flow application.',
};

function Header() {
  return (
    <header className="absolute top-0 left-0 p-4 md:p-6">
      <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent text-transparent bg-clip-text">
        Plamento
      </h1>
    </header>
  );
}

function Footer() {
  return (
    <footer className="absolute bottom-0 left-0 w-full p-4 md:p-6 text-center text-muted-foreground text-sm">
      <div className="flex justify-center items-center space-x-4">
        <span>© 2025 Plamento</span>
        <span className="border-l h-4 border-muted-foreground/50"></span>
        <Link href="#" className="hover:text-primary">Support</Link>
        <span className="border-l h-4 border-muted-foreground/50"></span>
        <Link href="#" className="hover:text-primary">Privacy</Link>
        <span className="border-l h-4 border-muted-foreground/50"></span>
        <Link href="#" className="hover:text-primary">Terms</Link>
      </div>
    </footer>
  );
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet"></link>
      </head>
      <body className="font-body antialiased relative">
        <Header />
        {children}
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
