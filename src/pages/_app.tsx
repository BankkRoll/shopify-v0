// src/pages/_app.tsx
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from "@/lib/theme-provider";
import Header from "@/components/Header";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <Header />
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
