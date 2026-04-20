import "../styles/globals.css";
import { useEffect } from "react";
import Script from 'next/script';
import { useRouter } from 'next/router';
import { identifyUser } from '../lib/core/analytics';

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_DEVELOPMENT && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('Service Worker registered successfully:', registration.scope);
        })
        .catch(error => {
          console.log('Service Worker registration failed:', error);
        });
    }

    try {
      Android.completePageLoad();
    } catch (error) {
      if (window.location.href.includes("privacy")) return;
      if (process.env.NEXT_PUBLIC_DEVELOPMENT) return;
      window.location.replace("https://play.google.com/store/apps/details?id=com.icecream.kwklasplus");
    }

    const handleRouteChange = () => {
      const hakbun = localStorage.getItem('klasplus_lastSessionID');
      if (hakbun) {
        identifyUser(hakbun);
      }
    };

    setTimeout(handleRouteChange, 1000);
    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return (
    <>
      <Component {...pageProps} />
      <Script
        src="https://rybbit.yuntae.in/api/script.js"
        data-site-id="e4129eea280e"
        strategy="afterInteractive"
      />
    </>
  );
}

export default MyApp;