'use client';
import { ThemeProvider } from 'next-themes';
import { SessionProvider } from 'next-auth/react';
// import ToastProvider from './ToastProvider';

export default function Providers({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SessionProvider>
        {/* <ToastProvider> */}
          {children}
        {/* </ToastProvider> */}
      </SessionProvider>
    </ThemeProvider>
  );
}