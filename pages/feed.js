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
  const [notices, setNotices] = useState([]);
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
  const [filteredDeadlines, setFilteredDeadlines] = useState([]);

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
    if (token) {
      fetchLectureNotices();
    }
  }, [token]);

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
        fetch("/api/cafeteria").then(res => res.json()),
        fetch("/api/kwNotice").then(res => res.json())
      ]);

      setCafeteria(cafeteriaData.weeklyMenu);
      setKWNotice(kwNoticeData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchLectureNotices = async () => {
    try {
      const response = await fetch("/api/lectureNotice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await response.json();
      setNotices(data.notices);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching lecture notices:', error);
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
    const currentDay = new Date().getDay() - 1;
    if (currentDay === 5 || currentDay === 6) {
      setStatusText("오늘 수업이 없어요 😊");
      setShowButtons(false);
      return;
    }

    const currentTime = new Date().getHours() + new Date().getMinutes() / 60;
    const today = Object.values(data).flatMap(classes =>
      classes.filter(c => c.day === currentDay)
    );

    const ongoingClass = today.find(c => {
      const [startHour, startMinute] = c.startTime.split(":").map(Number);
      const [endHour, endMinute] = c.endTime.split(":").map(Number);
      const startTime = startHour + startMinute / 60;
      const endTime = endHour + endMinute / 60;
      return startTime <= currentTime && currentTime < endTime;
    });

    if (ongoingClass) {
      updateOngoingClassStatus(ongoingClass);
    } else {
      updateUpcomingClassStatus(today, currentTime);
    }
  };

  const updateOngoingClassStatus = (ongoingClass) => {
    const [endHour, endMinute] = ongoingClass.endTime.split(":").map(Number);
    setStatusText(`<span style="opacity: 0.6">지금은</span><br/>${ongoingClass.title} <span style="opacity: 0.6">수업 중</span>
    <br/>
    <span style="opacity: 0.6; font-size:14px;">${endHour}:${endMinute.toString().padStart(2, '0')}에 종료</span>`);
    setSelectedSubj(ongoingClass.subj);
    setSelectedSubjName(ongoingClass.title);
    setShowButtons(true);
  };

  const updateUpcomingClassStatus = (today, currentTime) => {
    const upcomingClass = today.find(c => {
      const [startHour, startMinute] = c.startTime.split(":").map(Number);
      return startHour + startMinute / 60 > currentTime;
    });

    if (upcomingClass) {
      const [startHour, startMinute] = upcomingClass.startTime.split(":").map(Number);
      setStatusText(`${startHour}:${startMinute.toString().padStart(2, '0')}<span style="opacity: 0.6">에</span><br/> ${upcomingClass.title} <span style="opacity: 0.6">수업이 있어요.</span>
      <br/>
      <span style="opacity: 0.6; font-size:14px;">${upcomingClass.info} 교수</span>`);
      setSelectedSubj(upcomingClass.subj);
      setSelectedSubjName(upcomingClass.title);
      setShowButtons(true);
    } else if (today.length > 0) {
      setStatusText("오늘 수업이 더 이상 없어요 😎");
      setShowButtons(false);
    } else {
      setStatusText("오늘 수업이 없어요 😊");
      setShowButtons(false);
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
      <br />

      <AppVersion updater={true} />

      <h3><span className='tossface'>⏰</span> 잊지 말고 챙겨볼까요?</h3>

      {showToggle && (
        <>
          <Spacer y={5} />
          <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '5px', fontSize: '14px', opacity: .6 }}>
            <input type="checkbox" id="toggle" checked={excludeNotStarted} onChange={handleToggleChange} style={{ width: 'fit-content' }} />
            <label htmlFor="toggle" style={{ width: 'fit-content' }}>아직 시작하지 않은 항목 제외</label>
          </div>
        </>
      )}
      <Spacer y={15} />
      <div id="remaining-deadline">
        {filteredDeadlines.length === 0 ? (<span style={{ opacity: .5 }}>남아있는 강의 및 과제가 없습니다!</span>) : (
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
        )}
      </div>

      <Spacer y={30} />
      <h3>강의 알림</h3>
      <br />
      <LectureNotices notices={notices} loading={loading} />
      <br /> <br />

      <h3>
        오늘의 학식
        <button onClick={() => Android.openPage('https://www.kw.ac.kr/ko/life/facility11.jsp')} style={{ float: "right", width: 'fit-content', marginTop: '-5px' }}>
          <IonIcon name='add-outline' />
        </button>
      </h3>
      <br />
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
      <br /> <br />

      <h3>
        학사 공지사항
        <button onClick={() => Android.openPage('https://www.kw.ac.kr/ko/life/notice.jsp?srCategoryId=1')} style={{ float: "right", width: 'fit-content', marginTop: '-5px' }}>
          <IonIcon name='add-outline' />
        </button>
      </h3>
      <br />
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