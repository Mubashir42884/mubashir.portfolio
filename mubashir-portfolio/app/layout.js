import { Crimson_Pro, Inter } from "next/font/google";
import "./globals.css";

// Configure the Serif font (Academic look)
const crimsonPro = Crimson_Pro({ 
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["200", "300", "400", "600", "700"], // Loading multiple weights for headers/body
  style: ["normal", "italic"],
});

// Configure the Sans-Serif font (UI elements)
const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Mubashir Mohsin | Academic Portfolio",
  description: "Master of Computer Science Student at Dalhousie University. Researcher in AI, Healthcare, and Privacy.",
  keywords: ["Mubashir Mohsin", "Dalhousie", "Computer Science", "AI Research", "Machine Learning"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${crimsonPro.variable} ${inter.variable}`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}