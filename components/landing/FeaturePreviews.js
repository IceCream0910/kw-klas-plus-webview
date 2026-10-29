import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, stagger, useAnimate, useInView, useReducedMotion } from 'framer-motion';
import IonIcon from '@reacticons/ionicons';
import dynamic from 'next/dynamic';
import Card from '../common/Card';
import DeadlineContent from '../calendar/DeadlineContent';
import TimetableRenderer from '../timetable/TimetableRenderer';
import LectureBasicInfo from '../lecturePlan/LectureBasicInfo';
import GradeLegend from '../grade/GradeLegend';
import WeeklyScheduleItem from '../lecturePlan/WeeklyScheduleItem';
import searchStyles from '../search/SearchOverlay.module.css';
import styles from '../../styles/FeaturePreviews.module.css';

const AgentComposer = dynamic(() => import('../agent/AgentComposer'), {
  ssr: false,
  loading: () => <div className={styles.composerPlaceholder} />,
});

function Illustration({ label, className = '', children }) {
  const [scope, animate] = useAnimate();
  const visible = useInView(scope, { once: true, amount: .22 });
  const reduced = useReducedMotion();
  useEffect(() => {
    if (!visible || reduced) return;
    const parts = [...scope.current.firstElementChild.children];
    const controls = [animate(parts, { opacity: [0, 1], y: [14, 0] }, { duration: .55, delay: stagger(.1), ease: [.22, 1, .36, 1], onComplete: () => scope.current?.setAttribute('data-motion-complete', 'true') })];
    const progress = scope.current.querySelectorAll('[data-preview-progress]');
    if (progress.length) controls.push(animate(progress, { scaleX: [0, 1] }, { duration: 1, delay: .55, ease: [.22, 1, .36, 1] }));
    const lessons = scope.current.querySelectorAll('[data-preview-timetable] .class');
    if (lessons.length) controls.push(animate(lessons, { opacity: [0, 1], y: [8, 0] }, { duration: .45, delay: stagger(.08, { startDelay: .25 }) }));
    return () => controls.forEach(control => control.complete());
  }, [visible, reduced, animate, scope]);
  return <div ref={scope} role="img" aria-label={label} data-motion={reduced === false} className={`${styles.app} ${className}`}><div inert aria-hidden="true">{children}</div></div>;
}
const noop = () => {};

function DeadlineNotification() {
  const ref = useRef(null);
  const visible = useInView(ref, { once: true, amount: .6 });
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (!visible) return;
    if (reduced) { setShown(true); return; }
    const timer = setTimeout(() => setShown(true), 1800);
    return () => clearTimeout(timer);
  }, [visible, reduced]);
  return <div ref={ref} className={styles.deadlineNotification} data-deadline-notification={shown ? 'visible' : 'waiting'}>
    <AnimatePresence>{shown && <motion.div className={styles.pushNotification} initial={reduced ? false : { opacity: 0, y: -18, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: reduced ? 0 : .55, ease: [.22, 1, .36, 1] }}><div className={styles.pushHeader}><img src="/landing/app-icon.webp" width="22" height="22" alt="" /><span>KLAS+</span><small>지금</small></div><b>곧 마감되는 할 일이 있어요.</b><p>컴퓨터구조 · 온라인 강의 약 10시간 뒤 마감</p></motion.div>}</AnimatePresence>
  </div>;
}

