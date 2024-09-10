import { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";

export default function Document() {
  return (
    <Html lang="ko">
      <Head />
      <body>
        <Script
          async
          src={`https://www.googletagmanager.com/gtag/js
				?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}`}
        />
        <Script
          id="google-analytics"
          dangerouslySetInnerHTML={{
            __html: `
		window.dataLayer = window.dataLayer || [];
		function gtag(){dataLayer.push(arguments);}
		gtag('js', new Date());

		gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}');
		`,
          }}
        />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
