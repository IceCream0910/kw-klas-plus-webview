import { useState, useEffect, useRef } from "react";
import GradualBlur from './components/GradualBlur';
import Flicking from "@egjs/react-flicking";
import "@egjs/react-flicking/dist/flicking.css";

export default function Onboarding() {
  const flickingRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (flickingRef.current) {
        flickingRef.current.next();
      }
    }, 3000);

    return () => {
      clearInterval(interval);
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  const imageStyle = {
    width: '100%'
  };

  return (
    <main style={{ margin: '-15px' }}>
      <Flicking
        ref={flickingRef}
        circular={true}

        style={{ width: '100%', height: '100%' }}
      >

        <img src="https://i.imgur.com/bVwCc7y.png" style={imageStyle} />
        <img src="https://i.imgur.com/l03QIba.png" style={imageStyle} />
        <img src="https://i.imgur.com/ZkQ6Dmp.png" style={imageStyle} />
        <img src="https://i.imgur.com/Y6DGppn.png" style={imageStyle} />

      </Flicking>
      <GradualBlur
        target="parent"
        position="bottom"
        height="40dvh"
        strength={3}
        divCount={5}
        curve="bezier"
        opacity={1}
      />
      <div style={{ position: 'fixed', bottom: '70px', padding: '20px', paddingRight: '30px', zIndex: 99999 }}>
        <h2 style={{ margin: '0 0 10px 0' }}>불편했던 KLAS를<br />더 편리하게.</h2>
        <p style={{ margin: '0 0 10px 0', fontSize: '16px', opacity: .7 }}>KLAS+는 모바일에 맞게 학사포털의<br />사용자 경험을 다시 설계했어요.</p>
        <p style={{ margin: '0 0 10px 0', fontSize: '12px', opacity: .4, marginTop: '20px' }}>⚠️ KLAS+는 개인이 개발한 것으로, 학교의 공식 앱이 아닙니다.</p>
      </div>
    </main>
  );
}