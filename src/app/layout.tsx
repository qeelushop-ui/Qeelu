import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import Script from "next/script";
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
        <Script
          id="snap-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function()
              {a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};
              a.queue=[];var s='script';r=t.createElement(s);r.async=!0;
              r.src=n;var u=t.getElementsByTagName(s)[0];
              u.parentNode.insertBefore(r,u);})(window,document,
              'https://sc-static.net/scevent.min.js');
              snaptr('init', '35b72bcc-e8cf-449f-abab-242ccc67bbf0', {});
              snaptr('track', 'PAGE_VIEW');
            `,
          }}
        />
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
