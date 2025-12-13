import "../styles/globals.css";
import { useEffect } from "react";

function MyApp({ Component, pageProps }) {
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
  }, []);

  return (
    <>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;