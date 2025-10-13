import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
    title: 'JLab Blog',
    description: 'Welcome to JLab Blog - Your source for insightful articles',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={`${inter.className} antialiased bg-gray-50 min-h-screen flex flex-col items-center justify-center`}>
                <header className="w-full flex flex-col items-center py-8 mb-8">
                    <img src="/logo.svg" alt="JLab Logo" className="w-20 h-20 mb-2 drop-shadow-lg" />
                    <h1 className="text-3xl font-extrabold text-blue-800 tracking-tight">by ecodexm</h1>
                </header>
                <main className="w-full flex-1 flex flex-col items-center justify-center">
                    {children}
                </main>
            </body>
        </html>
    );
} 