import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import handleCalculateGPA, { calculateGPA } from "./utils/calculateGPA";
import IonIcon from '@reacticons/ionicons';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function Home() {
  const [token, setToken] = useState("");
  const [grade, setGrade] = useState(null);
  const [synthesisGPAs, setSynthesisGPAs] = useState();
  const [totGrade, setTotGrade] = useState();
  const [chartDatasets, setChartDatasets] = useState();
  const [prefersDarkMode, setPrefersDarkMode] = useState(false);

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
    fetch("/api/grade", {
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
    if (!synthesisGPAs) return;
    const tot = synthesisGPAs.find(semester => semester.name === '전체 학기');
    setTotGrade(tot)
  }, [synthesisGPAs]);

  const drawChart = (data) => {
    if (!data) return;
    const chartData = data.slice(0, -1);
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

  return (
    <main>
      <h2 style={{ marginBottom: '20px', marginTop: '20px' }}>성적

        <button onClick={() => location.href = 'https://klas.kw.ac.kr/std/cps/inqire/AtnlcScreStdPage.do'}
          style={{ float: 'right', border: '1px solid var(--card-background)', width: 'fit-content', fontSize: '14px', marginTop: '-5px', borderRadius: '20px', padding: '10px 15px' }}>
          KLAS에서 열기
        </button>


      </h2>
      <br />
      {totGrade && (
        <div className="profile-card grade-card" style={{ flexDirection: 'row', alignItems: 'space-between' }}>
          <div style={{ textAlign: 'center', width: '100%' }}>
            <span style={{ opacity: .8, fontSize: '12px' }}>취득학점</span>
            <h3>{totGrade.credit}</h3>
          </div>
          <div style={{ textAlign: 'center', width: '100%' }}>
            <span style={{ opacity: .8, fontSize: '12px' }}>전체평점</span>
            <h3>{totGrade.averageGPA.includeF}</h3>
          </div>
          <div style={{ textAlign: 'center', width: '100%' }}>
            <span style={{ opacity: .8, fontSize: '12px' }}>전공평점</span>
            <h3>{totGrade.majorGPA.includeF}</h3>
          </div>
        </div>
      )}

      <h4 style={{ marginTop: '30px', marginBottom: '10px' }}>학기 별 학점</h4>
      {synthesisGPAs &&
        <div className="table-container">
          <table id="synthesis-score-table">
            <colgroup>
              <col width="25%" />
              <col width="15%" />
              <col width="10%" />
              <col width="10%" />
              <col width="10%" />
              <col width="10%" />
              <col width="10%" />
              <col width="10%" />
            </colgroup>
            <thead>
              <tr>
                <th rowSpan="2">학기</th>
                <th rowSpan="2">취득 학점</th>
                <th colSpan="2">전공 평점</th>
                <th colSpan="2">전공 외 평점</th>
                <th colSpan="2">평균 평점</th>
              </tr>
              <tr>
                <th>F 포함</th>
                <th>미포함</th>
                <th>F 포함</th>
                <th>미포함</th>
                <th>F 포함</th>
                <th>미포함</th>
              </tr>
            </thead>
            <tbody>
              {synthesisGPAs && synthesisGPAs.map((value) => (
                <tr key={value.name} style={{ fontWeight: value.name === '전체 학기' ? 'bold' : 'normal' }}>
                  <td>{value.name}</td>
                  <td>{value.credit}</td>
                  <td>{value.majorGPA.includeF}</td>
                  <td>{value.majorGPA.excludeF}</td>
                  <td>{value.nonMajorGPA.includeF}</td>
                  <td>{value.nonMajorGPA.excludeF}</td>
                  <td>{value.averageGPA.includeF}</td>
                  <td>{value.averageGPA.excludeF}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>}

      <h4 style={{ marginTop: '30px', marginBottom: '10px' }}>성적 추이</h4>
      {synthesisGPAs && synthesisGPAs.length >= 1 && (
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
      )}
    </main >
  );
}