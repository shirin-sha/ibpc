import { Inter } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';
import { ToastProvider } from '@/components/ui/Toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'IBPC Connect - Member Management System',
  description: 'Professional member management system for IBPC Kuwait',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <Providers>
          <ToastProvider>
            <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900">
              {children}
            </div>
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}