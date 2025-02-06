import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Spacer from "./components/spacer";
import LoadingComponent from "./components/loader";
import { KLAS } from "./utils/klas";

const generateRandomColor = () => {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 70%, 80%)`;
};

const generateRandomPattern = () => {
  const patterns = ['axiom-pattern', '60-lines', 'ag-square', 'diamond-uphoistery', 'escheresque', 'gradient-squares', 'graphy-dark', 'inspiration-geometry'];
  return patterns[Math.floor(Math.random() * patterns.length)];
};

const ScholarshipCard = ({ scholarship, isFocused }) => {
  const cardColor = React.useMemo(() => generateRandomColor(), []);
  const pattern = React.useMemo(() => generateRandomPattern(), []);

  return (
    <motion.div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '16px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)',
        backgroundColor: `${cardColor}33`,
        border: `1px solid ${cardColor}`,
        backgroundImage: `url('https://www.transparenttextures.com/patterns/${pattern}.png'), linear-gradient(to top left, ${cardColor}, #ffffff23)`,
        width: 'calc(60vw - 40px)',
        height: '80vw',
        margin: '0 20px',
        position: 'relative',
        scale: isFocused ? 1.05 : 1,
        transition: 'all 0.5s ease',
        msTransition: 'all 0.5s ease',
      }}
      whileHover={{ scale: 1.05 }}
    >
      <div>
        <Spacer y={20} />
        <h3>{scholarship?.janghakName || "장학금"}</h3>
        <p style={{ fontSize: '13px', opacity: .8 }}>{scholarship?.yearHakgi?.split('-')[0]}년도 {scholarship?.yearHakgi?.split('-')[1]}학기</p>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h3>₩{scholarship?.janghakAmt?.toLocaleString() || ""}</h3>
        <Spacer y={20} />
      </motion.div>
    </motion.div>
  );
};

const ScholarshipListItem = ({ scholarship }) => {
  return (
    <div style={{
      padding: '16px',
      borderRadius: '12px',
      backgroundColor: 'var(--card-background)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div>
        <h3>{scholarship.janghakName}</h3>
        <p style={{ fontSize: '13px', opacity: .8 }}>
          {scholarship.yearHakgi?.split('-')[0]}년도 {scholarship.yearHakgi?.split('-')[1]}학기
        </p>
      </div>
      <h3>₩{scholarship.janghakAmt?.toLocaleString()}</h3>
    </div>
  );
};

export default function Janghak() {
  const [token, setToken] = useState("");
  const [janghak, setJanghak] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef(null);
  const [focusedIndex, setFocusedIndex] = useState(1);
  const observerRef = useRef(null);
  const [viewType, setViewType] = useState('list');

  useEffect(() => {
    window.receiveToken = (receivedToken) => {
      if (receivedToken) setToken(receivedToken);
    };

    try {

    } catch (e) {
      console.log('not app');
    }
  }, []);

  useEffect(() => {
    if (focusedIndex === 0) setFocusedIndex(1);
    if (focusedIndex === janghak.length - 1) setFocusedIndex(janghak.length - 2);
  }, [focusedIndex]);

  useEffect(() => {
    if (!token) return;
    KLAS("https://klas.kw.ac.kr/std/cps/inqire/JanghakHistoryStdList.do", token)
      .then((data) => {
        data.unshift(null);
        data.push(null);
        setJanghak(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, [token]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const options = {
      root: container,
      rootMargin: "0px",
      threshold: 0.5,
    };

    const callback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = Array.from(container.children).indexOf(entry.target);
          setFocusedIndex(index);
        }
      });
    };

    const observer = new IntersectionObserver(callback, options);
    observerRef.current = observer;

    Array.from(container.children).forEach((child) => {
      observer.observe(child);
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [janghak]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !container.children[1]) return;
    container.scrollLeft = container.children[0].offsetWidth;
  }, [janghak]);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'var(--background)'
      }}>
        <LoadingComponent texts={["장학 정보 불러오는 중"]} />
      </div>
    );
  }

  return (
    <main style={{ paddingBottom: '60px' }}>
      <Spacer y={5} />
      <h2>장학 조회
        <button onClick={() => Android.openPage('https://klas.kw.ac.kr/std/cps/inqire/JanghakStdPage.do')} style={{ float: 'right', border: '1px solid var(--card-background)', width: 'fit-content', fontSize: '14px', marginTop: '-5px', borderRadius: '20px', padding: '10px 15px' }}>
          KLAS에서 열기
        </button>
      </h2>

      {janghak.length <= 0 ? (
        <>
          <div style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '50%',
            transform: 'translateY(-40%)'
          }}>
            <h3 style={{ textAlign: 'center' }}>지금까지 수여받은<br />장학금이 아직 없어요!</h3>
            <button onClick={() => Android.openPage('https://www.kw.ac.kr/ko/life/summary.jsp')} style={{ background: 'var(--button-background)', color: 'var(--button-text)', width: 'fit-content', margin: '0 auto', display: 'block', fontSize: '14px', marginTop: '15px', padding: '10px 15px' }}>
              학부 장학안내 보러가기
            </button>
          </div>
        </>
      ) : (
        <>


          {viewType === 'card' ? (
            <>
              <div style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: '50%',
                transform: 'translateY(-50%)'
              }}>
                {janghak && <h3 style={{ textAlign: 'center' }}>지금까지 총 {janghak.length - 2}건의<br />장학금을 수여받았어요!</h3>}
                <Spacer y={20} />
                <div
                  ref={containerRef}
                  style={{
                    display: 'flex',
                    overflowX: 'auto',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    scrollSnapType: 'x mandatory',
                    alignItems: 'center',
                    height: 'fit-content',
                    padding: '15px 0',
                  }}
                >
                  {janghak.map((scholarship, index) => (
                    <div key={index} style={{ scrollSnapAlign: 'center' }}>
                      {scholarship ? (
                        <ScholarshipCard scholarship={scholarship} isFocused={index === focusedIndex} />
                      ) : (
                        <div style={{ width: 'calc(25vw - 40px)', height: '70vw' }}>
                          <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

              </div>
            </>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column', width: '100%', gap: '15px', padding: '25px 0'
            }}>
              {janghak.slice(1, -1).map((scholarship, index) => (
                <ScholarshipListItem key={index} scholarship={scholarship} />
              ))}
            </div>
          )}
        </>
      )}

      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60px',
        backgroundColor: 'var(--background)',
        borderTop: '1px solid var(--card-background)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <button
          onClick={() => setViewType('list')}
          style={{
            width: 'fit-content',
            padding: '8px 16px',
            borderRadius: '20px',
            backgroundColor: viewType === 'list' ? 'var(--card-background)' : 'transparent',
            border: 'none',
            fontSize: '14px',
            textAlign: 'center'
          }}
        >
          리스트
        </button>

        <button
          onClick={() => setViewType('card')}
          style={{
            width: 'fit-content',
            padding: '8px 16px',
            borderRadius: '20px',
            backgroundColor: viewType === 'card' ? 'var(--card-background)' : 'transparent',
            border: 'none',
            fontSize: '14px',
            textAlign: 'center'
          }}
        >
          카드
        </button>
      </div>
    </main>
  );
}