import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export const metadata = {
  title: "Gifts - Yuukke",
  description: "Build your own hamper",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
