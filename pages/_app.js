import "../styles/globals.css";
import { useEffect } from "react";

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    try {
      Android.completePageLoad();
    } catch (error) {
      console.log("not app");
    }
  }, []);

  return (
    <>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;