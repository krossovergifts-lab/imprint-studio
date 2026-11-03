import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Imprint Studio",
  description: "Headless product-personalization engine.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
