import { useState, useEffect } from "react";
import IonIcon from '@reacticons/ionicons';
import handleCalculateGPA, { calculateGPA } from "./utils/calculateGPA";
import AppVersion from "./components/appVersion";
import Spacer from "./components/spacer";
import { BottomSheet } from 'react-spring-bottom-sheet';
import 'react-spring-bottom-sheet/dist/style.css';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

export default function Home() {
  const [data, setData] = useState(null);
  const [token, setToken] = useState("");
  const [grade, setGrade] = useState(null);
  const [synthesisGPAs, setSynthesisGPAs] = useState();
  const [totGrade, setTotGrade] = useState();
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpenSettingsModal, setIsOpenSettingsModal] = useState(false);
  const [hideGrades, setHideGrades] = useState(false);
  const [showGrades, setShowGrades] = useState(true);
  const [menuOrder, setMenuOrder] = useState([]);

  useEffect(() => {
    window.receiveToken = function (receivedToken) {
      if (!receivedToken) return;
      setToken(receivedToken);
    };

    Android.completePageLoad();

    const savedHideGrades = localStorage.getItem('hideGrades');
    if (savedHideGrades !== null) {
      const parsedHideGrades = savedHideGrades === 'true';
      setHideGrades(parsedHideGrades);
      setShowGrades(!parsedHideGrades);
    }

    const savedMenuOrder = localStorage.getItem('menuOrder');
    if (savedMenuOrder) {
      setMenuOrder(JSON.parse(savedMenuOrder));
    } else {
      setMenuOrder(menuItems.map(item => item.title));
    }
  }, [])

  useEffect(() => {
    if (!token) return;

    fetch("/api/profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    })
      .then((response) => response.json())
      .then((data) => {
        setData(data);
      })
      .catch((error) => {
        console.error(error);
      });

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
  }, [token]);

  useEffect(() => {
    if (!grade) return;

    const getData = async () => {
      const semesters = await handleCalculateGPA(grade)
      const synthesisGPAs = await calculateGPA(semesters)
      setSynthesisGPAs(synthesisGPAs);
    }

    getData();
  }, [grade]);


  useEffect(() => {
    if (!synthesisGPAs) return;
    const tot = synthesisGPAs.find(semester => semester.name === '전체 학기');
    setTotGrade(tot)
  }, [synthesisGPAs]);

  useEffect(() => {
    localStorage.setItem('hideGrades', hideGrades.toString());
  }, [hideGrades]);


  const handleHideGradesChange = (e) => {
    const checked = e.target.checked;
    setHideGrades(checked);
    setShowGrades(!checked);
  };

  const handleGradeClick = () => {
    if (hideGrades) {
      setShowGrades(true);
    }
  };

  const menuItems = [
    {
      title: "수강관리",
      items: [
        { name: "수업시간표", icon: "📅", url: "https://klas.kw.ac.kr/std/cps/atnlc/TimetableStdPage.do" },
        { name: "출석관리(KW출첵)", icon: "✅", url: "https://klas.kw.ac.kr/std/ads/admst/KwAttendStdPage.do" },
        { name: "강의계획서 조회", icon: "📚", url: "https://klasplus.yuntae.in/searchLecturePlan", badge: "KLAS+" },
        { name: "수강신청 프로그램", icon: "🖥️", url: "https://klas.kw.ac.kr/std/cps/atnlc/LctreReqstNewProgPage.do" },
        { name: "수강포기 신청", icon: "🚫", url: "https://klas.kw.ac.kr/std/cps/atnlc/GiveupStdPage.do" },
        { name: "교류 학점 신청", icon: "🔄", url: "https://klas.kw.ac.kr/std/cps/atnlc/ExchgHakjumStdPage.do" },
        { name: "CDP 출석내역", icon: "📊", url: "https://klas.kw.ac.kr/std/cps/atnlc/CdpAtendStdPage.do" },
        { name: "CDP 출석여부 설문조사", icon: "📝", url: "https://klas.kw.ac.kr/std/cps/atnlc/CdpAtendQustnrStdPage.do" }
      ]
    },
    {
      title: "학습결과",
      items: [
        { name: "수업평가 결과 확인", icon: "📊", url: "https://klas.kw.ac.kr/std/cps/inqire/LctreEvlResultStdPage.do" },
        { name: "수강/성적 조회", icon: "🔍", url: "https://klasplus.yuntae.in/grade", badge: "KLAS+" },
        { name: "교양(필수, 균형) 이수현황 조회", icon: "📘", url: "https://klas.kw.ac.kr/std/cps/inqire/GyoyangIsuStdPage.do" },
        { name: "석차 조회", icon: "🏆", url: "https://klas.kw.ac.kr/std/cps/inqire/StandStdPage.do" },
        { name: "어학성적 조회", icon: "🌐", url: "https://klas.kw.ac.kr/std/cps/inqire/ToeicStdPage.do" },
        { name: "장학 조회", icon: "💰", url: "https://klasplus.yuntae.in/janghak", badge: "KLAS+" },
        { name: "학생 개인별 포트폴리오 관리", icon: "📁", url: "https://klas.kw.ac.kr/std/cps/inqire/IndividualPortfolio.do" }
      ]
    },
    {
      title: "학적관리",
      items: [
        { name: "세부전공 선택", icon: "🎓", url: "https://klas.kw.ac.kr/std/hak/hakjuk/DetailMajorSelectStdPage.do" },
        { name: "복수/부/심화전공 신청/조회", icon: "📚", url: "https://klas.kw.ac.kr/std/hak/hakjuk/CompnoMajorStdPage.do" },
        { name: "연계전공 신청/조회", icon: "🔗", url: "https://klas.kw.ac.kr/std/hak/hakjuk/CntcSbjectStdPage.do" },
        { name: "휴복학 신청", icon: "🔄", url: "https://klas.kw.ac.kr/std/hak/hakjuk/TmpabssklStdPage.do" }
      ]
    },
    {
      title: "학습지원실",
      items: [
        { name: "강의종합", icon: "🏠", url: "https://klas.kw.ac.kr/std/lis/evltn/LctrumHomeStdPage.do" },
        { name: "강의 공지사항", icon: "📢", url: "https://klas.kw.ac.kr/std/lis/sport/d052b8f845784c639f036b102fdc3023/BoardListStdPage.do" },
        { name: "강의 묻고답하기", icon: "❓", url: "https://klas.kw.ac.kr/std/lis/sport/573f918c23984ae8a88c398051bb1263/BoardQnaListStdPage.do" },
        { name: "강의 자료실", icon: "📂", url: "https://klas.kw.ac.kr/std/lis/sport/6972896bfe72408eb72926780e85d041/BoardListStdPage.do" },
        { name: "수강생 자료실", icon: "📁", url: "https://klas.kw.ac.kr/std/lis/sport/70778131bf7a421aba99dded74b3fb6b/BoardListStdPage.do" },
        { name: "과제제출", icon: "📝", url: "https://klas.kw.ac.kr/std/lis/evltn/TaskStdPage.do" },
        { name: "온라인시험 응시", icon: "✍️", url: "https://klas.kw.ac.kr/std/lis/evltn/OnlineTestStdPage.do" },
        { name: "수시퀴즈 응시", icon: "🧠", url: "https://klas.kw.ac.kr/std/lis/evltn/AnytmQuizStdPage.do" },
        { name: "팀프로젝트", icon: "👥", url: "https://klas.kw.ac.kr/std/lis/evltn/PrjctStdPage.do" },
        { name: "토론참여", icon: "💬", url: "https://klas.kw.ac.kr/std/lis/evltn/DscsnStdPage.do" },
        { name: "설문참여", icon: "📊", url: "https://klas.kw.ac.kr/std/lis/sport/QustnrStdPage.do" },
        { name: "학습현황 조회", icon: "📈", url: "https://klas.kw.ac.kr/std/lis/evltn/LrnSttusStdPage.do" },
        { name: "수업평가", icon: "🗳️", url: "https://klas.kw.ac.kr/std/cps/inqire/LctreEvlStdPage.do" }
      ]
    },
    {
      title: "온라인 강의",
      items: [
        { name: "온라인 강의컨텐츠 보기", icon: "🖥️", url: "https://klas.kw.ac.kr/std/lis/evltn/OnlineCntntsStdPage.do" },
        { name: "온라인 컨텐츠 진도현황 조회", icon: "📊", url: "https://klas.kw.ac.kr/std/lis/evltn/LrnSttusRtprgsStdPage.do" },
        { name: "E-class 강의 복습", icon: "🔄", url: "https://klas.kw.ac.kr/std/lis/lctre/EClassStdPage.do" },
        { name: "용어사전", icon: "📚", url: "https://klas.kw.ac.kr/std/lis/sport/DicStdPage.do" }
      ]
    },
    {
      title: "학생(수강)상담",
      items: [
        { name: "수학계획서 작성", icon: "📝", url: "https://klas.kw.ac.kr/std/egn/cnslt/SuhakPlanStdPage.do" },
        { name: "상담내역 조회", icon: "🔍", url: "https://klas.kw.ac.kr/std/egn/cnslt/CnsltDetailStdPage.do" },
        { name: "전입생 학점인정 상담", icon: "💬", url: "https://klas.kw.ac.kr/std/egn/cnslt/TrnsPntRCnsltStdPage.do" }
      ]
    },
    {
      title: "학습성과 성취도 평가",
      items: [
        { name: "에세이 보고서", icon: "📄", url: "https://klas.kw.ac.kr/std/egn/sesdg/EssayReprtStdPage.do" },
        { name: "설문조사", icon: "📊", url: "https://klas.kw.ac.kr/std/egn/sesdg/EgnSurveyStdPage.do" },
        { name: "설계포트폴리오 조회", icon: "📁", url: "https://klas.kw.ac.kr/std/egn/chck/PrtFolioStdPage.do" }
      ]
    },
    {
      title: "이수현황점검",
      items: [
        { name: "공학프로그램 이수현황 점검", icon: "🔍", url: "https://klas.kw.ac.kr/std/egn/chck/popwin/BeforeSbjectGradeViewStdPage.do" },
        { name: "공학프로그램 학습성과 점검", icon: "📊", url: "https://klas.kw.ac.kr/std/egn/chck/LrnRsltStdPage.do" },
        { name: "학위과정(프로그램)변경", icon: "🔄", url: "https://klas.kw.ac.kr/std/egn/chck/DgriChangeStdPage.do" },
        { name: "선수교과목이수현황 조회", icon: "📚", url: "https://klas.kw.ac.kr/std/egn/chck/BeforeSbjectStdPage.do" }
      ]
    },
    {
      title: "등록관리",
      items: [
        { name: "등록금 고지서출력", icon: "💰", url: "https://klas.kw.ac.kr/std/hak/erollmnt/TutionNtPage.do" },
        { name: "등록금/교육비 증명서", icon: "📄", url: "https://klas.kw.ac.kr/std/hak/erollmnt/PreSeterPage.do" },
        { name: "이전학기 등록내역 조회", icon: "🔍", url: "https://klas.kw.ac.kr/std/hak/erollmnt/TutionEduPage.do" },
        { name: "계절수업고지서 출력", icon: "🖨️", url: "https://klas.kw.ac.kr/std/hak/erollmnt/SenalClNtPage.do" },
        { name: "분할납부 고지서 출력", icon: "💳", url: "https://klas.kw.ac.kr/std/hak/erollmnt/PartPayNhtPage.do" }
      ]
    },
    {
      title: "상담관리",
      items: [
        { name: "광운역량이력서 입력", icon: "📈", url: "https://klas.kw.ac.kr/std/hak/cnslt/KwAbilUpStdPage.do" },
        { name: "학생포트폴리오 입력", icon: "📁", url: "https://kwjob.kw.ac.kr" },
        { name: "소속학과 교수 상담시간 조회", icon: "🕒", url: "https://klas.kw.ac.kr/std/hak/cnslt/CnsltTimeStdPage.do" },
        { name: "상담만족도 조사", icon: "📊", url: "https://klas.kw.ac.kr/std/hak/cnslt/CnsltStsfdgRsrchStdPage.do" }
      ]
    },
    {
      title: "행정 서비스",
      items: [
        { name: "예비군 전입신고", icon: "🎖️", url: "https://klas.kw.ac.kr/std/ads/admst/RsvTrnsfrnStdPage.do" },
        { name: "중앙 도서관", icon: "📚", url: "http://kupis.kw.ac.kr" },
        { name: "조교게시판", icon: "📢", url: "https://klas.kw.ac.kr/std/sys/optrn/c9925e2c1341487ebc7595ba8b64376e/BoardListStdPage.do" },
        { name: "조교등록과목조회 및 채점조교 활동보고서", icon: "📝", url: "https://klas.kw.ac.kr/std/ads/admst/AstntRptStdPage.do" },
        { name: "교직적성인성검사", icon: "✍️", url: "https://klas.kw.ac.kr/std/ads/admst/SklstfAptdExamStdPage.do" },
        { name: "일정관리", icon: "📅", url: "https://klas.kw.ac.kr/std/ads/admst/MySchdulPage.do" },
        { name: "Office 365", icon: "💻", url: "https://www.kw.ac.kr/ko/life/notice.jsp?BoardMode=view&DUID=21819" },
        { name: "학번QR코드", icon: "📱", url: "https://klas.kw.ac.kr/std/sys/optrn/MyNumberQrStdPage.do" },
        { name: "K-MOOC", icon: "🎓", url: "https://www.kmooc.kr/view/search/%EA%B4%91%EC%9A%B4%EB%8C%80%ED%95%99%EA%B5%90" },
        { name: "무선인터넷 장애신고 게시판", icon: "🛜", url: "https://klas.kw.ac.kr/std/sys/optrn/180aff26e3c742108290a0e58c93e091/BoardListStdPage.do" },
      ]
    },
    {
      title: "KLAS+",
      items: [
        { name: "서비스 공지사항", icon: "🔔", url: "https://blog.yuntae.in/%EA%B3%B5%EC%A7%80%EC%82%AC%ED%95%AD-3e1124b78f224c36b0bb9cb87a7e55de" },
        { name: "자주 묻는 질문(FAQ)", icon: "❓", url: "https://blog.yuntae.in/%EC%9E%90%EC%A3%BC-%EB%AC%BB%EB%8A%94-%EC%A7%88%EB%AC%B8faq-23363fe4f23d46778f717f33e502b13a" },
        { name: "개인정보 처리방침", icon: "🔒", url: "https://blog.yuntae.in/%EA%B0%9C%EC%9D%B8%EC%A0%95%EB%B3%B4-%EC%B2%98%EB%A6%AC%EB%B0%A9%EC%B9%A8-11cfc9b93eca807896a0c41c4ca9cb8f" },
        { name: "오픈소스 라이선스", icon: "🔧", url: "https://blog.yuntae.in/%EC%98%A4%ED%94%88%EC%86%8C%EC%8A%A4-%EB%9D%BC%EC%9D%B4%EC%84%A0%EC%8A%A4-11cfc9b93eca802c8c10ebbccc3b2811" },
      ]
    }
  ];

  const handleMenuReorder = (result) => {
    if (!result.destination) return;

    const items = Array.from(menuOrder);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setMenuOrder(items);
    localStorage.setItem('menuOrder', JSON.stringify(items));
  };

  const sortedMenuItems = menuOrder.map(title =>
    menuItems.find(item => item.title === title)
  ).filter(Boolean);

  const handleResetMenuOrder = () => {
    const defaultOrder = menuItems.map(item => item.title);
    setMenuOrder(defaultOrder);
    localStorage.setItem('menuOrder', JSON.stringify(defaultOrder));
  };

  const filteredMenuItems = sortedMenuItems
    .map(category => ({
      ...category,
      items: category.items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }))
    .filter(category => category.items.length > 0);

  return (
    <main>

      <div className="profile-card">
        {data ? <>
          <div className="profile-card" style={{ padding: 0, display: 'flex', flexDirection: 'row', justifyContent: "space-between", alignItems: 'center', width: '100%' }}>
            <div>
              <h3>{data.kname}</h3>
              <span style={{ opacity: .8, fontSize: '14px' }}>{data.hakgwa} | {data.hakbun}</span><br />
              <span style={{ opacity: .5, fontSize: '12px' }}>{data.hakjukStatu}</span>
            </div>

            <button onClick={() => setIsOpenSettingsModal(!isOpenSettingsModal)} style={{ background: 'var(--background)', width: '40px', height: '40px', fontSize: '20px', borderRadius: '50%' }}>
              <IonIcon name='settings-outline' />
            </button>
          </div>
          <br />
          <button onClick={() => Android.openLibraryQR()}
            style={{ background: 'var(--background)', borderRadius: '10px' }}>
            <span className="tossface">🪪</span>모바일 학생증
            <IonIcon name="chevron-forward-outline" style={{ position: 'relative', top: '2px' }} />
          </button>
          <br />
          {totGrade &&
            <div className="profile-card grade-card" style={{ padding: 0, flexDirection: 'row', alignItems: 'space-between', width: '100%' }} onClick={() => showGrades && Android.openPage('https://kw-klas-plus-webview.vercel.app/grade')}>
              <div style={{ textAlign: 'center', width: '100%' }} onClick={handleGradeClick}>
                <span style={{ opacity: .8, fontSize: '12px' }}>취득학점</span>
                <h3>{hideGrades && !showGrades ? '??' : totGrade.credit}</h3>
              </div>
              <div style={{ textAlign: 'center', width: '100%' }} onClick={handleGradeClick}>
                <span style={{ opacity: .8, fontSize: '12px' }}>평균평점</span>
                <h3>{hideGrades && !showGrades ? '??' : totGrade.averageGPA.includeF}</h3>
              </div>
              <div style={{ textAlign: 'center', width: '100%' }} onClick={handleGradeClick}>
                <span style={{ opacity: .8, fontSize: '12px' }}>전공평점</span>
                <h3>{hideGrades && !showGrades ? '??' : totGrade.majorGPA.includeF}</h3>
              </div>
            </div>}
        </>
          :
          <>
            <div className="skeleton" style={{ height: '30px', width: '30%' }} />
            <div className="skeleton" style={{ height: '20px', width: '80%' }} />
            <div className="skeleton" style={{ height: '10px', width: '60%' }} />
            <button onClick={() => Android.openLibraryQR()}
              style={{ background: 'var(--notice-hover)', borderRadius: '10px' }}>
              <span className="tossface">🪪</span>모바일 학생증
              <IonIcon name="chevron-forward-outline" style={{ position: 'relative', top: '2px' }} />
            </button>
            <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'center', width: '100%', gap: '20px' }}>
              <div className="skeleton" style={{ height: '40px', width: '33%' }} />
              <div className="skeleton" style={{ height: '40px', width: '33%' }} />
              <div className="skeleton" style={{ height: '40px', width: '33%' }} />
            </div>

          </>
        }


      </div>



      <div className="search-container">
        <span className="tossface" style={{ position: 'relative', left: '10px', top: '30px' }}>🔍</span>
        <input
          style={{ paddingLeft: '35px' }}
          placeholder={"메뉴 검색"}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyUp={(e) => {
            if (e.key === 'Enter') {
              e.target.blur();
            }
          }
          }
        />
      </div>


      {filteredMenuItems.map((category, index) => (
        <div key={index}>
          {category.title ? <h5 style={{ marginLeft: '10px', marginTop: '30px', marginBottom: '10px' }}>{category.title}</h5> : <Spacer y={15} />}
          {category.items.map((item, itemIndex) => (
            <button key={itemIndex} onClick={() => Android.openPage(item.url)}>
              <span className="tossface">{item.icon}</span>
              <span>{item.name}</span>
              {item.badge && <span style={{ background: 'var(--button-background)', padding: '3px 5px', borderRadius: '10px', fontSize: '12px', position: 'relative', left: '5px', top: '-1px', opacity: .8 }}>{item.badge}</span>}
            </button>
          ))}
        </div>
      ))}
      <br />
      <AppVersion />
      <br />

      <BottomSheet
        open={isOpenSettingsModal}
        onDismiss={() => { setIsOpenSettingsModal(false); }}
        draggable={false}
      >
        <div style={{ maxHeight: '90dvh', padding: '20px', overflow: 'hidden' }}>
          <h2>옵션</h2>
          <Spacer y={20} />

          <div style={{ maxHeight: '90dvh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span><b>메뉴 탭에서 학점 숨기기</b></span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={hideGrades}
                  onChange={handleHideGradesChange}
                />
                <span className="slider"></span>
              </label>
            </div>
            <Spacer y={20} />
            <h3>메뉴 순서 설정</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ opacity: .6, fontSize: '15px' }}>메뉴 순서를 드래그하여 변경하세요</span>
              <button onClick={handleResetMenuOrder} style={{ background: 'var(--card-background)', padding: '0', width: '30px', height: '30px', fontSize: '16px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '-5px' }}>
                <IonIcon name='refresh-outline' />
              </button>
            </div>
            <DragDropContext onDragEnd={handleMenuReorder}>
              <Droppable droppableId="menu-list">
                {(provided) => (
                  <ul style={{ padding: 0 }} {...provided.droppableProps} ref={provided.innerRef}>
                    {menuOrder.map((title, index) => (
                      <Draggable key={title} draggableId={title} index={index}>
                        {(provided) => (
                          <li
                            className="menu-item-draggable"
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...provided.draggableProps.style
                            }}
                          >
                            <IonIcon name='menu-outline' style={{ marginRight: '10px', opacity: .7 }} />
                            {title}
                          </li>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </ul>
                )}
              </Droppable>
            </DragDropContext>
            <Spacer y={90} />

          </div>

        </div>


        <div className='bottom-sheet-footer'>
          <button onClick={() => setIsOpenSettingsModal(false)}>확인</button>
        </div>
      </BottomSheet>
    </main>
  );
}