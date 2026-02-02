import React from 'react';
import Image from 'next/image';
import Header from '../components/common/header';
import Spacer from '../components/common/spacer';
import IonIcon from '@reacticons/ionicons';

export default function FreshmanWelcome() {
  const goFreshmanGuide = () => {
    Android.openPage('https://www.kw.ac.kr/ko/life/notice.jsp?BoardMode=view&DUID=49337'); //매년 신입생 학사 안내 공지 링크로 변경
  };

  return (
    <div>
      <Header title={<Image src="/klasplus_icon_foreground_red.png" alt="Logo" width={40} height={40} style={{ borderRadius: '50%', marginLeft: '-5px' }} />} />

      <div style={{ height: '90dvh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '10px' }}>
        <h1 className='tossface' style={{ fontSize: '60px' }}>🎉</h1>
        <Spacer y={16} />

        <h2 style={{ margin: 0, fontSize: 24, lineHeight: 1.35, fontWeight: 800 }}>
          입학을 진심으로 축하해요!
        </h2>

        <p style={{ marginBottom: 0, opacity: 0.78, lineHeight: 1.2, fontSize: 14, textAlign: 'center' }}>
          설레는 첫 학기를 준비하고 계시군요!<br />
          아쉽게도 아직 수강 정보가 없어 KLAS+를 사용할 수 없어요. 첫 학기의 수강신청이 끝나면 모든 기능을 사용할 수 있어요.
        </p>
      </div>

      <button
        onClick={() => Android.openPage('https://klasplus.yuntae.in/searchLecturePlan')}
        style={{
          position: 'fixed',
          bottom: '90px',
          width: '90%',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--card-background)',
          padding: '14px 16px',
          borderRadius: 12,
          fontSize: 15,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        <IonIcon name="search-outline" style={{ fontSize: 18 }} />강의계획서 조회
      </button>

      <button
        onClick={goFreshmanGuide}
        style={{
          position: 'fixed',
          bottom: '30px',
          width: '90%',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--button-background)',
          color: 'var(--button-text)',
          padding: '14px 16px',
          borderRadius: 12,
          fontSize: 15,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        <IonIcon name="school" style={{ fontSize: 18 }} /> 신입생 학사 안내 보러가기
      </button>
    </div>
  );
}
