import React, { useState, useEffect } from 'react';
import TodaysCafeteriaMenu from '../components/feed/TodaysCafeteria';
import IonIcon from '@reacticons/ionicons';
import AppVersion from '../components/common/appVersion';
import { getStoredData, setStoredData } from '../lib/core/storageUtils';
import LectureNotices from '../components/lecture/lectureNotices';
import Spacer from '../components/common/spacer';
import Adfit from '../components/common/adfit';
import toast, { Toaster } from 'react-hot-toast';
import { KLAS } from '../lib/core/klas';
import Image from 'next/image';
import Header from '../components/common/header';
import dynamic from 'next/dynamic';
import { BUILDING_MAP_URLS, KW_NOTICE_CATEGORIES } from '../lib/core/constants';
import { openExternalLink, openKlasPage, evaluateKlasPage, openLectureActivity } from '../lib/core/androidBridge';
import { useTimetableStatus } from '../lib/timetable/useTimetableStatus';
import { useDeadlines } from '../lib/calendar/useDeadlines';
import { initializePullToRefresh } from '../lib/pullToRefreshUtils';
import Card from '../components/common/Card';
import CurrentStatus from '../components/feed/CurrentStatus';
import ToggleSwitch from '../components/common/ToggleSwitch';
import DeadlineContent from '../components/calendar/DeadlineContent';
import { SkeletonLayouts } from '../components/common/Skeleton';
import NoticeTabs from '../components/feed/NoticeTabs';
import NoticeList from '../components/feed/NoticeList';
import AdvisorInfo from '../components/feed/AdvisorInfo';

const AdSense = dynamic(() => import('../components/common/adSense'), { ssr: false });

const SEMESTER_SCHEDULE = [
  { yearHakgi: '2025,2', start: new Date(2025, 8, 1), end: new Date(2025, 11, 19) },
  { yearHakgi: '2025,4', start: new Date(2025, 11, 22), end: new Date(2026, 0, 14) },
  { yearHakgi: '2026,1', start: new Date(2026, 2, 3), end: new Date(2026, 5, 22) },
  { yearHakgi: '2026,3', start: new Date(2026, 5, 23), end: new Date(2026, 6, 13) }
];

const NO_COURSE_STATUS_TEXT = '지금은 선택된<br/>학기 중이 아니에요.';

const getCurrentSemesterYearHakgi = (today = new Date()) => {
  const currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const matched = SEMESTER_SCHEDULE.find(({ start, end }) => currentDate >= start && currentDate <= end);
  return matched ? matched.yearHakgi : null;
};

