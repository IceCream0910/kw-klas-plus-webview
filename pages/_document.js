import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="ko">
      <Head>
        <link rel="preload" href="https://cdn.jsdelivr.net/gh/toss/tossface/dist/tossface.css" as="style" />
        <link rel="preload" href="https://cdn.jsdelivr.net/gh/wanteddev/wanted-sans@v1.0.3/packages/wanted-sans/fonts/webfonts/variable/split/WantedSansVariable.min.css" as="style" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/toss/tossface/dist/tossface.css" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/wanteddev/wanted-sans@v1.0.3/packages/wanted-sans/fonts/webfonts/variable/split/WantedSansVariable.min.css" />
        <script type="text/javascript" src="https://t1.daumcdn.net/kas/static/ba.min.js" async></script>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
      <script defer src="https://cloud.umami.is/script.js" data-website-id="ed89a4a4-7e32-47ad-bc76-b7b9a77795b0"></script>
    </Html>
  );
}
