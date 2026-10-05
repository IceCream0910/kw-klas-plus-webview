import Head from 'next/head';
import Link from 'next/link';
import styles from '../../styles/Legal.module.css';

export function LegalSection({ id, number, title, children }) {
  return <section id={id} className={styles.section} aria-labelledby={`${id}-title`}>
    <h2 id={`${id}-title`}><span>제{number}조</span>{title}</h2>
    {children}
  </section>;
}

export function LegalNote({ title, children }) {
  return <aside className={styles.note}><strong>{title}</strong><div>{children}</div></aside>;
}

export default function LegalDocument({ type, title, description, date, contents, summary, children }) {
  return <main className={styles.document} id="top">
    <Head><title>{title} | KLAS+</title><meta name="description" content={description} /></Head>
    <nav className={styles.tabs} aria-label="서비스 정책">
      <span className={styles.brand}>KLAS+</span>
      <Link href="/tos" aria-current={type === 'tos' ? 'page' : undefined}>이용약관</Link>
      <Link href="/privacy" aria-current={type === 'privacy' ? 'page' : undefined}>개인정보 처리방침</Link>
    </nav>
    <header className={styles.header}>
      <h1>{title}</h1><p>{description}</p><small>{date}</small>
    </header>
    <aside className={styles.overview} aria-label="문서 핵심 요약">
      <h2>먼저, 핵심만 살펴보세요</h2>
      <dl>{summary.map(({ title: label, text }) => <div key={label}><dt>{label}</dt><dd>{text}</dd></div>)}</dl>
      <p className={styles.caption}>이 요약은 이해를 돕기 위한 안내입니다. 자세한 내용은 아래 본문을 확인해주세요.</p>
    </aside>
    <nav className={styles.contents} aria-label="문서 목차">
      <h2>궁금한 내용 바로 찾기</h2>
      <ol>{contents.map(({ id, title }) => <li key={id}><a href={`#${id}`}>{title}<span aria-hidden="true">↗</span></a></li>)}</ol>
    </nav>
    <article className={styles.body}>{children}</article>
    <footer className={styles.footer}>
      <div><strong>궁금한 점이 있나요?</strong><p>서비스 이용과 개인정보에 관한 문의를 보내주세요.</p><a href="mailto:hey@yuntae.in">hey@yuntae.in</a></div>
      <a href="#top">맨 위로 ↑</a>
    </footer>
  </main>;
}
