import { useState, useEffect, useRef } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import handleCalculateGPA, { calculateGPA } from "./utils/calculateGPA";
import IonIcon from '@reacticons/ionicons';
import { BottomSheet } from 'react-spring-bottom-sheet';
import 'react-spring-bottom-sheet/dist/style.css'
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function Home() {
  const [token, setToken] = useState("");
  const [grade, setGrade] = useState(null);
  const [synthesisGPAs, setSynthesisGPAs] = useState();
  const [totGrade, setTotGrade] = useState();
  const [totGradeIncludeEmptyGrade, setTotGradeIncludeEmptyGrade] = useState();
  const [chartDatasets, setChartDatasets] = useState();
  const [prefersDarkMode, setPrefersDarkMode] = useState(false);
  const [subjects, setSubjects] = useState();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    window.receiveToken = function (receivedToken) {
      if (!receivedToken) return;
      setToken(receivedToken);
    };

    Android.completePageLoad();
    setPrefersDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
  }, [])

  useEffect(() => {
    if (!token) return;
    fetch("/api/grade/grade", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    })
      .then((response) => response.json())
      .then((data) => {
        setGrade(data);
      })
      .catch((error) => {
        console.error(error);
      });

    fetch("/api/grade/totGrade", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    })
      .then((response) => response.json())
      .then((data) => {
        setTotGradeIncludeEmptyGrade(data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [token]);

  useEffect(() => {
    if (!grade) return;
    const getData = async () => {
      const semesters = await handleCalculateGPA(grade)
      const synthesisGPAs = await calculateGPA(semesters)
      setSynthesisGPAs(synthesisGPAs);
      drawChart(synthesisGPAs);
    }

    getData();
  }, [grade]);

  useEffect(() => {
    if (isModalOpen) {
      window.scrollTo(0, document.body.scrollHeight);
    } else {
      window.scrollTo(0, 0);
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (!synthesisGPAs) return;
    const tot = synthesisGPAs.find(semester => semester.name === '전체 학기');
    setTotGrade(tot)
  }, [synthesisGPAs]);

  const drawChart = (data) => {
    if (!data) return;
    const chartData = data.slice(0, -1).filter((value) => !value.name.includes('계절학기'));
    setChartDatasets({
      labels: chartData.map((value) => value.name),
      datasets: [
        {
          label: '전공 평점',
          data: chartData.map((value) => value.majorGPA.includeF),
          borderColor: '#e74c3c',
          borderWidth: 1,
          fill: false,
          tension: 0,
          pointBackgroundColor: 'white',
          pointRadius: 5,
        },
        {
          label: '전공 외 평점',
          data: chartData.map((value) => value.nonMajorGPA.includeF),
          borderColor: '#2980b9',
          borderWidth: 1,
          fill: false,
          tension: 0,
          pointBackgroundColor: 'white',
          pointRadius: 5,
        },
        {
          label: '평균 평점',
          data: chartData.map((value) => value.averageGPA.includeF),
          borderColor: '#bdc3c7',
          borderWidth: 2,
          fill: false,
          tension: 0,
          pointBackgroundColor: 'white',
          pointRadius: 5,
        },
      ],
    })
  }

  const openDetailModal = (id) => {
    const data = { name: synthesisGPAs[id].name, subjects: synthesisGPAs[id].subjects };
    if (!data) return;
    setSubjects(data);
    setIsModalOpen(true);
  }

  return (
    <main>
      <h2 style={{ marginBottom: '20px', marginTop: '20px' }}>성적

        <button onClick={() => Android.openPage('https://klas.kw.ac.kr/std/cps/inqire/AtnlcScreStdPage.do')}
          style={{ float: 'right', border: '1px solid var(--card-background)', width: 'fit-content', fontSize: '14px', marginTop: '-5px', borderRadius: '20px', padding: '10px 15px' }}>
          KLAS에서 열기
        </button>


      </h2>


      {totGradeIncludeEmptyGrade ?
        (
          <div className="profile-card grade-card" style={{ padding: '10px 0', flexDirection: 'row', alignItems: 'space-between' }}>
            <div style={{ textAlign: 'center', width: '100%' }}>
              <span style={{ opacity: .8, fontSize: '12px' }}>신청학점</span>
              <h3 style={{ margin: 0 }}>{totGradeIncludeEmptyGrade.applyHakjum}</h3>
              <span style={{ opacity: .5, fontSize: '12px' }}>전공 {totGradeIncludeEmptyGrade.majorApplyHakjum}</span>
            </div>
            <div style={{ textAlign: 'center', width: '100%' }}>
              <span style={{ opacity: .8, fontSize: '12px' }}>삭제학점</span>
              <h3 style={{ margin: 0 }}>{totGradeIncludeEmptyGrade.delHakjum}</h3>
              <span style={{ opacity: .5, fontSize: '12px' }}>전공 {totGradeIncludeEmptyGrade.majorDelHakjum}</span>
            </div>
            <div style={{ textAlign: 'center', width: '100%' }}>
              <span style={{ opacity: .8, fontSize: '12px' }}>취득학점</span>
              <h3 style={{ margin: 0 }}>{totGradeIncludeEmptyGrade.chidukHakjum}</h3>
              <span style={{ opacity: .5, fontSize: '12px' }}>전공 {totGradeIncludeEmptyGrade.majorChidukHakjum}</span>
            </div>
            <div style={{ textAlign: 'center', width: '100%' }}>
              <span style={{ opacity: .8, fontSize: '12px' }}>평량평균</span>
              <h3 style={{ marginTop: '10px' }}>{totGradeIncludeEmptyGrade.jaechulScoresum}</h3>
            </div>
          </div>
        ) : (
          <div>
            <div className="skeleton" style={{ height: '70px', width: '100%' }} />
          </div>
        )
      }

      <span style={{ opacity: .5, fontSize: '12px', float: 'right', padding: '10px', textAlign: 'right' }}>*위 평량평균은 성적증명서 기준임<br />
        학적부 기준: {totGradeIncludeEmptyGrade && totGradeIncludeEmptyGrade.hwakinScoresum}</span>

      <br /><br /><br />

      <h4>학기 별 성적</h4>
      {synthesisGPAs ? (
        synthesisGPAs.map((value, id) => (
          value.name === '전체 학기' ? (
            <div className="profile-card"
              style={{ border: '2px solid rgba(165, 165, 165, 0.3)', marginTop: '20px' }}>
              <h3>{value.name}</h3>
              <div style={{ display: 'flex', justifyContent: 'center', width: '100%', gap: '20px' }}>
                <div style={{ textAlign: 'center', width: '100%' }}>
                  <span style={{ opacity: .8, fontSize: '12px' }}>취득학점</span>
                  <h3 style={{ margin: 0 }}>{value.credit}</h3>
                  <span style={{ opacity: .5, fontSize: '12px' }}>F 미포함 :</span>

                </div>
                <div style={{ textAlign: 'center', width: '100%' }}>
                  <span style={{ opacity: .8, fontSize: '12px' }}>전공</span>
                  <h3 style={{ margin: 0 }}>{value.majorGPA.includeF}</h3>
                  <span style={{ opacity: .5, fontSize: '12px' }}>{value.majorGPA.excludeF}</span>
                </div>
                <div style={{ textAlign: 'center', width: '100%' }}>
                  <span style={{ opacity: .8, fontSize: '12px' }}>전공 외</span>
                  <h3 style={{ margin: 0 }}>{value.nonMajorGPA.includeF}</h3>
                  <span style={{ opacity: .5, fontSize: '12px' }}>{value.nonMajorGPA.excludeF}</span>
                </div>
                <div style={{ textAlign: 'center', width: '100%' }}>
                  <span style={{ opacity: .8, fontSize: '12px' }}>평균</span>
                  <h3 style={{ margin: 0 }}>{value.averageGPA.includeF}</h3>
                  <span style={{ opacity: .5, fontSize: '12px' }}>{value.averageGPA.excludeF}</span>
                </div>
              </div>
            </div>
          ) : value.name.includes('계절학기') ? (
            <button className="profile-card"
              onClick={() => openDetailModal(id)}
              style={{ marginTop: '10px' }}>
              <h3 style={{ width: '100%', margin: 0 }}>{value.name}
                <IonIcon style={{ float: 'right' }} name="chevron-forward" /></h3>
            </button>
          ) :
            (
              <button className="profile-card"
                onClick={() => openDetailModal(id)}
                style={{ marginTop: '10px' }}>
                <h3 style={{ width: '100%' }}>{value.name}
                  <IonIcon style={{ float: 'right' }} name="chevron-forward" /></h3>
                <div style={{ display: 'flex', justifyContent: 'center', width: '100%', gap: '20px' }}>
                  <div style={{ textAlign: 'center', width: '100%' }}>
                    <span style={{ opacity: .8, fontSize: '12px' }}>취득학점</span>
                    <h3 style={{ margin: 0 }}>{value.credit}</h3>
                    <span style={{ opacity: .5, fontSize: '12px' }}>F 미포함 :</span>

                  </div>
                  <div style={{ textAlign: 'center', width: '100%' }}>
                    <span style={{ opacity: .8, fontSize: '12px' }}>전공</span>
                    <h3 style={{ margin: 0 }}>{value.majorGPA.includeF}</h3>
                    <span style={{ opacity: .5, fontSize: '12px' }}>{value.majorGPA.excludeF}</span>
                  </div>
                  <div style={{ textAlign: 'center', width: '100%' }}>
                    <span style={{ opacity: .8, fontSize: '12px' }}>전공 외</span>
                    <h3 style={{ margin: 0 }}>{value.nonMajorGPA.includeF}</h3>
                    <span style={{ opacity: .5, fontSize: '12px' }}>{value.nonMajorGPA.excludeF}</span>
                  </div>
                  <div style={{ textAlign: 'center', width: '100%' }}>
                    <span style={{ opacity: .8, fontSize: '12px' }}>평균</span>
                    <h3 style={{ margin: 0 }}>{value.averageGPA.includeF}</h3>
                    <span style={{ opacity: .5, fontSize: '12px' }}>{value.averageGPA.excludeF}</span>
                  </div>
                </div>
              </button>
            )
        )).reverse()
      ) : (
        <div>
          <div className="skeleton" style={{ height: '120px', width: '100%' }} />
          <div className="skeleton" style={{ height: '120px', width: '100%' }} />
          <div className="skeleton" style={{ height: '120px', width: '100%' }} />
        </div>
      )}

      <h4 style={{ marginTop: '30px', marginBottom: '10px' }}>성적 추이</h4>
      {synthesisGPAs ? (
        synthesisGPAs.length >= 1 && (
          <div style={{ margin: '25px 0' }}>
            <Line data={chartDatasets} options={{
              scales: {
                y: {
                  beginAtZero: false,
                  suggestedMin: 2,
                  suggestedMax: 4.5,
                  ticks: {
                    color: prefersDarkMode ? 'white' : 'black',
                  },
                  grid: {
                    color: prefersDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                  },
                },
                x: {
                  ticks: {
                    color: prefersDarkMode ? 'white' : 'black',
                  },
                  grid: {
                    color: prefersDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                  },
                },
              },
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: {
                    color: prefersDarkMode ? 'white' : 'black',
                  },
                },
              },
            }} />
          </div>
        )
      ) : (
        <div>
          <div className="skeleton" style={{ height: '200px', width: '100%' }} />
        </div>
      )}

      <BottomSheet open={isModalOpen} expandOnContentDrag={false} scrollLocking={false} onDismiss={() => setIsModalOpen(false)}
        data-body-scroll-lock-ignore="true">
        <div className="bottom-sheet"
          style={{
            WebkitOverflowScrolling: 'touch'
          }}>
          <h2>{subjects && subjects.name}</h2>
          <br />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: "70dvh", overflowY: 'scroll', msOverflowStyle: 'none' }}>
            {subjects && subjects.subjects.map((value) => (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid var(--card-border)' }}>
                <div>
                  <h3>{value.gwamokKname}</h3>
                  <span style={{ opacity: .8, fontSize: '14px' }}>{value.codeName1}, {value.hakjumNum}학점</span><br />
                  <span style={{ opacity: .5, fontSize: '14px' }}>{value.hakgwa} {value.certname && (" | " + value.certname)} {value.retakeOpt == "Y" && " | 재수강"} {value.retakeGetGrade != null && " | 삭제 예정"}</span>
                </div>
                <h3 style={{ float: 'right' }}>{value.getGrade.replace("미입력", "").replace("(처리중)", "").replace("수업 미평가", "")}
                  {value.getGrade.includes('미입력') && <span style={{ opacity: .5 }}>미입력</span>}
                  {value.getGrade.includes('수업 미평가') && <span style={{ opacity: .5 }}>수업 미평가</span>}
                  {value.getGrade.includes('(처리중)') && <span style={{ opacity: .5 }}>(처리중)</span>}
                </h3>
              </div>
            ))}
          </div>
          <br />
          <button onClick={() => setIsModalOpen(false)}>닫기</button>
        </div>
      </BottomSheet>

      {isModalOpen &&
        <div style={{ height: '100dvh' }} />}
    </main >
  );
}