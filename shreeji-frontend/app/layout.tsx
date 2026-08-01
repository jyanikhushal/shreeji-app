'use client';
import { I18nProvider } from '@/components/providers/I18nProvider';
import Toast from "@/components/ui/Toast";
import { useState } from "react";
import { Geist, Geist_Mono, Noto_Serif_Gujarati, Rozha_One } from "next/font/google";
const rozhaOne = Rozha_One({
  variable: "--font-rozha",
  weight: "400",
  subsets: ["latin"],
});
const notoSerifGujarati = Noto_Serif_Gujarati({
  variable: "--font-noto-gujarati",
  weight: ["600", "700"],
  subsets: ["gujarati"],
});

import "./globals.css";
import { ToastContext } from "@/app/context/ToastContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // GLOBAL TOAST SYSTEM
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"success" | "error" | "info" | "">("");

  const showMessage = (
    msgType: "success" | "error" | "info",
    text: string
  ) => {
    setMessage(text);
    setType(msgType);

    setTimeout(() => {
      setMessage("");
      setType("");
    }, 3000);
  };

  return (
    <html lang="en">
      <head>
        {/* ✅ Keeps mobile OS locked to Light Mode without breaking client rendering */}
        <meta name="color-scheme" content="only light" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${notoSerifGujarati.variable} ${rozhaOne.variable} antialiased`}>
        <ToastContext.Provider value={{ showMessage }}>
          <I18nProvider>
      {children}
    </I18nProvider>
        </ToastContext.Provider>

        <Toast message={message} type={type} />
      </body>
    </html>
  );
}