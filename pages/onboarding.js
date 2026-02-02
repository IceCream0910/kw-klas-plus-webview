import { useState, useEffect, useRef } from "react";
import GradualBlur from '../components/common/GradualBlur';
import Flicking from "@egjs/react-flicking";
import "@egjs/react-flicking/dist/flicking.css";
import { AnimatePresence, motion } from "framer-motion";

const slides = [
  {
    title: <>불편했던 KLAS를<br />더 편리하게.</>,
    desc: <>KLAS+는 모바일에 맞게 학사포털의<br />사용자 경험을 다시 설계했어요.</>,
    note: "⚠️ KLAS+는 개인이 개발한 것으로, 학교의 공식 앱이 아닙니다."
  },
  {
    title: <>복잡한 메뉴를<br />깔끔하게.</>,
    desc: <>자주 쓰는 메뉴를 고정하고, 필요한 메뉴는 검색.<br />도서관 출입증도 앱 하나로 빠르게.</>,
    note: ""
  },
  {
    title: <>학교 생활을 위한<br />나만의 캘린더.</>,
    desc: <>학사일정, 개인 스케줄은 물론 과제 마감기한까지,<br />대학 생활에 필요한 모든 일정을 정리해보세요.</>,
    note: ""
  },
  {
    title: <>궁금한 건<br />KLAS AI에게.</>,
    desc: <>학교 정보부터 강의 관련 현황까지 KLAS AI는 모든 걸 알고 있어요.</>,
    note: ""
  }
];

export default function Onboarding() {
  const flickingRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (flickingRef.current) {
        flickingRef.current.next();
      }
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const imageStyle = {
    width: '100%',
    objectFit: 'cover',
    objectPosition: 'top'
  };

  return (
    <main style={{ margin: '-15px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Flicking
        ref={flickingRef}
        circular={true}
        style={{ maxWidth: '400px', height: 'calc(70dvh - 35px)', paddingTop: '30px' }}
        onChanged={(e) => setCurrentSlide(e.index)}
      >
        <img src="https://i.imgur.com/bVwCc7y.png" style={imageStyle} />
        <img src="https://i.imgur.com/l03QIba.png" style={imageStyle} />
        <img src="https://i.imgur.com/ZkQ6Dmp.png" style={imageStyle} />
        <img src="https://i.imgur.com/Y6DGppn.png" style={imageStyle} />

      </Flicking>

      <GradualBlur
        target="parent"
        position="bottom"
        height="50dvh"
        strength={3}
        divCount={5}
        curve="bezier"
        opacity={1}
      />

      <div style={{
        position: 'absolute',
        bottom: '30dvh',
        left: 0,
        width: '100%',
        height: '25%',
        background: 'linear-gradient(to bottom, transparent, var(--background))',
        zIndex: 50
      }} />

      <div style={{ position: 'absolute', width: '100%', height: '30dvh', padding: '20px', paddingBottom: '100px', paddingTop: 0, zIndex: 99999, boxSizing: 'border-box', bottom: 0 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <h2 style={{ margin: '0 0 10px 0' }}>{slides[currentSlide % slides.length].title}</h2>
            <p style={{ margin: '0 0 10px 0', fontSize: '16px', opacity: .7 }}>{slides[currentSlide % slides.length].desc}</p>
            <p style={{ margin: '0 0 10px 0', fontSize: '12px', opacity: .4, marginTop: '10px' }}>{slides[currentSlide % slides.length].note}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}