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
  title: "Qeelu Oman - Online Shopping with Free Delivery | Electronics, Watches & Gadgets",
  description: "Qeelu is Oman's trusted online store offering smartphones, tablets, watches, accessories, and more with free delivery and cash on delivery. Shop premium products at best prices in Oman.",
  keywords: "Qeelu Oman, Qeelu Online Shopping, Oman Online Store, Electronics Oman, Smartwatches Oman, Tablets Oman, Free delivery Oman, Cash on delivery Oman, Best deals Oman, Mobile accessories Oman, iPads Oman, Gadgets Oman",
  icons: {
    icon: [
      { url: '/Qeelu-white.png', sizes: '32x32', type: 'image/png' },
      { url: '/Qeelu-white.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/Qeelu-white.png',
    apple: [
      { url: '/Qeelu-white.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: "Qeelu Oman - Online Shopping with Free Delivery",
    description: "Qeelu is Oman's trusted online store offering smartphones, tablets, watches, accessories, and more with free delivery and cash on delivery.",
    images: ['/Qeelu-white.png'],
  },
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
        snaptr('track', 'ADD_CART', {'price': INSERT_PRICE, 'currency': 'INSERT_CURRENCY', 'item_ids': ['INSERT_ITEM_ID_1', 'INSERT_ITEM_ID_2'], 'item_category': 'INSERT_ITEM_CATEGORY', 'number_items': INSERT_NUMBER_ITEMS, 'uuid_c1': 'INSERT_UUID_C1', 'user_email': 'INSERT_USER_EMAIL', 'user_phone_number': 'INSERT_USER_PHONE_NUMBER', 'user_hashed_email': 'INSERT_USER_HASHED_EMAIL', 'user_hashed_phone_number': 'INSERT_USER_HASHED_PHONE_NUMBER'})
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
