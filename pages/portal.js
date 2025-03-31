import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import IonIcon from '@reacticons/ionicons';

const PortalEffect = () => {
  return (
    <div style={{
      position: 'absolute',
      width: '100%',
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      transform: 'scale(1.3)',
    }}>
      <motion.div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,136,255,0.2) 0%, rgba(0,136,255,0) 70%)',
          filter: 'blur(8px)',
          zIndex: 0
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.7, 1, 0.7]
        }}
        transition={{
          duration: 3,
          ease: "easeInOut",
          repeat: Infinity
        }}
      />

      <motion.div
        style={{
          position: 'absolute',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          border: '3px solid #0088ff',
          boxShadow: '0 0 15px #0088ff, inset 0 0 15px #0088ff',
          zIndex: 1
        }}
        animate={{
          boxShadow: [
            '0 0 15px #0088ff, inset 0 0 15px #0088ff',
            '0 0 25px #0088ff, inset 0 0 25px #0088ff',
            '0 0 15px #0088ff, inset 0 0 15px #0088ff'
          ]
        }}
        transition={{
          duration: 2,
          ease: "easeInOut",
          repeat: Infinity
        }}
      />

      <motion.div
        style={{
          position: 'absolute',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,136,255,0.8) 0%, rgba(0,25,80,0.6) 40%, rgba(0,8,30,0.4) 60%, transparent 80%)',
          zIndex: 1
        }}
        animate={{
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 3,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />

      {/* Energy particles */}
      {[...Array(6)].map((_, index) => (
        <motion.div
          key={index}
          style={{
            position: 'absolute',
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            backgroundColor: '#0088ff',
            zIndex: 0,
            filter: 'blur(1px)'
          }}
          animate={{
            x: [0, Math.sin(index * 60) * 60],
            y: [0, Math.cos(index * 60) * 60],
            opacity: [1, 0]
          }}
          transition={{
            duration: 1.5 + index * 0.1,
            ease: "easeOut",
            repeat: Infinity,
            delay: index * 0.2
          }}
        />
      ))}
    </div>
  );
};

const FeatureHighlight = ({ icon, title, description }) => {
  return (
    <motion.div
      style={{
        padding: '20px',
        margin: '0 10px',
        borderRadius: '15px',
        background: 'var(--card-background, rgba(30, 30, 32, 0.7))',
        textAlign: 'start',
        height: '100%',
        width: '70dvw',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxSizing: 'border-box'
      }}
      whileHover={{
        y: -5,
        boxShadow: '0 10px 20px rgba(0, 136, 255, 0.1)',
        transition: { duration: 0.3 }
      }}
    >
      <div style={{ fontSize: '2rem', marginBottom: '10px' }}>{icon}</div>
      <h3 style={{ fontSize: '1.1rem', marginBottom: '10px', wordBreak: 'keep-all' }}>{title}</h3>
      <p style={{ fontSize: '0.8rem', opacity: .7, wordBreak: 'keep-all' }}>{description}</p>
    </motion.div>
  );
};

const FeatureCarousel = () => {
  const carouselRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [width, setWidth] = useState(0);
  const features = [
    {
      icon: "😴",
      title: "늦잠 자도 괜찮아요.",
      description: "기숙사든 자취방이든 본가든 상관없이, 늦잠을 자도 Portal이 당신을 구해드립니다. 그냥 탭 하세요. 즉시 강의실로 이동합니다."
    },
    {
      icon: "🚌",
      title: "통학러에게 기쁜 소식.",
      description: "강의실 이동 걱정은 Portal에게 맡기세요. 당신은 그저 여유롭게 커피 향을 즐기면 됩니다."
    },
    {
      icon: "🏃‍♀️",
      title: "연강이어도 여유롭게.",
      description: "캠퍼스 끝에서 끝까지, 더 이상 캠퍼스를 가로지르는 단거리 선수가 될 필요가 없습니다. 여유롭게 다음 강의실로 순간 이동하세요."
    }
  ];

  useEffect(() => {
    if (carouselRef.current) {
      setWidth(330);
    }
  }, []);

  const handleScroll = () => {
    if (carouselRef.current) {
      const scrollLeft = carouselRef.current.scrollLeft;
      const newIndex = Math.round(scrollLeft / width);
      setCurrentIndex(newIndex);
    }
  };

  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  const debouncedHandleScroll = debounce(handleScroll, 100);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener('scroll', debouncedHandleScroll);
      return () => carousel.removeEventListener('scroll', debouncedHandleScroll);
    }
  }, [width]);

  return (
    <div style={{ width: '100%', maxWidth: '100vw', position: 'relative' }}>
      <div
        ref={carouselRef}
        style={{
          display: 'flex',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          padding: '20px 0',
          margin: '0 -20px',
          maxWidth: 'calc(100% + 37px)',
          width: '150%'
        }}
        onScroll={(e) => debouncedHandleScroll()}
      >
        <div style={{ flex: '0 0 50%', minWidth: '10px' }} />

        {features.map((feature, index) => (
          <div
            key={index}
            style={{
              scrollSnapAlign: 'center',
              flexShrink: 0
            }}
          >
            <FeatureHighlight
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          </div>
        ))}

        <div style={{ flex: '0 0 50%', minWidth: '10px' }} />
      </div>

    </div>
  );
};