export function DeadlinePreview() {
  return <Illustration label="예시: 광운인졸업하기의 온라인 강의는 D-6, 과제는 D-2, 팀 프로젝트는 오늘 마감" className={styles.deadlines}>
    <h3>오늘 마감되는 할 일이<br /><strong>2개 있어요.</strong></h3>
    {[{name:'광운인졸업하기',rows:[['온라인 강의',152],['과제',60],['팀 프로젝트',0]]},{name:'컴퓨터구조',rows:[['온라인 강의',10]]}].map(course => <Card key={course.name} isAnimated={false} style={{paddingBottom:'15px'}}>
      <div className={styles.deadlineTop}><b>{course.name}</b><span>강의 홈</span></div>
      {course.rows.map(([name,hourGap]) => <DeadlineContent key={name} name={name} data={[{hourGap}]} />)}
    </Card>)}
    <DeadlineNotification />
  </Illustration>;
}
export function HomePreview() {
  return <Illustration label="예시 홈 화면: 알고리즘 수업 중, 강의 홈과 QR 출석, 최근 강의 알림" className={styles.home}>
    <img src="/landing/app-icon.webp" width="32" height="32" alt="" />
    <h3><span>지금은</span><br />알고리즘 <span>수업 중</span></h3><p>11:30에 종료</p>
    <div className={styles.appActions}><span>강의 홈</span><span>QR 출석</span></div>
    <Card title="강의 알림" isAnimated={false}>{['컴퓨터구조 · 중간고사 시험 일정이 변경되었습니다','자료구조 · 과제 제출 마감일이 연장되었습니다'].map((title,i)=><div className={styles.notice} key={title}><b>{title}</b><small>2026-10-{15-i} 09:30</small></div>)}</Card>
  </Illustration>;
}
export function LecturePreview() {
  return <Illustration label="예시 강의 홈: 공지사항, 과제와 강의 자료, 출석 현황을 한 화면에서 확인" className={styles.lecture}>
    <h3>대학수학및연습1</h3><p>김광운 · 새빛관 102</p>
    <Card title="강의 공지사항" isAnimated={false}><div className={styles.notice}><b>중간고사 시험 범위 및 일정 안내</b><small>2026-10-15</small></div></Card>
    <div className={styles.lectureMenus}>{['과제','온라인 강의','자료실','질문과 답변'].map((name,i)=><span key={name}>{name}<b>{[3,2,9,0][i]}</b></span>)}</div>
    <Card title="출석 현황" isAnimated={false}><strong className={styles.progressNumber}>96.7%</strong><div className={styles.progressTrack}><i data-preview-progress /></div><div className={styles.attendance}><span>출석 <b>29</b></span><span>지각 <b>0</b></span><span>결석 <b>1</b></span></div></Card>
  </Illustration>;
}
export function PlayerPreview() {
  const ref = useRef(null);
  const autoPlayed = useRef(false);
  const timer = useRef(null);
  const visible = useInView(ref, { amount: .5 });
  const reduced = useReducedMotion();
  const [pip, setPip] = useState(false);
  useEffect(() => {
    if (!visible || reduced || autoPlayed.current) return;
    timer.current = setTimeout(() => {
      autoPlayed.current = true;
      setPip(true);
    }, 800);
    return () => clearTimeout(timer.current);
  }, [visible, reduced]);
  const switchPip = (next) => {
    autoPlayed.current = true;
    clearTimeout(timer.current);
    setPip(next);
  };
  return <div ref={ref} className={styles.playerExample} data-pip={pip}>
    <div className={`${styles.app} ${styles.player}`} role="group" aria-label="온라인 강의 PiP 전환 시연">
      <div className={styles.pipStage}>
        <motion.div className={styles.pipDestination} inert aria-hidden="true" animate={{ opacity: pip ? 1 : 0 }} transition={{ duration: reduced ? 0 : .4 }}><h3>강의 공지사항</h3><p>광운인되기 · 김광운</p><Card isAnimated={false}><div className={styles.notice}><b>다음 주 수업 및 과제 안내</b><small>2026-10-28</small></div><div className={styles.notice}><b>1주차 학습 자료</b><small>2026-10-26</small></div></Card></motion.div>
        <motion.div className={styles.playerPanel} aria-hidden={pip} animate={{ opacity: pip ? 0 : 1 }} transition={{ duration: reduced ? 0 : .3 }}><div className={styles.playerBody}><h3>1주 광운의 어제와 오늘</h3><p>진행률 100%, 학습시간 21분/21분</p><div className={styles.seek}><i /></div><div className={styles.time}><span>01:53</span><span>21:18</span></div><div className={styles.playback} aria-hidden="true"><IonIcon name="volume-medium-outline" /><IonIcon name="play-back-outline" /><IonIcon name="pause" /><IonIcon name="play-forward-outline" /><IonIcon name="scan-outline" /></div><div className={styles.playerOptions}><button type="button" onClick={() => switchPip(true)} disabled={pip} tabIndex={pip ? -1 : 0} aria-label="PiP로 전환">▣ PiP</button><span>◴ 1.0x</span><span>× 수강 종료</span></div></div></motion.div>
        <motion.button type="button" disabled={!pip} tabIndex={pip ? 0 : -1} aria-label="PiP 창에서 플레이어로 돌아가기" onClick={() => switchPip(false)} className={`${styles.videoSlide} ${styles.pipVideo}`} animate={{ width: pip ? '48%' : '100%', height: pip ? 100 : 180, top: pip ? 320 : 0, left: pip ? '48%' : '0%', borderRadius: pip ? 12 : 0 }} transition={{ duration: reduced ? 0 : .28, ease: [.22, 1, .36, 1] }}><small>KWANGWOON UNIVERSITY</small><strong>광운의 어제와 오늘</strong><span>{pip ? 'Ⅱ　↗' : '온라인 강의'}</span></motion.button>
      </div>
    </div>
  </div>;
}

