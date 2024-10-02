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

    let excludeNotStartedTemp = false;
    try {
      const savedValue = localStorage.getItem('excludeNotStarted');
      if (savedValue !== null) {
        setExcludeNotStarted(JSON.parse(savedValue));
        excludeNotStartedTemp = JSON.parse(savedValue);
      }
    } catch (error) {
      console.warn('Localstorage is not available.');
    }

    window.receiveDeadlineData = function (json) {
      let data = JSON.parse(json);

      const hasStartDate = data.some(item =>
        item.onlineLecture.some(lecture => lecture.startDate) ||
        item.task.some(task => task.startDate) ||
        item.teamTask.some(teamTask => teamTask.startDate)
      );
      setShowToggle(hasStartDate);

      setDeadlines(data);
      filterDeadlines(data, excludeNotStartedTemp);
    };

    window.receiveTimetableData = function (json) {
      const data = JSON.parse(json);
      setTimetable(data);
      updateTimetableStatus(data);
    };

    window.receiveToken = function (receivedToken) {
      if (!receivedToken) return;
      setToken(receivedToken);
    };

    Android.completePageLoad();

    fetch("/api/cafeteria", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setCafeteria(data.weeklyMenu);
      })
      .catch((error) => {
        console.error(error);
      });

    fetch("/api/kwNotice", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setKWNotice(data);
      })
      .catch((error) => {
        console.error(error);
      });

    return () => {
      delete window.receiveDeadlineData;
      delete window.receiveNoticeData;
      delete window.receiveTimetableData;
    };
  }, []);

  useEffect(() => {
    if (!token) return;
    fetch("/api/lectureNotice", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    })
      .then((response) => response.json())
      .then((data) => {
        setNotices(data.notices);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [token]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (timetable) {
        updateTimetableStatus(timetable);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [timetable]);

  const filterDeadlines = (data, excludeUnstarted) => {
    if (excludeUnstarted) {
      const now = new Date();
      data = data.map(course => ({
        ...course,
        onlineLecture: course.onlineLecture.filter(lecture => {
          if (!lecture.startDate) return true;
          const startDate = new Date(lecture.startDate);
          return startDate <= now;
        }),
        task: course.task.filter(task => {
          if (!task.startDate) return true;
          const startDate = new Date(task.startDate);
          return startDate <= now;
        }),
        teamTask: course.teamTask.filter(teamTask => {
          if (!teamTask.startDate) return true;
          const startDate = new Date(teamTask.startDate);
          return startDate <= now;
        })
      }));
    }

    // 미완료 항목이 없는 항목 제외
    data = data.filter(item => (item.onlineLecture.length > 0 || item.task.length > 0 || item.teamTask.length > 0));

    // 마감 기한 빠른 순으로 정렬
    data = data.map(course => ({
      ...course,
      onlineLecture: [...course.onlineLecture].sort((a, b) => a.hourGap - b.hourGap),
      task: [...course.task].sort((a, b) => a.hourGap - b.hourGap),
      teamTask: [...course.teamTask].sort((a, b) => a.hourGap - b.hourGap)
    }));

    setFilteredDeadlines(data);
  };

  const handleToggleChange = () => {
    const checked = !excludeNotStarted;
    try {
      localStorage.setItem('excludeNotStarted', JSON.stringify(checked));
    } catch (error) {
      console.warn('Localstorage is not available.');
    }
    setExcludeNotStarted(checked);
    filterDeadlines(deadlines, checked);
  };

  const createContent = (name, data) => {
    if (data.length === 0) return '';

    const info = {
      totalCount: data.length,
      remainingTime: data[0].hourGap
    };

    if (info.remainingTime === Infinity) {
      return `<span style="color: var(--green)" class="remain-none">남아있는 ${name}가 없습니다!</span>`;
    }

    const remainingDay = Math.floor(info.remainingTime / 24);
    const remainingHour = info.remainingTime % 24;

    if (remainingDay === 0) {
      if (remainingHour === 0) {
        return `<span class="will-remain"><b style="font-size: 20px">D-DAY</b> ${name} 총 ${info.totalCount}개
        <svg style="width:15px;margin-left:-7px" xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="48" d="M184 112l144 144-144 144"/></svg>
        </span>`;
      } else {
        return `<span class="will-remain"><b style="font-size: 20px">D-DAY</b> ${name} 총 ${info.totalCount}개
        <svg style="width:15px;margin-left:-7px" xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="48" d="M184 112l144 144-144 144"/></svg>
        </span>`;
      }
    } else if (remainingDay === 1) {
      return `<span class="will-remain"><b style="font-size: 20px">D-1</b> ${name} 총 ${info.totalCount}개
      <svg style="width:15px;margin-left:-7px" xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="48" d="M184 112l144 144-144 144"/></svg>
      </span>`;
    } else {
      return `<span class="will-remain"><b style="font-size: 20px">D-${remainingDay}</b> ${name} 총 ${info.totalCount}개
      <svg style="width:15px;margin-left:-7px" xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="48" d="M184 112l144 144-144 144"/></svg>
      </span>`;
    }
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

  return (
    <div style={{ padding: '5px' }}>

      <AppVersion updater={true} />

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
      <br /><br />

      <h3><span className='tossface'>⏰</span> 잊지 말고 챙겨볼까요?</h3>

      {showToggle && (
        <>
          <Spacer y={10} />
          <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '5px', fontSize: '14px', opacity: .6 }}>
            <input type="checkbox" id="toggle" checked={excludeNotStarted} onChange={handleToggleChange} style={{ width: 'fit-content' }} />
            <label htmlFor="toggle" style={{ width: 'fit-content' }}>아직 시작하지 않은 항목 제외</label>
          </div>
        </>
      )}
      <Spacer y={15} />
      <div id="remaining-deadline">
        {filteredDeadlines.length === 0 ? (<span style={{ opacity: .5 }}>남아있는 강의 및 과제가 없습니다!</span>) : ''}
        {filteredDeadlines.map((item, index) => (
          <div key={index} className={`card ${item.onlineLecture.length > 0 ? (item.onlineLecture[0].hourGap <= 24 ? 'red' : item.onlineLecture[0].hourGap <= 72 ? 'yellow' : 'green') :
            item.task.length > 0 ? (item.task[0].hourGap <= 24 ? 'red' : item.task[0].hourGap <= 72 ? 'yellow' : 'green') :
              item.teamTask.length > 0 ? (item.teamTask[0].hourGap <= 24 ? 'red' : item.teamTask[0].hourGap <= 72 ? 'yellow' : 'green') : ''}`}>

            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignContent: 'center' }}>
              <b style={{ fontSize: '15px' }}>{item.name}</b>
              <div style={{ position: 'relative', top: '-8px', right: '-5px' }}>
                <button style={{ width: 'fit-content', background: 'var(--background)', fontSize: '12px', padding: '8px 10px' }}
                  onClick={() => typeof Android !== 'undefined' && Android.openLectureActivity(item.subj, item.name)}>강의 홈</button>
              </div>
            </div>

            <Spacer y={5} />
            <div onClick={() => typeof Android !== 'undefined' && Android.evaluate('/std/lis/evltn/OnlineCntntsStdPage.do', yearHakgi, item.subj)} dangerouslySetInnerHTML={{ __html: createContent('온라인 강의', item.onlineLecture) }}></div>
            <div onClick={() => typeof Android !== 'undefined' && Android.evaluate('/std/lis/evltn/TaskStdPage.do', yearHakgi, item.subj)} dangerouslySetInnerHTML={{ __html: createContent('과제', item.task) }}></div>
            <div onClick={() => typeof Android !== 'undefined' && Android.evaluate('/std/lis/evltn/PrjctStdPage.do', yearHakgi, item.subj)} dangerouslySetInnerHTML={{ __html: createContent('팀 프로젝트', item.teamTask) }}></div>
          </div>
        ))}
      </div>
      <div style={{ height: '30px' }}></div>
      <h3>강의 알림</h3>
      <br />
      <LectureNotices notices={notices} loading={loading} />
      <br /> <br />


      <h3>오늘의 학식<button onClick={() => Android.openPage('https://www.kw.ac.kr/ko/life/facility11.jsp')} style={{ float: "right", width: 'fit-content', marginTop: '-5px' }}><IonIcon name='add-outline' /></button></h3>
      <br />
      <div className="card non-anim" style={{ paddingTop: '1.5em', paddingBottom: '0.1em' }}>
        {!cafeteria && <>
          <div className="skeleton" style={{ height: '20px', width: '30%', marginBottom: '10px', marginTop: '-10px' }} />
          <div className="skeleton" style={{ height: '20px', width: '50%', marginBottom: '10px' }} />
          <div className="skeleton" style={{ height: '20px', width: '40%', marginBottom: '10px' }} />
          <div className="skeleton" style={{ height: '20px', width: '70%', marginBottom: '20px' }} />
        </>}

        {cafeteria && <TodaysCafeteriaMenu weeklyMenu={cafeteria} />}
      </div>
      <br /> <br />

      <h3>학사 공지사항<button onClick={() => Android.openPage('https://www.kw.ac.kr/ko/life/notice.jsp?srCategoryId=1')} style={{ float: "right", width: 'fit-content', marginTop: '-5px' }}><IonIcon name='add-outline' /></button></h3>
      <br />
      {kwNotice &&
        <div className="card non-anim" id="notices" style={{ paddingBottom: '20px' }}>
          {!kwNotice && <>
            <div className="skeleton" style={{ height: '50px', width: '100%', marginBottom: '15px' }} />
            <div className="skeleton" style={{ height: '50px', width: '100%', marginBottom: '15px' }} />
            <div className="skeleton" style={{ height: '50px', width: '100%' }} />
          </>}
          {kwNotice && kwNotice.length === 0 ? (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', justifyContent: 'center', opacity: '.5' }}>
              <span>최근 공지사항이 없습니다!</span>
            </div>
          ) : (
            kwNotice.slice(0, 6).map((notice, index) => {
              return (
                <div key={index} className="notice-item" onClick={() => Android.openPage(`${notice.link}`)}>
                  <span><b>{notice.title.replace("신규게시글", "").replace("Attachment", "")}</b></span><br />
                  <span style={{ opacity: 0.6, fontSize: '12px' }}>{notice.createdDate} · {notice.author}</span>
                  {index != 5 && <hr style={{ opacity: 0.3 }} />}
                </div>
              );
            })
          )}
        </div>
      }
      <br /> <br />
      <br />
    </div>

  );
}