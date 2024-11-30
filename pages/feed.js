import React, { useState, useEffect } from 'react';
import TodaysCafeteriaMenu from './components/TodaysCafeteria';
import IonIcon from '@reacticons/ionicons';
import AppVersion from './components/appVersion';
import LectureNotices from './components/lectureNotices';
import Spacer from './components/spacer';

export default function Home() {
  const [yearHakgi, setYearHakgi] = useState(null);
  const [token, setToken] = useState(null);
  const [deadlines, setDeadlines] = useState([]);

  const [timetable, setTimetable] = useState(null);
  const [selectedSubj, setSelectedSubj] = useState(null);
  const [selectedSubjName, setSelectedSubjName] = useState(null);
  const [statusText, setStatusText] = useState("");
  const [showButtons, setShowButtons] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cafeteria, setCafeteria] = useState(null);
  const [kwNotice, setKWNotice] = useState(null);
  const [excludeNotStarted, setExcludeNotStarted] = useState(false);
  const [showToggle, setShowToggle] = useState(false);
  const [filteredDeadlines, setFilteredDeadlines] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const yearHakgi = urlParams.get('yearHakgi');
    setYearHakgi(yearHakgi);

    const savedExcludeNotStarted = JSON.parse(localStorage.getItem('excludeNotStarted') || 'false');
    setExcludeNotStarted(savedExcludeNotStarted);

    setupWindowFunctions(savedExcludeNotStarted);
    fetchData();

    Android.completePageLoad();

    return () => {
      delete window.receiveDeadlineData;
      delete window.receiveNoticeData;
      delete window.receiveTimetableData;
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (timetable) {
        updateTimetableStatus(timetable);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [timetable]);

  const setupWindowFunctions = (excludeNotStartedTemp) => {
    window.receiveDeadlineData = (json) => {
      const data = processDeadlineData(JSON.parse(json));
      setDeadlines(data);
      filterDeadlines(data, excludeNotStartedTemp);
    };

    window.receiveTimetableData = (json) => {
      const data = JSON.parse(json);
      setTimetable(data);
      updateTimetableStatus(data);
    };

    window.receiveToken = (receivedToken) => {
      if (receivedToken) setToken(receivedToken);
    };
  };

  const fetchData = async () => {
    try {
      const [cafeteriaData, kwNoticeData] = await Promise.all([
        fetch("/api/crawler/cafeteria").then(res => res.json()),
        fetch("/api/crawler/kwNotice").then(res => res.json())
      ]);

      setCafeteria(cafeteriaData.weeklyMenu);
      setKWNotice(kwNoticeData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const processDeadlineData = (data) => {
    const hasStartDate = data.some(item =>
      item.onlineLecture.some(lecture => lecture.startDate) ||
      item.task.some(task => task.startDate) ||
      item.teamTask.some(teamTask => teamTask.startDate)
    );
    setShowToggle(hasStartDate);

    return data.map(course => ({
      ...course,
      onlineLecture: sortByHourGap(course.onlineLecture),
      task: sortByHourGap(course.task),
      teamTask: sortByHourGap(course.teamTask),
      minHourGap: Math.min(
        course.onlineLecture[0]?.hourGap ?? Infinity,
        course.task[0]?.hourGap ?? Infinity,
        course.teamTask[0]?.hourGap ?? Infinity
      )
    })).sort((a, b) => a.minHourGap - b.minHourGap);
  };

  const sortByHourGap = (items) => items.sort((a, b) => a.hourGap - b.hourGap);

  const filterDeadlines = (data, excludeUnstarted) => {
    let filteredData = excludeUnstarted ? filterUnstartedItems(data) : data;
    filteredData = filteredData.filter(item =>
      item.onlineLecture.length > 0 || item.task.length > 0 || item.teamTask.length > 0
    );
    filteredData = updateMinHourGap(filteredData);
    setFilteredDeadlines(filteredData);
  };

  const filterUnstartedItems = (data) => {
    const now = new Date();
    return data.map(course => ({
      ...course,
      onlineLecture: filterStartedItems(course.onlineLecture, now),
      task: filterStartedItems(course.task, now),
      teamTask: filterStartedItems(course.teamTask, now)
    }));
  };

  const filterStartedItems = (items, now) =>
    items.filter(item => !item.startDate || new Date(item.startDate) <= now);

  const updateMinHourGap = (data) =>
    data.map(course => ({
      ...course,
      minHourGap: Math.min(
        course.onlineLecture[0]?.hourGap ?? Infinity,
        course.task[0]?.hourGap ?? Infinity,
        course.teamTask[0]?.hourGap ?? Infinity
      )
    })).sort((a, b) => a.minHourGap - b.minHourGap);

  const handleToggleChange = () => {
    const checked = !excludeNotStarted;
    localStorage.setItem('excludeNotStarted', JSON.stringify(checked));
    setExcludeNotStarted(checked);
    filterDeadlines(deadlines, checked);
  };

  const updateTimetableStatus = (data) => {
    let currentDay = new Date().getDay() - 1;
    if (currentDay === -1) currentDay = 6;

    if (currentDay === 5 || currentDay === 6) {
      setStatusText("오늘 수업이 없어요 😊");
      setShowButtons(false);
      return;
    }

    const currentHour = new Date().getHours();
    const currentMinute = new Date().getMinutes();
    const currentTime = currentHour + currentMinute / 60;

    let isOngoingClass = false;
    let closestClass = null;
    const today = Object.values(data).flatMap(classes => classes.filter(c => c.day === currentDay));

    for (const c of today) {
      const startTime = parseInt(c.startTime.split(":")[0]) + parseInt(c.startTime.split(":")[1]) / 60;
      const endTime = parseInt(c.endTime.split(":")[0]) + parseInt(c.endTime.split(":")[1]) / 60;

      if (startTime <= currentTime && currentTime < endTime) {
        const endHour = Math.floor(endTime);
        const endMinute = Math.floor((endTime - endHour) * 60);
        setStatusText(`<span style="opacity: 0.6">지금은</span><br/>${c.title} <span style="opacity: 0.6">수업 중</span>
        <br/>
        <span style="opacity: 0.6; font-size:14px;">${endHour}:${endMinute.toString().padStart(2, '0')}에 종료</span>`);
        setSelectedSubj(c.subj);
        setSelectedSubjName(c.title);
        setShowButtons(true);
        isOngoingClass = true;
        break;
      } else if (currentTime < startTime) {
        if (!closestClass || startTime < closestClass.startTime) {
          closestClass = { ...c, startTime };
        }
      }
    }

    if (!isOngoingClass) {
      if (closestClass) {
        const { title, subj, info, startTime } = closestClass;
        const startHour = Math.floor(startTime);
        const startMinute = Math.floor((startTime - startHour) * 60);
        setStatusText(`${startHour}:${startMinute.toString().padStart(2, '0')}<span style="opacity: 0.6">에</span><br/> ${title} <span style="opacity: 0.6">수업이 있어요.</span>
        <br/>
        <span style="opacity: 0.6; font-size:14px;">${info} 교수</span>`);
        setSelectedSubj(subj);
        setSelectedSubjName(title);
        setShowButtons(true);
      } else if (today.length > 0) {
        setStatusText("오늘 수업이 더 이상 없어요 😎");
        setShowButtons(false);
      } else {
        setStatusText("오늘 수업이 없어요 😊");
        setShowButtons(false);
      }
    }
  };

  const openLecturePage = () => {
    if (typeof Android !== 'undefined') {
      Android.openLectureActivity(selectedSubj, selectedSubjName);
    }
  };

  const openQRScan = () => {
    if (typeof Android !== 'undefined') {
      Android.qrCheckIn(selectedSubj, selectedSubjName);
    }
  };

  const renderDeadlineContent = (name, data) => {
    if (data.length === 0) return null;

    const { hourGap } = data[0];
    if (hourGap === Infinity) {
      return <span style={{ color: 'var(--green)' }} className="remain-none">남아있는 {name}가 없습니다!</span>;
    }

    const remainingDay = Math.floor(hourGap / 24);
    const color = getDeadlineColor(hourGap);
    const deadline = remainingDay === 0 ? 'D-DAY' : `D-${remainingDay}`;

    return (
      <span className="will-remain" style={{ marginBottom: '5px' }}>
        <b style={{ fontSize: '20px', color }}>{deadline}</b> {name} 총 {data.length}개
        <svg style={{ width: '15px', marginLeft: '-7px' }} xmlns="http://www.w3.org/2000/svg" className="ionicon" viewBox="0 0 512 512">
          <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="48" d="M184 112l144 144-144 144" />
        </svg>
      </span>
    );
  };

  const getDeadlineColor = (hourGap) => {
    if (hourGap <= 24) return 'var(--red)';
    if (hourGap <= 96) return 'var(--orange)';
    return 'var(--green)';
  };

  return (
    <div style={{ padding: '5px' }}>
      {statusText ? (
        <div id="current_status">

          <h4 id="status_txt" dangerouslySetInnerHTML={{ __html: statusText }}></h4>
          {showButtons && (
            <div id="status_btns">
              <button id="qr_btn" onClick={openLecturePage} style={{ backgroundColor: 'var(--button-background)', color: 'var(--button-text)', width: 'fit-content', padding: '10px 15px', fontSize: '15px' }}>강의 홈</button>
              <button id="qr_btn" onClick={openQRScan} style={{ backgroundColor: 'var(--card-background)', color: 'var(--text-color)', marginLeft: '10px', width: 'fit-content', padding: '10px 15px', fontSize: '15px' }}>
                QR 출석
              </button>
            </div>
          )}
        </div>
      ) : (
        <div id="current_status">
          <div className="skeleton" style={{ height: '30px', width: '30%', marginBottom: '10px' }} />
          <div className="skeleton" style={{ height: '20px', width: '60%' }} />
        </div>
      )}

      <Spacer y={40} />

      <AppVersion updater={true} />

      <h3><span className='tossface' style={{ position: 'relative', top: '2px' }}>⏰</span> 잊지 말고 챙겨볼까요?

        { /*<button type="button" onClick={() => {
          try {
            Android.reload();
          } catch (e) {
            toast.error('현재 버전에서 지원되지 않는 기능입니다. 앱을 최신 버전으로 업데이트 해주세요.');
            console.error(e);
          }
        }} style={{ background: 'var(--card-background)', padding: '5px', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', float: 'right', marginTop: '-5px' }}>
          <IonIcon name="refresh" />
        </button>
*/ }

      </h3>

      {/* <Spacer y={5} /> */}



      {showToggle && (
        <>
          <Spacer y={5} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ opacity: .7, fontSize: '14px' }}>아직 시작일이 되지 않은 항목 숨기기</span>
            <label className="switch" style={{ transform: 'scale(0.8)' }}>
              <input
                type="checkbox"
                checked={excludeNotStarted}
                onChange={handleToggleChange}
              />
              <span className="slider"></span>
            </label>
          </div>
        </>
      )}

      <Spacer y={15} />
      <div id="remaining-deadline">
        {filteredDeadlines ? (
          filteredDeadlines.length === 0 ? (<span style={{ opacity: .5 }}>남아있는 강의 및 과제가 없습니다!</span>) : (
            filteredDeadlines.map((item, index) => (
              <div key={index} className="card" style={{ paddingBottom: '15px' }}>
                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignContent: 'center' }}>
                  <b style={{ fontSize: '15px' }}>{item.name}</b>
                  <div style={{ position: 'relative', top: '-8px', right: '-5px' }}>
                    <button style={{ width: 'fit-content', background: 'var(--background)', fontSize: '12px', padding: '8px 10px' }}
                      onClick={() => typeof Android !== 'undefined' && Android.openLectureActivity(item.subj, item.name)}>강의 홈</button>
                  </div>
                </div>

                <div onClick={() => typeof Android !== 'undefined' && Android.evaluate('/std/lis/evltn/OnlineCntntsStdPage.do', yearHakgi, item.subj)}>
                  {renderDeadlineContent('온라인 강의', item.onlineLecture)}
                </div>
                <div onClick={() => typeof Android !== 'undefined' && Android.evaluate('/std/lis/evltn/TaskStdPage.do', yearHakgi, item.subj)}>
                  {renderDeadlineContent('과제', item.task)}
                </div>
                <div onClick={() => typeof Android !== 'undefined' && Android.evaluate('/std/lis/evltn/PrjctStdPage.do', yearHakgi, item.subj)}>
                  {renderDeadlineContent('팀 프로젝트', item.teamTask)}
                </div>
              </div>
            ))
          )
        ) : (
          <div>
            <div className="skeleton" style={{ height: '80px', width: '100%', marginBottom: '10px' }} />
            <div className="skeleton" style={{ height: '80px', width: '100%', marginBottom: '10px' }} />
            <div className="skeleton" style={{ height: '80px', width: '100%', marginBottom: '10px' }} />

          </div>
        )}
      </div>

      <LectureNotices token={token} />
      <Spacer y={40} />

      <h3>
        오늘의 학식
        <button onClick={() => Android.openPage('https://www.kw.ac.kr/ko/life/facility11.jsp')} style={{ float: "right", width: 'fit-content', marginTop: '-5px' }}>
          <IonIcon name='add-outline' />
        </button>
      </h3>
      <Spacer y={15} />
      <div className="card non-anim" style={{ paddingTop: '1.5em', paddingBottom: '0.1em' }}>
        {!cafeteria ? (
          <>
            <div className="skeleton" style={{ height: '20px', width: '30%', marginBottom: '10px', marginTop: '-10px' }} />
            <div className="skeleton" style={{ height: '20px', width: '50%', marginBottom: '10px' }} />
            <div className="skeleton" style={{ height: '20px', width: '40%', marginBottom: '10px' }} />
            <div className="skeleton" style={{ height: '20px', width: '70%', marginBottom: '20px' }} />
          </>
        ) : (
          <TodaysCafeteriaMenu weeklyMenu={cafeteria} />
        )}
      </div>
      <Spacer y={40} />

      <h3>
        학사 공지사항
        <button onClick={() => Android.openPage('https://www.kw.ac.kr/ko/life/notice.jsp?srCategoryId=1')} style={{ float: "right", width: 'fit-content', marginTop: '-5px' }}>
          <IonIcon name='add-outline' />
        </button>
      </h3>
      <Spacer y={15} />
      <div className="card non-anim" id="notices" style={{ paddingBottom: '20px' }}>
        {!kwNotice ? (
          <>
            <div className="skeleton" style={{ height: '50px', width: '100%', marginBottom: '15px' }} />
            <div className="skeleton" style={{ height: '50px', width: '100%', marginBottom: '15px' }} />
            <div className="skeleton" style={{ height: '50px', width: '100%' }} />
          </>
        ) : kwNotice.length === 0 ? (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', justifyContent: 'center', opacity: '.5' }}>
            <span>최근 공지사항이 없습니다!</span>
          </div>
        ) : (
          kwNotice.slice(0, 6).map((notice, index) => (
            <div key={index} className="notice-item" onClick={() => Android.openPage(`${notice.link}`)}>
              <span><b>{notice.title.replace("신규게시글", "").replace("Attachment", "")}</b></span><br />
              <span style={{ opacity: 0.6, fontSize: '12px' }}>{notice.createdDate} · {notice.author}</span>
              {index !== 5 && <hr style={{ opacity: 0.3 }} />}
            </div>
          ))
        )}
      </div>
      <br /> <br />
      <br />
    </div>
  );
}