const planExample = { hakjumNum: 3, sisuNum: 3, face100Opt: 'Y', typeSmall: '1', attendBiyul: 10, middleBiyul: 35, lastBiyul: 35, reportBiyul: 20 };
export function LecturePlanPreview() {
  return <Illustration label="강의계획서 예시: 대학수학및연습1의 수업 정보, 평가 비율과 주차별 강의 일정" className={styles.lecturePlan}>
    <span className={styles.planBadge}>전공필수</span><h3>대학수학및연습1</h3><p className={styles.planCode}>2026학년도 2학기 · 01분반</p>
    <LectureBasicInfo lecturePlan={planExample} lectureTime={[{dayname1:'월',timeNo1:'3',locHname:'새빛102'}]} lectureStdCrtNum={{currentNum:40}} />
    <Card title="개요" isAnimated={false}><p className={styles.planSummary}>미분과 적분의 기본 개념을 익히고 다양한 문제에 적용합니다.</p></Card>
    <Card title="반영 비율" isAnimated={false}><div className={styles.gradeBar} aria-hidden="true">{[['#FF6B6B',10],['#4DABF7',35],['#FFA94D',35],['#69DB7C',20]].map(([color,value])=><i key={color} style={{background:color,width:`${value}%`}} />)}</div><GradeLegend data={planExample} /></Card>
    <Card title="강의 일정" isAnimated={false}><WeeklyScheduleItem week="1" lecture="함수와 극한" bigo="강의 개요 및 학습 목표 안내" /></Card>
  </Illustration>;
}
export function LibraryPassPreview() {
  return <Illustration label="중앙도서관 출입증 예시: 김광운의 모바일 학생증과 시연용 QR, 갱신 버튼" className={styles.libraryPass}>
    <div className={styles.libraryToolbar}><span>↻　30초 후 갱신</span><span><IonIcon name="settings-outline" aria-hidden="true" /></span></div>
    <h3>김광운</h3><p>컴퓨터정보공학부 · 2026000000</p>
    <img className={styles.libraryQr} src="/landing/library-demo-qr.svg" width="220" height="220" alt="" /><small className={styles.demoQrLabel}>예시 QR · 실제 출입 불가</small>
  </Illustration>;
}
const colors=[['#e0eee7','#315b45'],['#eee5f5','#65417b'],['#dfeaf8','#3f5d84']];
const courses=[
 ['알고리즘',2,'10:30','12:00','새빛203',0],['인공지능',0,'13:00','14:00','새빛102',1],['인공지능',2,'12:00','13:00','새빛102',1],['운영체제',1,'13:00','14:30','새빛203',2],['데이터통신',4,'12:00','14:00','새빛102',0]
].map(([title,day,startTime,endTime,info,i])=>({title,day,startTime,endTime,info,subj:title,color:{palette:'native',slot:i,light:{background:colors[i][0],text:colors[i][1]},dark:{background:colors[i][0],text:colors[i][1]}}}));
export function SchedulePreview({ widget = false }) {
  return <Illustration label="예시 주간 시간표: 과목 색상, 수업 시간과 강의실 표시" className={widget ? styles.widgetSchedule : styles.schedule}><h3>시간표</h3><div className={styles.timetable} data-preview-timetable><TimetableRenderer timetableData={{classes:courses}} onClassClick={noop} /></div><small>2026년 2학기</small></Illustration>;
}
function CalendarGrid() {
  return <><div className={styles.calendarDays}>{['일','월','화','수','목','금','토'].map(day=><span key={day}>{day}</span>)}</div><div className={styles.calendarDates}>{Array.from({length:35},(_,i)=><span key={i} className={i===16?styles.today:''}>{i>0&&i<31?i:''}{[11,17,23].includes(i)&&<i>{i===17?'중간고사':'[과제]…'}</i>}</span>)}</div></>;
}
export function CalendarPreview() {
  return <Illustration label="예시 캘린더: 학사 일정과 과제 마감을 날짜별로 표시" className={styles.calendar}><h3>10월</h3><CalendarGrid /><div className={styles.agenda}><b>10월 17일 토요일</b><p><i />2학기 중간고사</p><p><i />알고리즘 실습 과제</p></div></Illustration>;
}
export function WidgetsPreview() {
  return <img className={styles.widgetsImage} src="/landing/widgets-overview.webp" width="1920" height="880" loading="lazy" alt="KLAS+의 일정 목록, 캘린더, 시간표와 중앙도서관 출입증 위젯을 함께 보여주는 실제 화면" />;
}
export function NotificationPreview() {
  return <Illustration label="알림 예시: 곧 마감되는 할 일이 있어요. 자료구조 과제, 약 2시간 뒤 마감" className={styles.notifications}><div className={styles.lockClock}><small>10월 28일 수요일</small><strong>10:24</strong></div><div className={styles.notification}><IonIcon name="notifications-outline" /><div><span>KLAS+ · 알림 예시</span><b>곧 마감되는 할 일이 있어요</b><p>자료구조 과제 · 약 2시간 뒤 마감</p></div></div></Illustration>;
}
const searchRows=[['팀 프로젝트','중간보고서 및 중간발표 슬라이드','공학설계입문'],['강의 공지','중간고사 일정 및 장소','고급C프로그래밍및설계'],['강의 자료','중간고사 요점 정리','자료구조']];
export function SearchPreview() {
  const ref=useRef(null),visible=useInView(ref,{once:true,amount:.35}),reduced=useReducedMotion();
  const [step,setStep]=useState(0),[run,setRun]=useState(0);
  useEffect(()=>{if(!visible)return; if(reduced){setStep(3);return;} setStep(0);const timers=[setTimeout(()=>setStep(1),600),setTimeout(()=>setStep(2),1000),setTimeout(()=>setStep(3),1400)];return()=>timers.forEach(clearTimeout);},[visible,reduced,run]);
  const query=['','중','중간','중간'][step];
  return <div ref={ref} className={styles.searchExample}><div className={`${styles.app} ${styles.searchApp}`} role="img" aria-label="통합검색 예시: 중간으로 검색하면 팀 프로젝트, 강의 공지와 자료가 함께 나타납니다"><div inert aria-hidden="true"><div className={styles.searchHeader}><span>×</span><div className={searchStyles.tabs}><span className={styles.selectedSearch}><IonIcon name="search-outline" /> 검색</span><span><img src="/icons/ai-chatbot-animated.svg" width="18" height="18" alt="" /> 에이전트</span></div></div><div className={searchStyles.results}>{step<3?<div className={styles.searchIntro}><h3>한 번에 찾아보세요.</h3><p>KLAS 메뉴부터 강의 별 공지사항, 자료, 과제 등<br />흩어져 있는 정보를 한 번에 검색할 수 있어요.</p></div>:<AnimatePresence>{searchRows.map(([kind,title,course],i)=><motion.section key={kind} initial={reduced?false:{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:reduced?0:i*.12}}><h2>{kind} <span>1</span></h2><ul><li><div className={styles.searchRow}><strong>{title}</strong><div className={styles.chips}><span>{course}</span><span>2026-10-28</span></div></div></li></ul></motion.section>)}</AnimatePresence>}</div><AgentComposer mode="search" value={query} onChange={noop} disabled /></div></div><button type="button" className={styles.replay} onClick={()=>setRun(value=>value+1)}><IonIcon name="refresh-outline" aria-hidden="true" />검색 예시 다시 보기</button></div>;
}
