import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="ko">
      <Head>
        <link rel="preload" href="https://cdn.jsdelivr.net/gh/toss/tossface/dist/tossface.css" as="style" />
        <link rel="preload" href="https://cdn.jsdelivr.net/gh/wanteddev/wanted-sans@v1.0.3/packages/wanted-sans/fonts/webfonts/variable/split/WantedSansVariable.min.css" as="style" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/toss/tossface/dist/tossface.css" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/wanteddev/wanted-sans@v1.0.3/packages/wanted-sans/fonts/webfonts/variable/split/WantedSansVariable.min.css" />
        {!process.env.NEXT_PUBLIC_DEVELOPMENT && <>
          <script src="https://cdn.amplitude.com/script/3f0d01a4ba5d51de38f60874458c2fd2.js"></script>
          <script dangerouslySetInnerHTML={{ __html: "window.amplitude.add(window.sessionReplay.plugin({sampleRate: 1}));window.amplitude.init('3f0d01a4ba5d51de38f60874458c2fd2', {\"fetchRemoteConfig\":true,\"autocapture\":true});" }} />
        </>}
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7178712602934912"
          crossOrigin="anonymous"></script>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
