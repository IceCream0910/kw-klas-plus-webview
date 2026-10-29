import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="ko">
      <Head>
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
        <link rel="icon" href="/favicon.ico?v=klas-plus" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="preload" href="https://cdn.jsdelivr.net/gh/toss/tossface/dist/tossface.css" as="style" />
        <link rel="preload" href="https://cdn.jsdelivr.net/gh/wanteddev/wanted-sans@v1.0.3/packages/wanted-sans/fonts/webfonts/variable/split/WantedSansVariable.min.css" as="style" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
