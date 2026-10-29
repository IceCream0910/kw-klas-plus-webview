import Head from 'next/head';
import { motion, MotionConfig, useReducedMotion } from 'framer-motion';
import DownloadButton from '../components/landing/DownloadButton';
import FaqSection from '../components/landing/FaqSection';
import CoralHazeSky from '../components/landing/CoralHazeSky';
import ContributionSection from '../components/landing/ContributionSection';
import { SiteHeader, SiteFooter } from '../components/landing/SiteChrome';
import { DeadlinePreview, HomePreview, LecturePreview, LecturePlanPreview, PlayerPreview, LibraryPassPreview, SchedulePreview, CalendarPreview, SearchPreview, WidgetsPreview } from '../components/landing/FeaturePreviews';
import styles from '../styles/Landing.module.css';

function Reveal({ children, className = '' }) {
  const reduced = useReducedMotion();
  return <motion.div className={className} initial={false} whileInView={reduced ? {} : { opacity: [0.65, 1], y: [16, 0] }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: .65, ease: [.22, 1, .36, 1] }}>{children}</motion.div>;
}
function FeatureCard({ children, title, description, tall = false }) {
  return <article className={styles.featureCard}><div className={`${styles.featureVisual} ${tall ? styles.tallVisual : ''}`}>{children}</div><div className={styles.cardCopy}><h3>{title}</h3><p>{description}</p></div></article>;
}
function SectionHeading({ label, title, children }) {
  return <div className={styles.sectionHeading}><p>{label}</p><h2>{title}</h2>{children && <span>{children}</span>}</div>;
}
export default function Home() {
  return <MotionConfig reducedMotion="user"><Head><title>KLAS+ | 불편했던 KLAS를, 더 편리하게.</title><meta name="description" content="광운대학교 KLAS를 더 편리하게. 과제 마감, 강의, 시간표와 통합검색, 위젯과 알림까지. KLAS+ 다운로드와 고객 지원을 확인하세요." /><meta property="og:title" content="KLAS+ | 불편했던 KLAS를, 더 편리하게." /><meta property="og:description" content="광운인의 매일을 위한 KLAS+. Android와 iPhone, iPad에서 만나보세요." /><meta property="og:type" content="website" /><meta name="theme-color" content="#ffede8" /></Head>
    <div className={styles.site} lang="ko"><a className={styles.skipLink} href="#main">본문으로 건너뛰기</a>
      <SiteHeader overlay />
      <section className={styles.hero}>
        <div className={styles.heroSky} aria-hidden="true"><CoralHazeSky style={{ position: 'absolute', inset: 0, height: '100%', aspectRatio: 'auto' }} /></div>
        <div>
          <div className={styles.heroHeading}><p>KWU LMS Rebuild Project</p><h1>불편했던 KLAS를,<br />더 편리하게.</h1><DownloadButton /><span>Android 10 이상· iOS 16 이상 지원</span></div>
          <figure className={styles.heroShowcase}><img src="/landing/main-mockup-transparent.webp" width="1104" height="1424" fetchPriority="high" alt="KLAS+ 홈과 전체 메뉴 앱 목업 · 예시 데이터" /></figure>
        </div>
      </section>
      <main id="main" className={styles.content}>
        <section className={styles.introduction}><a href="#features">KLAS+ 소개 <span aria-hidden="true">›</span></a><div><p>오늘의 수업, 남은 과제, 새로 올라온 공지.<br />하루에도 몇 번씩 열어보는 KLAS니까.</p><p><strong>자주 쓰는 기능부터, 모바일에 맞게 다시 만들었어요.</strong><br /> 복잡한 메뉴를 오가지 않고, 지금 필요한 정보를 바로 확인하세요.</p></div></section>
        <section id="features" className={styles.featureSection}><SectionHeading label="Home" title={<>지금 필요한 정보를<br />가장 먼저 한 눈에.</>}>앱의 첫 화면에는 내 시간표에 맞춰 필요한 정보들을 모아서 보여줄게요.<br />남은 할 일과 강의 공지사항은 물론 학식 메뉴부터 학교 공지사항까지 홈 피드에서 만나보세요.</SectionHeading><Reveal className={styles.twoColumns}><FeatureCard title="내 시간표를 아는 첫 화면" description="현재 수업 중이거나 다가오는 강의의 강의실을 바로 확인하고, 원하면 강의 홈과 QR 출석으로 바로 이동할 수 있어요."><HomePreview /></FeatureCard><FeatureCard title="남아있는 할 일을 잊지 않도록" description="온라인 강의·과제·팀 프로젝트를 마감순으로 확인해요. 알림을 켜면 앱을 사용하지 않을 때도 24시간 안에 마감되는 할 일을 안내해요. 기기 설정에 따라 알림이 늦어질 수 있어요."><DeadlinePreview /></FeatureCard></Reveal></section>
        <section className={styles.featureSection}><SectionHeading label="Lecture & Campus" title={<>강의부터 도서관까지,<br />대학 생활에 더한 소소한 편리함.</>}>강의계획서를 확인하고, 수업을 듣고, 도서관으로 향하는 순간까지.</SectionHeading><Reveal className={styles.twoColumns}><FeatureCard tall title="수업에 필요한 것들을 한 화면에" description="과목 공지사항, 강의 자료, 과제와 출석 현황을 직관적으로 확인하고, 강의계획서나 QR 출석으로 바로 이동할 수도 있어요."><LecturePreview /></FeatureCard><FeatureCard tall title="읽기 편하게 다시 정리한 강의계획서" description="모바일에 최적화된 강의계획서를 만나보세요. 수업 정보와 평가 비율, 주차별 강의 일정 등 자주 봐야하는 항목을 위로 배치했어요."><LecturePlanPreview /></FeatureCard><FeatureCard tall title="내 페이스대로 듣는 온라인 강의" description="배속과 재생 위치를 조절하고, PiP로 다른 화면을 보면서도 수업을 이어갈 수 있어요."><PlayerPreview /></FeatureCard><FeatureCard tall title="도서관 출입증도, 앱 하나로 빠르게" description="중앙도서관 출입증을 설정하면 앱과 홈 화면 위젯에서 출입증을 바로 열 수 있어요. 도서관 이용을 위한 기능이며 공식 학생증의 모든 용도를 대신하지는 않아요."><LibraryPassPreview /></FeatureCard></Reveal></section>
        <section className={styles.featureSection}><SectionHeading label="Timetable & Calendar" title={<>이번 주 수업과 일정,<br />한눈에 들어오도록.</>} /><Reveal className={styles.twoColumns}><FeatureCard tall title="시간표를 더 보기 쉽게" description="알록달록한 색상과 함께 모바일에 최적화된 KLAS 연동 시간표를 보여줄게요. 헷갈리던 건물명을 정확하게 보여주고, 시간표에서 과목을 눌러 강의 홈으로 이동할 수 있어요."><SchedulePreview /></FeatureCard><FeatureCard tall title="학교 일정 옆에, 내 일정" description="학사 일정과 과제 마감은 물론 개인 일정까지, KLAS와 연결된 캘린더에서 한 번에 관리해보세요."><CalendarPreview /></FeatureCard></Reveal></section>
        <section id="search" className={styles.featureSection}><SectionHeading label="Integrated Search" title={<>흩어져 있는 정보,<br />한 번에 검색.</>}>강의 공지·자료·과제부터 학교 공지사항과 KLAS 메뉴까지.</SectionHeading><div className={styles.searchLayout}><Reveal className={styles.searchCopy}><h3>어느 과목이었는지<br />기억하지 않아도 괜찮아요.</h3><p>홈 화면의 검색 버튼을 누르고 키워드만 입력하세요. 과목마다 흩어진 결과를 한 화면에서 찾을 수 있어요.</p><hr /><h3>복잡한 질문은<br />AI 에이전트에게.</h3><p>자세한 설명이 필요하다면 에이전트 모드로 전환하세요. 검색한 내용을 맥락으로 이어서 물어볼 수 있어요.</p></Reveal><Reveal className={styles.searchCanvas}><SearchPreview /></Reveal></div></section>
        <section className={styles.featureSection}><SectionHeading label="Widgets" title={<>앱을 열기 전부터,<br />필요한 정보는 가까이.</>}>홈 화면에 시간표와 캘린더, 중앙도서관 출입증 위젯을 추가해 앱을 열지 않고도 빠르게 정보를 확인할 수 있어요.</SectionHeading><Reveal className={styles.widgetCanvas}><WidgetsPreview /></Reveal></section>
        <FaqSection />
      </main>
      <section className={styles.bottomCta}><h2>더 편리한 학교생활,<br />KLAS+에서 시작하세요.</h2><DownloadButton /></section>
      <ContributionSection />
      <SiteFooter />
    </div>
  </MotionConfig>;
}
