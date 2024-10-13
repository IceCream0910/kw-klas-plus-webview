import { useState, useEffect } from "react";
import IonIcon from '@reacticons/ionicons';
import handleCalculateGPA, { calculateGPA } from "./utils/calculateGPA";
import AppVersion from "./components/appVersion";
import Spacer from "./components/spacer";

export default function Home() {
  const [list, setList] = useState(null);
  const [filteredList, setFilteredList] = useState(null);
  const [token, setToken] = useState(null);
  const [subj, setSubj] = useState(null);
  const [yearHakgi, setYearHakgi] = useState(null);
  const [excludeFinished, setExcludeFinished] = useState(false);

  useEffect(() => {
    window.receivedData = function (token, subj, yearHakgi) {
      if (!token || !subj || !yearHakgi) return;
      setToken(token);
      setSubj(subj);
      setYearHakgi(yearHakgi);
    };

    const savedExcludeFinished = JSON.parse(localStorage.getItem('excludeFinished') || 'false');
    setExcludeFinished(savedExcludeFinished);

    Android.completePageLoad();
  }, [])

  useEffect(() => {
    if (!token) return;

    fetch("/api/onlineLectureList", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, subj, yearHakgi }),
    })
      .then((response) => response.json())
      .then((data) => {
        setList(data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [token]);

  useEffect(() => {
    if (list) {
      filterList(list, excludeFinished);
    }
  }, [list, excludeFinished]);

  const handleToggleChange = () => {
    const checked = !excludeFinished;
    localStorage.setItem('excludeFinished', JSON.stringify(checked));
    setExcludeFinished(checked);
    filterList(list, checked);
  };

  const filterList = (data, excludeFinished) => {
    if (excludeFinished) {
      setFilteredList(data.filter((item) => item.prog < 100));
    } else {
      setFilteredList(data);
    }
  }

  const handleOpenLectureClick = (item) => {
    const lectureData = {
      grcode: item.grcode,
      subj: item.subj,
      year: item.year,
      hakgi: item.hakgi,
      bunban: item.bunban,
      module: item.module,
      lesson: item.lesson,
      oid: item.oid,
      starting: 'xxx',
      contentsType: 'xxx',
      weekNo: item.weekNo,
      weeklyseq: item.weeklyseq,
      width: item.width,
      height: item.height,
      today: item.today,
      sdate: item.sdate,
      edate: item.edate,
      ptype: item.ptype,
      learnTime: item.learnTime,
      prog: item.prog,
      ptime: item.ptime
    };

    window.Android.requestOnlineLecture(JSON.stringify(lectureData));
  };

  return (
    <main>
      <Spacer y={5} />
      <h2>온라인 강의
        <button onClick={() => Android.openInKLAS()} style={{ float: 'right', border: '1px solid var(--card-background)', width: 'fit-content', fontSize: '14px', marginTop: '-5px', borderRadius: '20px', padding: '10px 15px' }}>
          KLAS에서 열기
        </button>
      </h2>
      <Spacer y={30} />
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '5px', fontSize: '14px', opacity: .8, paddingRight: '5px' }}>
        <input type="checkbox" id="toggle" checked={excludeFinished} onChange={handleToggleChange} style={{ width: 'fit-content' }} />
        <label htmlFor="toggle" style={{ width: 'fit-content' }}>수강 완료 강의 제외</label>
      </div>

      <Spacer y={20} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {!filteredList && (
          <>
            <div className="skeleton" style={{ height: '80px', width: '100%' }} />
            <div className="skeleton" style={{ height: '80px', width: '100%' }} />
            <div className="skeleton" style={{ height: '80px', width: '100%' }} />
            <div className="skeleton" style={{ height: '80px', width: '100%' }} />
          </>
        )}

        {filteredList && filteredList.length === 0 && (
          <span style={{ opacity: .5 }}>온라인 강의가 없습니다!</span>
        )}

        {filteredList && filteredList.map((item, index) =>
          (!item.grcode) ? null :
            (
              <>
                <div className="card" style={{ display: 'flex', gap: '10px', alignContent: 'center', padding: '15px', border: item.prog === 100 && '0.5px solid var(--green)' }}>
                  <div>
                    <span><b>{item.sbjt}</b></span>
                    <Spacer y={5} />
                    <span style={{ fontSize: '15px' }}>
                      <IonIcon style={{ fontSize: '13px', position: 'relative', top: '2px', opacity: .5 }} name='time-outline' />
                      <span style={{ fontSize: '13px', marginLeft: '5px', opacity: .5 }}>{item.lrnPd}</span>
                    </span><br />
                    <span style={{ fontSize: '15px' }}>
                      <IonIcon style={{ fontSize: '13px', position: 'relative', top: '2px', opacity: .5 }} name='time-outline' />
                      <span style={{ fontSize: '13px', marginLeft: '5px', opacity: .5 }}>{item.prog}% ({item.achivTime}분/{item.rcognTime}분)</span>
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: 'fit-content', justifyContent: 'center' }}>
                    {new Date(item.startDate) > new Date() ? (
                      <button onClick={() => {
                        if (item.starting) {
                          alert("학습 시작일 이전에 강의 영상을 미리 시청할 수 있습니다. 이 경우 학습 시간은 인정되지 않습니다. 학습 시작일 이후 강의를 다시 시청해야 출석으로 인정되니 주의바랍니다.");
                          Android.openExternalLink(item.starting);
                        } else
                          alert("아직 강의 영상이 업로드되지 않았습니다.")
                      }} style={{ width: '70px', background: 'var(--background)', fontSize: '12px', padding: '8px 10px', textAlign: 'center' }}>미리보기</button>
                    ) : (
                      <button onClick={() => handleOpenLectureClick(item)} style={{ width: '50px', background: 'var(--background)', fontSize: '12px', padding: '8px 10px', textAlign: 'center' }}>보기</button>
                    )
                    }
                  </div>
                </div>
              </>
            ))}
      </div>
    </main>
  );
}