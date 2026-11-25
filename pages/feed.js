import { hasKlasSession } from '../lib/core/nativeApp';
import { setSearchSession } from '../lib/search/session';
import KlasNativeBridge from '../lib/core/klasNativeBridge';
import React, { useState, useEffect } from 'react';
import TodaysCafeteriaMenu from '../components/feed/TodaysCafeteria';
import IonIcon from '@reacticons/ionicons';
import { getStoredData, setStoredData } from '../lib/core/storageUtils';
import LectureNotices from '../components/lecture/lectureNotices';
import Spacer from '../components/common/spacer';
import toast, { Toaster } from 'react-hot-toast';
import { KLAS } from '../lib/core/klas';
import Header from '../components/common/header';
import { useTimetableStatus } from '../lib/timetable/useTimetableStatus';
import { useDeadlines } from '../lib/calendar/useDeadlines';
import { initializePullToRefresh } from '../lib/pullToRefreshUtils';
import Card from '../components/common/Card';
import CurrentStatus from '../components/feed/CurrentStatus';
import FeedDeadlines from '../components/feed/FeedDeadlines';
import { Skeleton, SkeletonBox, SkulletProvider } from 'skullet/react';
import { SkeletonLayouts } from '../components/common/Skeleton';
import NoticeTabs from '../components/feed/NoticeTabs';
import NoticeList from '../components/feed/NoticeList';
import AdvisorInfo from '../components/feed/AdvisorInfo';
import CampusMapSheet from '../components/common/CampusMapSheet';
import Logo from '../components/common/Logo';
import { identifyUser } from '../lib/core/analytics';

const SEMESTER_SCHEDULE = [
  { yearHakgi: '2025,2', start: new Date(2025, 8, 1), end: new Date(2025, 11, 19) },
  { yearHakgi: '2025,4', start: new Date(2025, 11, 22), end: new Date(2026, 0, 14) },
  { yearHakgi: '2026,1', start: new Date(2026, 2, 3), end: new Date(2026, 5, 22) },
  { yearHakgi: '2026,3', start: new Date(2026, 5, 23), end: new Date(2026, 6, 13) },
  { yearHakgi: '2026,2', start: new Date(2026, 8, 1), end: new Date(2026, 11, 21) }
];

const statusPlaceholder = (
  <div className="feed-status-sample">
    <SkeletonBox width="32%" height={18} />
    <SkeletonBox width="64%" height={18} />
    <SkeletonBox width="38%" height={14} />
    <SkeletonBox width={152} height={36} radius="12px" />
  </div>
);

const NO_COURSE_STATUS_TEXT = '지금은 선택된<br/>학기 중이 아니에요.';
const NO_SEMESTER_STATUS_TEXT = '현재 진행중인<br/>학기가 없어요.';

const getCurrentSemesterYearHakgi = (today = new Date()) => {
  const currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const matched = SEMESTER_SCHEDULE.find(({ start, end }) => currentDate >= start && currentDate <= end);
  return matched ? matched.yearHakgi : null;
};

