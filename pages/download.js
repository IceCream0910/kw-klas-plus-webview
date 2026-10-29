import Head from 'next/head';
import { useEffect } from 'react';
import IonIcon from '@reacticons/ionicons';
import { APP_STORES, detectStorePlatform } from '../lib/landing/stores.mjs';
import styles from '../styles/Landing.module.css';

export default function Download() {
  useEffect(() => {
    const platform = detectStorePlatform(navigator.userAgent, navigator.maxTouchPoints);
    if (platform) window.location.replace(APP_STORES[platform].url);
  }, []);
  return <div className={styles.site} lang="ko"><Head><title>KLAS+ 다운로드</title><meta name="robots" content="noindex" /></Head><main className={styles.downloadPage}><a className={styles.brand} href="/"><img src="/landing/app-icon.webp" width="44" height="44" alt="" />KLAS+</a><p>모바일에서는 해당 스토어로 자동 연결됩니다.<br />이동하지 않으면 아래에서 스토어를 선택해 주세요.</p><div className={styles.downloadChoices}>{Object.entries(APP_STORES).map(([key, store]) => <a key={key} href={store.url}><IonIcon name={key === 'ios' ? 'logo-apple' : 'logo-google-playstore'} aria-hidden="true" />{store.name}</a>)}</div><br /><a href="/">홈으로 돌아가기</a></main></div>;
}
