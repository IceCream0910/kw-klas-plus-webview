import { useState, useEffect } from "react";
import IonIcon from '@reacticons/ionicons';
import handleCalculateGPA, { calculateGPA } from "./utils/calculateGPA";

export default function Home() {
  const [data, setData] = useState(null);
  const [token, setToken] = useState("");
  const [grade, setGrade] = useState(null);
  const [synthesisGPAs, setSynthesisGPAs] = useState();
  const [totGrade, setTotGrade] = useState();
  const [searchTerm, setSearchTerm] = useState("");


  useEffect(() => {
    window.receiveToken = function (receivedToken) {
      if (!receivedToken) return;
      setToken(receivedToken);
    };

    Android.completePageLoad();
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
    }

    getData();
  }, [grade]);


  useEffect(() => {
    if (!synthesisGPAs) return;
    const tot = synthesisGPAs.find(semester => semester.name === '전체 학기');
    setTotGrade(tot)
  }, [synthesisGPAs]);


  const menuItems = [
    {
      title: "수강관리",
      items: [
        { name: "수업시간표", icon: "📅", url: "https://klas.kw.ac.kr/std/cps/atnlc/TimetableStdPage.do" },
        { name: "출석관리(KW출첵)", icon: "✅", url: "https://klas.kw.ac.kr/std/ads/admst/KwAttendStdPage.do" },
        { name: "강의계획서 조회", icon: "📚", url: "https://klas.kw.ac.kr/std/cps/atnlc/LectrePlanStdPage.do" },
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
        { name: "수강/성적 조회", icon: "🔍", url: "https://klas.kw.ac.kr/std/cps/inqire/AtnlcScreStdPage.do" },
        { name: "교양(필수, 균형) 이수현황 조회", icon: "📘", url: "https://klas.kw.ac.kr/std/cps/inqire/GyoyangIsuStdPage.do" },
        { name: "석차 조회", icon: "🏆", url: "https://klas.kw.ac.kr/std/cps/inqire/StandStdPage.do" },
        { name: "어학성적 조회", icon: "🌐", url: "https://klas.kw.ac.kr/std/cps/inqire/ToeicStdPage.do" },
        { name: "장학 조회", icon: "💰", url: "https://klas.kw.ac.kr/std/cps/inqire/JanghakStdPage.do" },
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
        { name: "대학평의회 자료실", icon: "📂", url: "https://klas.kw.ac.kr/std/sys/optrn/58459c5b27b6409aaf24359ae24f5213/BoardListStdPage.do" },
        { name: "조교게시판", icon: "📢", url: "https://klas.kw.ac.kr/std/sys/optrn/c9925e2c1341487ebc7595ba8b64376e/BoardListStdPage.do" },
        { name: "조교등록과목조회 및 채점조교 활동보고서", icon: "📝", url: "https://klas.kw.ac.kr/std/ads/admst/AstntRptStdPage.do" },
        { name: "교직적성인성검사", icon: "✍️", url: "https://klas.kw.ac.kr/std/ads/admst/SklstfAptdExamStdPage.do" },
        { name: "일정관리", icon: "📅", url: "https://klas.kw.ac.kr/std/ads/admst/MySchdulPage.do" },
        { name: "장소사용", icon: "🏢", url: "https://klas.kw.ac.kr/std/sys/optrn/e4c863dfd8c7410d92bc4abc9542bccd/BoardListStdPage.do" },
        { name: "Office 365", icon: "💻", url: "https://www.kw.ac.kr/ko/life/notice.jsp?BoardMode=view&DUID=21819" },
        { name: "학번QR코드", icon: "📱", url: "https://klas.kw.ac.kr/std/sys/optrn/MyNumberQrStdPage.do" },
        { name: "K-MOOC", icon: "🎓", url: "http://www.kmooc.kr/courses?search_query=%EA%B4%91%EC%9A%B4%EB%8C%80%ED%95%99%EA%B5%90" }
      ]
    }
  ];


  const filteredMenuItems = menuItems.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

  return (
    <main>

      <div className="profile-card">
        {data ? <>
          <div className="profile-card" style={{ padding: 0 }}>
            <h3>{data.kname}</h3>
            <span style={{ opacity: .8, fontSize: '14px' }}>{data.hakgwa} | {data.hakbun}</span>
            <span style={{ opacity: .5, fontSize: '12px' }}>{data.hakjukStatu}</span>
          </div>
          <br />
          <button onClick={() => Android.openLibraryQR()}
            style={{ background: 'var(--background)', borderRadius: '10px' }}>
            <span className="tossface">🪪</span>모바일 학생증
            <IonIcon name="chevron-forward-outline" style={{ position: 'relative', top: '2px' }} />
          </button>
          <br />
          {totGrade &&
            <div className="profile-card grade-card" style={{ padding: 0, flexDirection: 'row', alignItems: 'space-between', width: '100%' }} onClick={() => Android.openPage('https://kw-klas-plus-webview.vercel.app/grade')}>
              <div style={{ textAlign: 'center', width: '100%' }}>
                <span style={{ opacity: .8, fontSize: '12px' }}>취득학점</span>
                <h3>{totGrade.credit}</h3>
              </div>
              <div style={{ textAlign: 'center', width: '100%' }}>
                <span style={{ opacity: .8, fontSize: '12px' }}>평균평점</span>
                <h3>{totGrade.averageGPA.includeF}</h3>
              </div>
              <div style={{ textAlign: 'center', width: '100%' }}>
                <span style={{ opacity: .8, fontSize: '12px' }}>전공평점</span>
                <h3>{totGrade.majorGPA.includeF}</h3>
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
          <h5 style={{ marginLeft: '10px', marginTop: '30px', marginBottom: '10px' }}>{category.title}</h5>
          {category.items.map((item, itemIndex) => (
            <button key={itemIndex} onClick={() => Android.openPage(item.url)}>
              <span className="tossface">{item.icon}</span>
              <span>{item.name}</span>
            </button>
          ))}
        </div>
      ))}
    </main>
  );
}