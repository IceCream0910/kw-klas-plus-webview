import React, { useState, useEffect } from "react";
import Spacer from "../components/common/spacer";
import LoadingComponent from "../components/common/loader";
import { KLAS } from "../lib/core/klas";
import { safeAndroidCall } from "../lib/core/androidBridge";

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

  useEffect(() => {
    window.receiveToken = (receivedToken) => {
      if (receivedToken) setToken(receivedToken);
    };
  }, []);

  useEffect(() => {
    if (!token) return;

    KLAS("https://klas.kw.ac.kr/std/cps/inqire/JanghakHistoryStdList.do", token)
      .then((data) => {
        setJanghak(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, [token]);

  const handleOpenKlas = () => {
    safeAndroidCall(() => {
      Android.openPage('https://klas.kw.ac.kr/std/cps/inqire/JanghakStdPage.do');
    });
  };

  const handleOpenScholarshipInfo = () => {
    safeAndroidCall(() => {
      Android.openPage('https://www.kw.ac.kr/ko/life/summary.jsp');
    });
  };

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
    <main style={{ paddingBottom: '20px' }}>
      <Spacer y={5} />
      <h2>장학 조회
        <button
          onClick={handleOpenKlas}
          style={{
            float: 'right',
            border: '1px solid var(--card-background)',
            width: 'fit-content',
            fontSize: '14px',
            marginTop: '-5px',
            borderRadius: '20px',
            padding: '10px 15px'
          }}
        >
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
            <button
              onClick={handleOpenScholarshipInfo}
              style={{
                background: 'var(--button-background)',
                color: 'var(--button-text)',
                width: 'fit-content',
                margin: '0 auto',
                display: 'block',
                fontSize: '14px',
                marginTop: '15px',
                padding: '10px 15px'
              }}
            >
              학부 장학안내 보러가기
            </button>
          </div>
        </>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          gap: '15px',
          padding: '25px 0'
        }}>
          {janghak.map((scholarship, index) => (
            <ScholarshipListItem key={index} scholarship={scholarship} />
          ))}
        </div>
      )}
    </main>
  );
}