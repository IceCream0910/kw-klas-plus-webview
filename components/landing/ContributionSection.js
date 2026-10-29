import IonIcon from '@reacticons/ionicons';
import styles from '../../styles/Landing.module.css';

export default function ContributionSection() {
  return <section id="contribute" className={styles.contribution}>
    <div className={styles.sectionHeading}><p>Open Source</p><h2>더 나은 KLAS+,<br />함께 만들어가요.</h2><span>KLAS+의 소스와 개발 과정은 GitHub에 오픈소스로 열려있어요.<br />관심 있는 분들은 누구나 이슈를 제보하거나 코드를 기여할 수 있어요.</span></div>
    <div className={styles.repositoryLinks}>
      <a href="https://github.com/IceCream0910/kw-klas-plus"><IonIcon name="logo-github" aria-hidden="true" style={{ display: 'flex', width: 26, height: 26, flexShrink: 0, lineHeight: 0 }} /><span><strong>Android · iOS</strong><small>네이티브 앱 Repository</small></span><span aria-hidden="true">↗</span></a>
      <a href="https://github.com/IceCream0910/kw-klas-plus-webview"><IonIcon name="logo-github" aria-hidden="true" style={{ display: 'flex', width: 26, height: 26, flexShrink: 0, lineHeight: 0 }} /><span><strong>WebView</strong><small>WebView 페이지 Repository</small></span><span aria-hidden="true">↗</span></a>
    </div></section>;
}