export default function Feed() {
  const [yearHakgi] = useState(() => {
    if (typeof window === 'undefined') return null;
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('yearHakgi') || localStorage.getItem('currentYearHakgi');
  });
  const [token, setToken] = useState(null);
  const [cafeteria, setCafeteria] = useState(null);
  const [kwNotice, setKWNotice] = useState(null);
  const [advisor, setAdvisor] = useState(null);
  const [kwNoticeTab, setKwNoticeTab] = useState("");
  const [mapSheetOpen, setMapSheetOpen] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState(null);

  const {
    statusText,
    selectedSubj,
    selectedSubjName,
    showClassActions,
    setTimetableData
  } = useTimetableStatus();

  const {
    filteredDeadlines,
    excludeNotStarted,
    showToggle,
    processAndSetDeadlines,
    handleToggleChange
  } = useDeadlines();

  const currentSemesterYearHakgi = getCurrentSemesterYearHakgi();
  const isSemesterMismatch = Boolean(currentSemesterYearHakgi && yearHakgi && currentSemesterYearHakgi !== yearHakgi);
  const isNoSemester = !currentSemesterYearHakgi;

  let displayedStatusText;
  if (isNoSemester) {
    displayedStatusText = NO_SEMESTER_STATUS_TEXT;
  } else if (isSemesterMismatch) {
    displayedStatusText = NO_COURSE_STATUS_TEXT;
  } else {
    displayedStatusText = statusText;
  }

  const canShowClassActions = (isSemesterMismatch || isNoSemester) ? false : showClassActions;
  const displayedSelectedSubj = (isSemesterMismatch || isNoSemester) ? null : selectedSubj;
  const displayedSelectedSubjName = (isSemesterMismatch || isNoSemester) ? null : selectedSubjName;
  const isNoCourseStatus = (isSemesterMismatch || isNoSemester);

  useEffect(() => {
    setupWindowFunctions();
    try { KlasNativeBridge.completePageLoad() } catch (error) { console.log('not app') }
    fetchData();

    // 더미데이터
    if (process.env.NEXT_PUBLIC_DEVELOPMENT == 'true') {
      const dummyDeadlines = [
        {
          name: '광운인되기',
          subj: 'CS101',
          onlineLecture: [{ hourGap: 10, startDate: '2026-06-05' }],
          task: [],
          teamTask: []
        },
        {
          name: '광운인졸업하기',
          subj: 'MA102',
          onlineLecture: [{ hourGap: 152, startDate: null }],
          task: [{ hourGap: 60, startDate: null }],
          teamTask: [{ hourGap: 0, startDate: null }]
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
    if (!hasKlasSession(token)) return;
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
      if (!buildingName) return;
      setSelectedBuilding(buildingName);
      setMapSheetOpen(true);
    }

    window.receiveToken = (receivedToken) => {
      if (hasKlasSession(receivedToken)) {
        setSearchSession(receivedToken);
        if (receivedToken) setToken(receivedToken);
        KLAS("https://klas.kw.ac.kr/std/cps/inqire/AtnlcScreHakjukInfo.do", receivedToken)
          .then((data) => {
            if (data && data.hakbun) {
              localStorage.setItem('klasplus_lastSessionID', data.hakbun);
              identifyUser(data.hakbun);
            }
          })
          .catch((error) => {
            console.error('Error fetching hakbun:', error);
          });
      }
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
    <>
      <div className="feed-page" style={{ padding: '5px' }}>
        <Toaster position="top-center" />
        <Header title={<Logo size={40} />} />
        <div className='pull-to-swipe-area'>
          <SkulletProvider reveal="together">
            <Skeleton
              loading={!displayedStatusText}
              skeleton={statusPlaceholder}
              label="수업 상태 불러오는 중"
            >
              {displayedStatusText && (
                <CurrentStatus
                  statusText={displayedStatusText}
                  showClassActions={canShowClassActions}
                  isNoCourse={isNoCourseStatus}
                  selectedSubj={displayedSelectedSubj}
                  selectedSubjName={displayedSelectedSubjName}
                />
              )}
            </Skeleton>

            <Spacer y={25} />
            <FeedDeadlines
              items={filteredDeadlines}
              showToggle={showToggle}
              excludeNotStarted={excludeNotStarted}
              onToggle={handleToggleChange}
              yearHakgi={yearHakgi}
            />
          </SkulletProvider>

          <Spacer y={20} />
          <div className="feed-bottom-layout">
            <div className="area-lecture">
              <LectureNotices token={token} />
            </div>

            <div className="area-cafeteria">
              <Card
                title={
                  <span
                    style={{ display: 'flex', alignItems: 'center' }}
                    onClick={() => KlasNativeBridge.openPage('https://www.kw.ac.kr/ko/life/facility11.jsp')}
                  >
                    학식 <IonIcon name="chevron-forward" />
                  </span>}
                isAnimated={false}
                style={{ paddingBottom: '0.1em' }}
              >
                {!cafeteria ? (
                  <SkeletonLayouts.CafeteriaInfo />
                ) : (
                  <TodaysCafeteriaMenu data={cafeteria} />
                )}
              </Card>
            </div>

            <div className="area-notices">
              <Card
                isAnimated={false}
                id="notices"
                style={{ paddingBottom: '20px', position: 'relative', height: '100%' }}
                title={
                  <span
                    style={{ display: 'flex', alignItems: 'center' }}
                    onClick={() => KlasNativeBridge.openPage('https://www.kw.ac.kr/ko/life/notice.jsp?srCategoryId=&mode=list&searchKey=1&searchVal=')}
                  >
                    학교 공지사항 <IonIcon name="chevron-forward" />
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
            </div>

            <div className="area-advisor">
              <AdvisorInfo
                advisor={advisor}
                isLoading={!advisor && token}
              />
            </div>
          </div>

          <br /> <br />
          <br />
          <Spacer y={30} />
        </div>
      </div>
      <CampusMapSheet
        open={mapSheetOpen}
        buildingName={selectedBuilding}
        onClose={() => setMapSheetOpen(false)}
      />
    </>
  );
}
