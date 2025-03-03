import "../styles/globals.css";
import { useEffect } from "react";

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    try {
      Android.completePageLoad();
    } catch (error) {
      if (window.location.href.includes("privacy")) return;
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