export default function Feed() {
  const [yearHakgi, setYearHakgi] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cafeteria, setCafeteria] = useState(null);
  const [kwNotice, setKWNotice] = useState(null);
  const [advisor, setAdvisor] = useState(null);
  const [kwNoticeTab, setKwNoticeTab] = useState("");

  const {
    timetable,
    statusText,
    selectedSubj,
    selectedSubjName,
    showClassActions,
    setTimetableData
  } = useTimetableStatus();

  const {
    deadlines,
    filteredDeadlines,
    excludeNotStarted,
    showToggle,
    processAndSetDeadlines,
    handleToggleChange
  } = useDeadlines();

  const currentSemesterYearHakgi = getCurrentSemesterYearHakgi();
  const isSemesterMismatch = Boolean(currentSemesterYearHakgi && yearHakgi && currentSemesterYearHakgi !== yearHakgi);
  const displayedStatusText = isSemesterMismatch ? NO_COURSE_STATUS_TEXT : statusText;
  const canShowClassActions = isSemesterMismatch ? false : showClassActions;
  const displayedSelectedSubj = isSemesterMismatch ? null : selectedSubj;
  const displayedSelectedSubjName = isSemesterMismatch ? null : selectedSubjName;
  const isNoCourseStatus = displayedStatusText === NO_COURSE_STATUS_TEXT;

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const yearHakgi = urlParams.get('yearHakgi');
    setYearHakgi(yearHakgi);

    setupWindowFunctions();
    fetchData();

    // 더미데이터
    if (process.env.NEXT_PUBLIC_DEVELOPMENT === 'true') {
      const dummyDeadlines = [
        {
          name: '광운인되기',
          subj: 'CS101',
          onlineLecture: [{ hourGap: 10, startDate: null }],
          task: [],
          teamTask: []
        },
        {
          name: '광운인졸업하기',
          subj: 'MA102',
          onlineLecture: [{ hourGap: 152, startDate: null }],
          task: [{ hourGap: 60, startDate: null }],
          teamTask: [{ hourGap: 20, startDate: null }]
        }
      ];
      window.receiveDeadlineData(JSON.stringify(dummyDeadlines));

      const dummyTimetable = {
        0: [
          { day: 0, title: '알고리즘', subj: 'CS101', startTime: '00:00', endTime: '24:00', info: 'Prof. X' }
        ],
        1: [{ day: 1, title: '알고리즘', subj: 'CS101', startTime: '00:00', endTime: '24:00', info: 'Prof. X' }], 2: [{ day: 2, title: '알고리즘', subj: 'CS101', startTime: '12:00', endTime: '24:00', info: '비401/김광운' }], 3: [{ day: 3, title: '알고리즘', subj: 'CS101', startTime: '00:00', endTime: '24:00', info: '비401/김광운' }], 4: [{ day: 4, title: '알고리즘', subj: 'CS101', startTime: '00:00', endTime: '24:00', info: 'Prof. X' }], 5: [{ day: 5, title: '알고리즘', subj: 'CS101', startTime: '00:00', endTime: '24:00', info: 'Prof. X' }], 6: [{ day: 6, title: '알고리즘', subj: 'CS101', startTime: '00:00', endTime: '24:00', info: 'Prof. X' }]
      };
      window.receiveTimetableData(JSON.stringify(dummyTimetable));
    }

    const pullToRefresh = initializePullToRefresh();

    return () => {
      pullToRefresh.destroy();
      delete window.receiveDeadlineData;
      delete window.receiveNoticeData;
      delete window.receiveTimetableData;
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    KLAS("https://klas.kw.ac.kr/std/cmn/frame/StdHome.do", token, { searchYearhakgi: yearHakgi })
      .then((data) => {
        setAdvisor(data.rspnsblProfsr);
      })
      .catch((error) => {
        console.error('Error fetching advisor:', error);
      });
  }, [token, yearHakgi]);

  const setupWindowFunctions = () => {
    window.receiveDeadlineData = (json) => {
      processAndSetDeadlines(JSON.parse(json));
    };

    window.receiveTimetableData = (json) => {
      setTimetableData(JSON.parse(json));
    };

    window.openBuildingMap = (buildingName) => {
      const mapUrl = BUILDING_MAP_URLS[buildingName];
      if (mapUrl) {
        openExternalLink(mapUrl);
      }
    }

    window.receiveToken = (receivedToken) => {
      if (receivedToken) setToken(receivedToken);
    };
  };

  const fetchData = async () => {
    try {
      const CACHE_KEY = 'cafeteriaData';
      const cachedData = getStoredData(CACHE_KEY);
      const now = new Date();
      const isCacheValid = cachedData && new Date().getTime() < cachedData.expiresAt;

      let cafeteriaData;
      if (isCacheValid) {
        cafeteriaData = cachedData.data;
      } else {
        const response = await fetch("/api/crawler/cafeteria");
        cafeteriaData = await response.json();

        const sunday = new Date(now);
        sunday.setDate(now.getDate() + (7 - now.getDay()));
        sunday.setHours(23, 59, 59, 999);

        setStoredData(CACHE_KEY, {
          data: cafeteriaData,
          expiresAt: sunday.getTime()
        });
      }

      const [_, kwNoticeData] = await Promise.all([
        Promise.resolve(cafeteriaData),
        fetch("/api/crawler/kwNotice?srCategoryId=" + kwNoticeTab).then(res => res.json())
      ]);

      setCafeteria(cafeteriaData);
      setKWNotice(kwNoticeData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    if (kwNoticeTab != null) {
      setKWNotice(null);
      fetchData();
    }
  }, [kwNoticeTab]);


  return (
    <div style={{ padding: '5px' }}>
      <Toaster position="top-center" />
      <Header title={<Image src="/klasplus_icon_foreground_red.png" alt="Logo" width={40} height={40} style={{ borderRadius: '50%', marginLeft: '-5px' }} />} />

      <div className='pull-to-swipe-area'>
        <CurrentStatus
          statusText={displayedStatusText}
          showClassActions={canShowClassActions}
          isNoCourse={isNoCourseStatus}
          selectedSubj={displayedSelectedSubj}
          selectedSubjName={displayedSelectedSubjName}
        />

        <Spacer y={10} />

        {process.env.NEXT_PUBLIC_NOTICE_TEXT && (<>
          <Card
            style={{ padding: '15px' }}
            onClick={() => {
              try {
                Android.openExternalPage("https://blog.klasplus.yuntae.in")
              } catch (e) {
                toast('앱을 최신버전으로 업데이트 해주세요');
              }
            }}
          >
            <div style={{ width: '100%', display: 'flex', alignContent: 'center', gap: '5px' }}>
              <IonIcon name="notifications" style={{ opacity: .7 }} />
              <b style={{ fontSize: '14px', position: 'relative', top: '1px' }}>{process.env.NEXT_PUBLIC_NOTICE_TEXT}</b>
              <IonIcon name="chevron-forward-outline" />
            </div>
          </Card>
          <Spacer y={20} />
        </>
        )}

        {showToggle && (
          <>
            <Spacer y={5} />
            <ToggleSwitch
              label="아직 시작일이 되지 않은 항목 숨기기"
              checked={excludeNotStarted}
              onChange={handleToggleChange}
              id="exclude-not-started"
            />
          </>
        )}

        <Spacer y={15} />
        <div id="remaining-deadline">
          {filteredDeadlines ? (
            filteredDeadlines.length === 0 ? (
              <Card title="남은 할 일" isAnimated={false} id="notices" style={{ paddingBottom: '30px' }}>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', justifyContent: 'center', marginTop: '10px', opacity: '.3' }}>
                  <IonIcon name="checkmark-circle" style={{ fontSize: '50px', marginBottom: '5px' }} />
                  <span>할 일을 모두 끝냈어요!</span>
                </div>
              </Card>
            ) : (
              filteredDeadlines.map((item, index) => (
                <Card key={index} style={{ paddingBottom: '15px' }}>
                  <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', margin: '-5px -5px 0 0' }}>
                    <b style={{ fontSize: '15px' }}>{item.name}</b>
                    <div style={{ position: 'relative', top: '-8px', right: '-5px' }}>
                      <button
                        style={{ width: 'fit-content', background: 'var(--background)', fontSize: '12px', padding: '8px 10px' }}
                        onClick={() => openLectureActivity(item.subj, item.name)}
                      >
                        강의 홈
                      </button>
                    </div>
                  </div>

                  <div onClick={() => evaluateKlasPage('/std/lis/evltn/OnlineCntntsStdPage.do', yearHakgi, item.subj)}>
                    <DeadlineContent name="온라인 강의" data={item.onlineLecture} />
                  </div>
                  <div onClick={() => evaluateKlasPage('/std/lis/evltn/TaskStdPage.do', yearHakgi, item.subj)}>
                    <DeadlineContent name="과제" data={item.task} />
                  </div>
                  <div onClick={() => evaluateKlasPage('/std/lis/evltn/PrjctStdPage.do', yearHakgi, item.subj)}>
                    <DeadlineContent name="팀 프로젝트" data={item.teamTask} />
                  </div>
                </Card>
              ))
            )
          ) : (
            <SkeletonLayouts.DeadlineList />
          )}
        </div>

        <LectureNotices token={token} />

        <Spacer y={20} />

        <Card
          title="오늘의 학식"
          isAnimated={false}
          style={{ paddingBottom: '0.1em' }}
          actionButton={
            <button onClick={() => openKlasPage('https://www.kw.ac.kr/ko/life/facility11.jsp')} style={{ float: "right", width: 'fit-content', marginTop: '-12px' }}>
              <IonIcon name='add-outline' />
            </button>
          }
        >
          {!cafeteria ? (
            <SkeletonLayouts.CafeteriaInfo />
          ) : (
            <TodaysCafeteriaMenu data={cafeteria} />
          )}
        </Card>
        <Spacer y={20} />

        <Card
          isAnimated={false}
          id="notices"
          style={{ paddingBottom: '20px', position: 'relative' }}
          title={
            <span
              style={{ display: 'flex', alignItems: 'center', fontWeight: 600 }}
              onClick={() => openKlasPage('https://www.kw.ac.kr/ko/life/notice.jsp?srCategoryId=&mode=list&searchKey=1&searchVal=')}
            >
              공지사항 <IonIcon name="chevron-forward" />
            </span>
          }
        >
          <NoticeTabs
            activeTab={kwNoticeTab}
            onTabChange={setKwNoticeTab}
          />
          <NoticeList
            notices={kwNotice}
            isLoading={!kwNotice}
          />
        </Card>

        <Spacer y={20} />

        <AdvisorInfo
          advisor={advisor}
          isLoading={!advisor && token}
        />

        <br /> <br />
        <br />
      </div>
    </div>
  );
}
