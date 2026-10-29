import { useEffect, useRef, useState } from 'react';
import DownloadButton from './DownloadButton';
import styles from '../../styles/Landing.module.css';

export function SiteHeader({ overlay = false }) {
  const marker = useRef(null);
  const [stuck, setStuck] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setStuck(entry.boundingClientRect.top < 0 && !entry.isIntersecting));
    observer.observe(marker.current);
    return () => observer.disconnect();
  }, []);
  return <><div ref={marker} className={styles.headerMarker} aria-hidden="true" /><header className={`${styles.headerShell} ${overlay ? styles.headerOverlay : ''}`} data-stuck={stuck}>
    <div className={styles.headerBackdrop} aria-hidden="true"><span /><span /><span /></div>
    <div className={styles.navigation}><a className={styles.brand} href="/" aria-label="KLAS+ 홈"><img src="/landing/app-icon.webp" width="30" height="30" alt="" />KLAS+</a><DownloadButton compact /></div>
  </header></>;
}
export function SiteFooter() {
  return <footer className={styles.footer}><div><a className={styles.brand} href="/">KLAS+</a><p>광운대학교의 공식 앱이 아닌<br />독립적인 비공식 프로젝트입니다.</p><div id="support" className={styles.footerContact}><h2>문의 및 지원</h2><a href="mailto:hey@yuntae.in?subject=KLAS%2B%20%EC%A7%80%EC%9B%90%20%EB%AC%B8%EC%9D%98">hey@yuntae.in <span aria-hidden="true">↗</span></a></div></div><div><span>KLAS+</span><a href="/#features">기능 소개</a><a href="/download">다운로드</a><a href="/changelog">업데이트 내역</a></div><div><span>지원 및 정책</span><a href="/#faq">자주 묻는 질문</a><a href="/privacy">개인정보 처리방침</a><a href="/tos">이용약관</a></div><div className={styles.footerBottom}><span>© 2026 KLAS+, Yun Taein</span></div></footer>;
}
