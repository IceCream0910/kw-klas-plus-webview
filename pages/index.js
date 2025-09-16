import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>KLAS+</title>
        <meta name="description" content="KLAS+ Webview Page" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:;base64,iVBORw0KGgo="/>
        <script>
          window.location.replace("https://play.google.com/store/apps/details?id=com.icecream.kwklasplus");
        </script>
      </Head>
    </>
  );
}