const Page = () => {
  const secondSectionRef = useRef(null);
  const thirdSectionRef = useRef(null);
  const fourthSectionRef = useRef(null);
  const fifthSectionRef = useRef(null);

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const { scrollYProgress } = useScroll();
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.9]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, 50]);

  const imageParallax = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const imageScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.1]);

  const techRef1 = useRef(null);
  const techRef2 = useRef(null);
  const featureRef = useRef(null);

  const tech1IsInView = useInView(techRef1, { once: false, amount: 0.3 });
  const tech2IsInView = useInView(techRef2, { once: false, amount: 0.3 });
  const featureIsInView = useInView(featureRef, { once: false, amount: 0.5 });

  return (
    <main style={{ width: 'calc(100vw - 1px)', margin: '-15px', padding: '20px', backgroundColor: '#000', boxSizing: 'border-box', minHeight: '100vh', overflow: 'hidden' }}>
      <motion.section
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          color: '#fff',
          height: '75dvh',
          textAlign: 'center',
          scale: heroScale,
          opacity: heroOpacity,
          y: heroY
        }}
      >
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.8, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ fontSize: '1.4rem', opacity: .8, marginBottom: '3rem' }}
        >
          강의실로 순간 이동.
        </motion.p>

        <motion.div
          style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <PortalEffect />
          <h1 style={{ fontSize: '5rem', position: 'relative', zIndex: 2 }}>Portal</h1>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          whileHover={{ scale: 1.05, backgroundColor: '#1c84ff' }}
          whileTap={{ scale: 0.95 }}
          onClick={() => scrollToSection(secondSectionRef)}
          style={{
            width: 'fit-content',
            padding: '10px 20px',
            fontSize: '0.8rem',
            backgroundColor: '#0088ff',
            color: '#fff',
            border: 'none',
            borderRadius: '25px',
            cursor: 'pointer',
            marginTop: '3rem'
          }}
        >
          자세히 알아보기
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          style={{
            marginTop: '1rem',
            fontSize: '1rem',
            opacity: .7
          }}
        >
          오직 KLAS+에서.<br />
          미래 언젠가, 순차 출시 예정.
        </motion.p>
      </motion.section>

      <section
        ref={secondSectionRef}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          color: '#fff',
          textAlign: 'center',
          position: 'relative',
          paddingTop: '60px',
          paddingBottom: '60px'
        }}
      >
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          style={{ fontSize: '3rem', position: 'relative' }}
        >
          탭. 이동. 끝.
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{
            background: 'var(--background, rgba(30, 30, 32, 0.7))',
            padding: '20px',
            borderRadius: '15px',
            margin: '1.5rem 0',
            width: '80%',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <div id="current_status" style={{ textAlign: 'start' }}>
            <h4 id="status_txt" style={{ opacity: .6, fontSize: '1rem' }} dangerouslySetInnerHTML={{
              __html: `9:00<span style="opacity: 0.6">에</span><br/> 광운인되기 <span style="opacity: 0.6">수업이 있어요.</span>
<br/>
<span style="opacity: 0.6; font-size:12px;">김광운 교수</span>`
            }}></h4>
            <div id="status_btns">
              <button id="qr_btn" style={{ backgroundColor: 'var(--button-background)', color: 'var(--button-text)', width: 'fit-content', padding: '10px 15px', fontSize: '10px', opacity: .6 }}>강의 홈</button>
              <button id="qr_btn" style={{ backgroundColor: 'var(--card-background)', color: 'var(--text-color)', marginLeft: '10px', width: 'fit-content', padding: '10px 15px', fontSize: '10px', opacity: .6 }}>
                QR 출석
              </button>
              <button id="qr_btn" style={{
                backgroundColor: 'var(--card-background)',
                color: 'var(--text-color)',
                marginLeft: '10px',
                position: 'relative',
                top: '1px',
                width: 'fit-content',
                padding: '8px 12px',
                fontSize: '12px',
                borderRadius: '15px',
                background: `
        linear-gradient(var(--card-background), var(--card-background)) padding-box,
        linear-gradient(to right, #4facfe, #00f2fe) border-box
      `,
                border: '2px solid transparent'
              }}>
                <IonIcon name="infinite" style={{ position: 'relative', top: '2px' }} />
              </button>
            </div>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          style={{ fontSize: '1.4rem', maxWidth: '80%', textAlign: 'start', wordBreak: 'keep-all', fontWeight: '600' }}
        >
          <span style={{ opacity: .6 }}>KLAS+ 앱의 다음 강의 정보 옆, </span>새롭게 빛나는 'Portal' 버튼.<br />가볍게 탭 <span style={{ opacity: .6 }}>하는 순간, </span>당신은 이미 강의실 앞<span style={{ opacity: .6 }}>에 서 있습니다. 믿기지 않을 정도로 간단하죠. </span>
        </motion.p>
      </section>

      <section
        ref={thirdSectionRef}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          color: '#fff',
          minHeight: '80vh',
          textAlign: 'center',
          position: 'relative',
          padding: '60px 0',
          overflow: 'hidden'
        }}
      >
        <motion.div
          style={{
            position: 'relative',
            width: '100%',
            overflow: 'hidden',
            borderRadius: '15px',
            marginBottom: '3rem'
          }}
        >
          <motion.img
            src="https://i.imgur.com/hoRnLaN.jpeg"
            style={{
              width: '100%',
              height: 'auto',
              objectFit: 'cover',
              scale: imageScale,
              y: imageParallax
            }}
          />
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '50%',
            background: 'linear-gradient(to top, rgba(0,0,0,1), rgba(0,0,0,0))'
          }} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          style={{ fontSize: '3rem', position: 'relative' }}
        >
          이것이 바로<br />대학생활의 미래.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{ fontSize: '1.4rem', maxWidth: '80%', textAlign: 'start', wordBreak: 'keep-all', fontWeight: '600', marginBottom: '2rem' }}
        >
          <span style={{ opacity: .6 }}>KLAS </span>Portal이 선사하는 전에 없던 편리함.<span style={{ opacity: .6 }}> 그저 놀라울 따름이죠. </span>
        </motion.p>

        <motion.div
          ref={featureRef}
          initial={{ opacity: 0 }}
          animate={featureIsInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8 }}
          style={{ width: '100%' }}
        >
          <FeatureCarousel />
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          whileHover={{ scale: 1.05, backgroundColor: '#1c84ff' }}
          whileTap={{ scale: 0.95 }}
          onClick={() => scrollToSection(fourthSectionRef)}
          style={{
            width: 'fit-content',
            padding: '10px 20px',
            fontSize: '0.8rem',
            backgroundColor: '#0088ff',
            color: '#fff',
            border: 'none',
            borderRadius: '25px',
            cursor: 'pointer',
            marginTop: '3rem'
          }}
        >
          기술 살펴보기
        </motion.button>
      </section>

      <section
        ref={fourthSectionRef}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          flexDirection: 'column',
          color: '#fff',
          minHeight: '90vh',
          textAlign: 'center',
          position: 'relative',
          padding: '60px 20px',
          overflow: 'hidden'
        }}
      >
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{
            fontSize: '1rem',
            position: 'relative',
            textAlign: 'start',
            width: '100%',
            color: '#0088ff',
            fontWeight: '600'
          }}
        >
          기술
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            fontSize: '2.3rem',
            position: 'relative',
            marginTop: '1rem',
            textAlign: 'start',
            width: '100%',
            lineHeight: 1.2
          }}
        >
          이 놀라운 기능, <br />모두 혁신 덕분.
        </motion.h2>

        <div ref={techRef1} style={{ position: 'relative', width: '120%', overflow: 'hidden', marginTop: '3rem', margin: '0 -40px' }}>

          <motion.img
            src="https://i.imgur.com/ur3skjg.jpeg"
            style={{ width: '150%', height: '700px', objectFit: 'cover', borderRadius: '15px', margin: '-9rem 15rem -4rem -5rem', backgroundSize: 'cover', backgroundPosition: 'right' }}
            animate={tech1IsInView ?
              { scale: 1, y: 0, opacity: 1 } :
              { scale: 0.95, y: 50, opacity: 0.5 }
            }
            transition={{ duration: 0.8 }}
          />
        </div>

        <motion.h3
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          style={{
            fontSize: '2.5rem',
            position: 'relative',
            marginTop: '2rem',
            textAlign: 'start',
            width: '100%',
            lineHeight: 1.2
          }}
        >
          정교한 스캔으로<br />캠퍼스 완전정복.
        </motion.h3>

        <motion.p
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          style={{
            fontSize: '1.4rem',
            maxWidth: '100%',
            textAlign: 'start',
            wordBreak: 'keep-all',
            fontWeight: '600',
            marginBottom: '2rem'
          }}
        >
          <span style={{ opacity: .6 }}>우리는</span> 학교 전체를 나노미터 단위로 스캔<span style={{ opacity: .6 }}>했습니다. 혁신적인 양자 매핑 기술이 건물 내부의 모든 강의실을 분자 수준까지 디지털화했죠. Portal은 이 정밀한 3D 디지털 트윈을 활용해 당신이 </span>정확히 어디로 이동할지 계산<span style={{ opacity: .6 }}>합니다.</span>
        </motion.p>

      </section>

      <section
        ref={fifthSectionRef}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          flexDirection: 'column',
          color: '#fff',
          minHeight: '90vh',
          position: 'relative',
          padding: '60px 20px',
          overflow: 'hidden'
        }}
      >
        <div ref={techRef2} style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
          <motion.img
            src="https://i.imgur.com/Ge4JdcP.png"
            style={{
              width: '200%',
              height: 'auto',
              objectFit: 'cover',
            }}
            animate={tech2IsInView ?
              { scale: 1, y: 0, opacity: 1 } :
              { scale: 0.95, y: 50, opacity: 0.5 }
            }
            transition={{ duration: 0.8 }}
          />
        </div>

        <motion.h3
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          style={{
            fontSize: '2.1rem',
            position: 'relative',
            marginTop: '2rem',
            textAlign: 'start',
            width: '100%',
            lineHeight: 1.2
          }}
        >
          놀랍도록 안정적인<br />순간 이동.
        </motion.h3>

        <motion.p
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          style={{
            fontSize: '1.4rem',
            maxWidth: '100%',
            textAlign: 'start',
            wordBreak: 'keep-all',
            fontWeight: '600',
            marginBottom: '3rem'
          }}
        >
          <span style={{ opacity: .6 }}>눈부시게 정교한 양자 알고리즘이 평행 우주의 가능성을 계산해 최적의 경로를 찾아냅니다. 당신이 버튼을 탭하는 순간, </span>분자 구조를 순간적으로 재배열<span style={{ opacity: .6 }}>하여 물리적 이동 없이도 목적지에 도착하게 해줍니다.</span>
        </motion.p>
      </section>

      <section style={{ background: '#fff', borderRadius: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', color: '#fff', textAlign: 'center', height: 'auto', position: 'relative', padding: '60px 20px', overflow: 'hidden' }}>
        <h1 style={{ fontSize: '3rem', position: 'relative', color: '#000' }}>KLAS를<br />더 편리하게.</h1>

        <p style={{ fontSize: '1.4rem', maxWidth: '80%', textAlign: 'center', wordBreak: 'keep-all', fontWeight: '600', marginBottom: '3rem', color: '#000' }}>
          <span style={{ opacity: .6 }}>KLAS+는 KLAS의 </span>UI/UX를 개선하고 편의 기능을 추가한 앱<span style={{ opacity: .6 }}>입니다. 순간 이동 기능을 지원하지는 않지만, 학우 분들의 </span>학교 생활이 더 편리해지길 바라는 마음<span style={{ opacity: .6 }}>에서 만들었습니다.</span>
        </p>
      </section>

      <section style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', color: '#fff', textAlign: 'center', height: 'auto', position: 'relative', padding: '60px 20px', overflow: 'hidden' }}>
        <p style={{ fontSize: '0.8rem', maxWidth: '100%', textAlign: 'left', wordBreak: 'keep-all', marginBottom: '3rem', opacity: .6 }}>
          <b>- 이 페이지는 만우절을 기념해서 제작된 것으로, 실제 KLAS+의 기능이 아닙니다.</b> 왜 만들었냐고요? 음.. 심심했습니다. 휴학 중이거든요.<br />
          - 페이지에 사용된 이미지는 모두 AI를 사용해 생성되었습니다.<br />
          <br />
          - KLAS+ 앱은 Android 10 이상에서 지원됩니다. iOS는 지원하지 않습니다.<br />
          - KLAS+는 학교의 공식 앱이 아닙니다. 현재 학교의 공식 앱인 '광운대학교' 앱이 Play 스토어에서 내려간 상태입니다. 'KLAS 웹사이트 {'>'} KLAS 앱 다운로드' 를 통해 공식 앱을 설치한 후, KLAS+는 보조 역할로 사용해주시기 바랍니다. 해당 앱을 불법적인 목적으로 사용 시 발생하는 불이익에 대해서 개발자는 어떠한 책임도 지지 않음을 밝힙니다.
        </p>
      </section>
    </main >
  );
};

export default Page;
