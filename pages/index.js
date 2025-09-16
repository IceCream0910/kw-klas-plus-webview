import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>KLAS+</title>
        <meta name="description" content="KLAS+ Webview Page" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script>
          window.location.replace("https://play.google.com/store/apps/details?id=com.icecream.kwklasplus");
        </script>
      </Head>
    </>
  );
}
