import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import I18nProvider from "@/components/I18nProvider";
import { ProductProvider } from "@/context/ProductContext";
import { OrderProvider } from "@/context/OrderContext";

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: 'swap',
  fallback: ['system-ui', 'arial'],
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: "Mega Deals Oman - with Free Delivery",
  description: "Best deals on electronics, cosmetics, watches and more with free delivery across Oman. Cash on delivery available.",
  keywords: "Mega Deals, Oman, online shopping, electronics, cosmetics, watches, free delivery",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-sans antialiased bg-[#f5f5f5]`}>
        <I18nProvider>
          <ProductProvider>
            <OrderProvider>
              {children}
            </OrderProvider>
          </ProductProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
