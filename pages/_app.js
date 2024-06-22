import "@/styles/globals.css";
import { useEffect } from 'react';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    window.receiveToken = function (token) {
      if (!token) return;
      localStorage && localStorage.setItem('klas-plus-token', token);
    };
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;