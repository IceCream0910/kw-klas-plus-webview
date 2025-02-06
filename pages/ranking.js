import { useState, useEffect, useRef } from "react";
import { KLAS } from "../lib/klas";

export default function Grade() {
  const [token, setToken] = useState("");
  const [rank, setRank] = useState(null);

  useEffect(() => {
    window.receiveToken = function (receivedToken) {
      if (!receivedToken) return;
      setToken(receivedToken);
    };
  }, [])

  useEffect(() => {
    if (!token) return;

    KLAS("https://klas.kw.ac.kr/std/cps/inqire/StandStdList.do", token, {})
      .then((data) => {
        setRank(data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [token]);

  return (
    <main>
      <h2 style={{ marginBottom: '20px', marginTop: '20px' }}>석차
        <button onClick={() => Android.openPage('https://klas.kw.ac.kr/std/cps/inqire/StandStdPage.do')}
          style={{ float: 'right', border: '1px solid var(--card-background)', width: 'fit-content', fontSize: '14px', marginTop: '-5px', borderRadius: '20px', padding: '10px 15px' }}>
          KLAS에서 열기
        </button>
      </h2>

      {rank ? (
        rank.length === 0 ? (
          <div style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '50%',
            transform: 'translateY(-40%)'
          }}>
            <h3 style={{ textAlign: 'center' }}>아직 조회 가능한<br />성적 석차가 없어요!</h3>
          </div>
        ) : (
          rank.slice().reverse().map((data, index) =>
          (
            <div className="profile-card"
              style={{ border: '2px solid rgba(165, 165, 165, 0.3)', marginTop: '20px' }}>
              <h3 style={{ width: '100%', fontSize: '15px' }}>
                <span>{data.thisYear}년도 {data.hakgi}학기</span>
                <span style={{ float: 'right', fontSize: '18px' }}>{data.classOrder}위<span style={{ opacity: .3 }}>/{data.manNum}명</span></span>
              </h3>
              <div style={{ display: 'flex', justifyContent: 'center', width: '100%', gap: '20px', opacity: .8, fontSize: '15px', marginTop: '5px' }}>
                <div style={{ textAlign: 'center', width: '100%' }}>
                  <span style={{ opacity: .8, fontSize: '12px' }}>신청학점</span>
                  <h3 style={{ margin: 0 }}>{data.applyHakjum}</h3>
                </div>
                <div style={{ textAlign: 'center', width: '100%' }}>
                  <span style={{ opacity: .8, fontSize: '12px' }}>총점</span>
                  <h3 style={{ margin: 0 }}>{data.applySum}</h3>
                </div>
                <div style={{ textAlign: 'center', width: '100%' }}>
                  <span style={{ opacity: .8, fontSize: '12px' }}>평점</span>
                  <h3 style={{ margin: 0 }}>{data.applyPoint}</h3>
                </div>
                <div style={{ textAlign: 'center', width: '100%' }}>
                  <span style={{ opacity: .8, fontSize: '12px' }}>백분율</span>
                  <h3 style={{ margin: 0 }}>{data.pcnt}</h3>
                </div>
              </div>
            </div>
          ))
        )
      ) : (
        <div>
          <div className="skeleton" style={{ height: '70px', width: '100%', marginBottom: '10px' }} />
          <div className="skeleton" style={{ height: '70px', width: '100%', marginBottom: '10px' }} />
          <div className="skeleton" style={{ height: '70px', width: '100%' }} />
        </div>
      )}
      <br /><br /><br />
    </main >
  );
}