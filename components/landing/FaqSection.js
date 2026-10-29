import { landingFaqGroups } from '../../lib/landing/faq';
import styles from '../../styles/Landing.module.css';

export default function FaqSection({ standalone = false }) {
  const Heading = standalone ? 'h1' : 'h2';
  return <section id="faq" className={styles.faqSection} aria-labelledby="faq-title">
    <div className={styles.sectionHeading}><p>FAQ</p><Heading id="faq-title">자주 묻는 질문</Heading></div>
    <div className={styles.supportFaq}>
      {landingFaqGroups.map(group => <section className={styles.faqGroup} key={group.id} aria-labelledby={`faq-${group.id}`}><h3 id={`faq-${group.id}`}>{group.title}</h3>{group.items.map(item => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p>{item.link && <a href={item.link.href}>{item.link.label}</a>}</details>)}</section>)}
    </div>
  </section>;
}
