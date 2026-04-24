import Head from "next/head";
import { useEffect } from "react";

export default function Home() {

  useEffect(() => {
    window.location.replace("https://play.google.com/store/apps/details?id=com.icecream.kwklasplus");
  }, []);

  return (
    <>
      <Head>
        <title>KLAS+</title>
        <meta name="description" content="KLAS+ Webview Page" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
    </>
  );
}
