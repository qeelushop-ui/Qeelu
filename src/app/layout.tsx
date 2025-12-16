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
        
        {/* TikTok Pixel Code */}
        <Script
          id="tiktok-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function (w, d, t) {
                w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
                ttq.load('D4Q11B3C77UEL4B6KHHG');
                ttq.page();
              }(window, document, 'ttq');
            `,
          }}
        />
        
        {/* Meta Pixel Code */}
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '867472615779096');
              fbq('track', 'PageView');
            `,
          }}
        />

        {/* TikTok Pixel Code */}
<Script
  id="tiktok-pixel-new"
  strategy="afterInteractive"
  dangerouslySetInnerHTML={{
    __html: `
      !function (w, d, t) {
        w.TiktokAnalyticsObject=t;
        var ttq=w[t]=w[t]||[];
        ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"];
        ttq.setAndDefer=function(t,e){
          t[e]=function(){
            t.push([e].concat(Array.prototype.slice.call(arguments,0)))
          }
        };
        for(var i=0;i<ttq.methods.length;i++){
          ttq.setAndDefer(ttq,ttq.methods[i])
        }
        ttq.instance=function(t){
          for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++){
            ttq.setAndDefer(e,ttq.methods[n])
          }
          return e
        };
        ttq.load=function(e,n){
          var r="https://analytics.tiktok.com/i18n/pixel/events.js",
          o=n&&n.partner;
          ttq._i=ttq._i||{};
          ttq._i[e]=[];
          ttq._i[e]._u=r;
          ttq._t=ttq._t||{};
          ttq._t[e]=+new Date;
          ttq._o=ttq._o||{};
          ttq._o[e]=n||{};
          n=document.createElement("script");
          n.type="text/javascript";
          n.async=!0;
          n.src=r+"?sdkid="+e+"&lib="+t;
          e=document.getElementsByTagName("script")[0];
          e.parentNode.insertBefore(n,e)
        };
        ttq.load('D4RFHKBC77U52IPQMSIG');
        ttq.page();
      }(window, document, 'ttq');
    `,
  }}
/>

        {/* TikTok Pixel Code */}
<Script
  id="tiktok-pixel"
  strategy="afterInteractive"
  dangerouslySetInnerHTML={{
    __html: `
      !function (w, d, t) {
        w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
        ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],
        ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
        for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
        ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
        ttq.load=function(e,n){
          var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;
          ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,
          ttq._t=ttq._t||{},ttq._t[e]=+new Date,
          ttq._o=ttq._o||{},ttq._o[e]=n||{};
          n=document.createElement("script");
          n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;
          e=document.getElementsByTagName("script")[0];
          e.parentNode.insertBefore(n,e)
        };
        ttq.load('D4SNND3C77U3O2FSIOT0');
        ttq.page();
      }(window, document, 'ttq');
    `,
  }}
/>

        {/* TikTok Pixel Code */}
<script
  dangerouslySetInnerHTML={{
    __html: `
      !function (w, d, t) {
        w.TiktokAnalyticsObject = t;
        var ttq = w[t] = w[t] || [];
        ttq.methods = [
          "page", "track", "identify", "instances",
          "debug", "on", "off", "once", "ready",
          "alias", "group", "enableCookie", "disableCookie"
        ];
        ttq.setAndDefer = function (t, e) {
          t[e] = function () {
            t.push([e].concat(Array.prototype.slice.call(arguments, 0)))
          }
        };
        for (var i = 0; i < ttq.methods.length; i++) {
          ttq.setAndDefer(ttq, ttq.methods[i])
        }
        ttq.instance = function (t) {
          var e = ttq._i[t] || [];
          for (var r = 0; r < ttq.methods.length; r++) {
            ttq.setAndDefer(e, ttq.methods[r])
          }
          return e
        };
        ttq.load = function (t, e) {
          var r = "https://analytics.tiktok.com/i18n/pixel/events.js";
          ttq._i = ttq._i || {};
          ttq._i[t] = [];
          ttq._i[t]._u = r;
          ttq._t = ttq._t || {};
          ttq._t[t] = +new Date;
          ttq._o = ttq._o || {};
          ttq._o[t] = e || {};
          var a = document.createElement("script");
          a.type = "text/javascript";
          a.async = !0;
          a.src = r + "?sdkid=" + t + "&lib=" + "ttq";
          var s = document.getElementsByTagName("script")[0];
          s.parentNode.insertBefore(a, s)
        };

        // === LOAD BOTH PIXELS === 

        // Pixel 1
        ttq.load('D4Q11B3C77UEL4B6KHHG');
        ttq.page();

        // Pixel 2
        ttq.load('D4RFHKBC77U52IPQMSIG');
        ttq.page();
      }(window, document, 'ttq');
    `,
  }}
/>
        {/* TikTok Pixel Code */}
<Script
  id="tiktok-pixel"
  strategy="afterInteractive"
  dangerouslySetInnerHTML={{
    __html: `
      !function (w, d, t) {
        w.TiktokAnalyticsObject=t;
        var ttq=w[t]=w[t]||[];
        ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"];
        ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
        for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
        ttq.instance=function(t){
          for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);
          return e
        };
        ttq.load=function(e,n){
          var r="https://analytics.tiktok.com/i18n/pixel/events.js";
          var o=n&&n.partner;
          ttq._i=ttq._i||{};
          ttq._i[e]=[];
          ttq._i[e]._u=r;
          ttq._t=ttq._t||{};
          ttq._t[e]=+new Date;
          ttq._o=ttq._o||{};
          ttq._o[e]=n||{};
          n=document.createElement("script");
          n.type="text/javascript";
          n.async=!0;
          n.src=r+"?sdkid="+e+"&lib="+t;
          e=document.getElementsByTagName("script")[0];
          e.parentNode.insertBefore(n,e)
        };

        ttq.load('D3OGC13C77U93U3T1L40');
        ttq.page();
      }(window, document, 'ttq');
    `,
  }}
/>

{/* Meta Pixel – Additional Pixel Init */}
<Script
  id="meta-pixel-25427020606950381"
  strategy="afterInteractive"
  dangerouslySetInnerHTML={{
    __html: `
      if (window.fbq) {
        fbq('init', '25427020606950381');
        fbq('track', 'PageView');
      }
    `,
  }}
/>

        <noscript>
          <img 
            height="1" 
            width="1" 
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=867472615779096&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        
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
