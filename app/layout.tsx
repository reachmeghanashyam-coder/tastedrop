import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TasteDrop // The Cultural Cart Agent",
  description: "An autonomous post-purchase discovery agent that uses Qloo's cultural taste graph to replace predictable accessory loops with high-margin lifestyle bundles.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="font-sans antialiased bg-[#FAFAFA]">
        {children}
      </body>
    </html>
  );
}
