import { useEffect, useState } from 'react';
import IonIcon from '@reacticons/ionicons';
import { APP_STORES, detectStorePlatform } from '../../lib/landing/stores.mjs';
import styles from '../../styles/Landing.module.css';

export default function DownloadButton({ compact = false }) {
  const [platform, setPlatform] = useState(null);
  useEffect(() => setPlatform(detectStorePlatform(navigator.userAgent, navigator.maxTouchPoints)), []);
  return <div className={styles.downloadButton}>
    <a href="/download"><IonIcon name="download-outline" aria-hidden="true" style={{ display: 'inline-flex', width: 16, height: 16, lineHeight: 0, flexShrink: 0 }} /><span>{compact ? '다운로드' : platform === 'android' ? 'Android에 다운로드' : platform === 'ios' ? 'iPhone·iPad에 다운로드' : 'KLAS+ 다운로드'}</span></a>
    <details><summary aria-label="다운로드 스토어 선택"><IonIcon name="chevron-down" aria-hidden="true" /></summary><div className={styles.storeMenu}>{Object.entries(APP_STORES).map(([key,store]) => <a href={store.url} key={key}><IonIcon name={key==='ios'?'logo-apple':'logo-google-playstore'} aria-hidden="true" />{store.name}</a>)}</div></details>
  </div>;
}
