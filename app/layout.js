import { Crimson_Pro } from "next/font/google";
import "./globals.css";

const crimson = Crimson_Pro({ 
  subsets: ["latin"],
  weight: ['400', '600', '700', '900'],
  style: ['normal', 'italic'],
  variable: '--font-crimson',
});

export const metadata = {
  title: "Mubashir Mohsin | Academic Portfolio",
  description: "Master of Computer Science Student & Researcher",
  icons: {
    icon: "/muba.ico", // <-- Add your favicon here
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={crimson.className}>{children}</body>
    </html>
  );
}
