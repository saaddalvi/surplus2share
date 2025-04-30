import { Poppins } from "next/font/google";
import "./globals.css";
import Navbar from '@/components/navbar';
import HideComponentAt from "@/lib/HideComponentAt";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export const metadata = {
  title: "Surplus2Share",
  description: "Platform for donating surplus items to NGOs",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} font-sans antialiased`}
      >
        <HideComponentAt path={["/login","register"]}>
          <Navbar />
        </HideComponentAt>
        {children}
      </body>
    </html>
  );
}
