import "../styles/globals.css";
import { useEffect } from "react";

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    console.log('App mounted');
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