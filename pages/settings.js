import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/router";
import IonIcon from '@reacticons/ionicons';
import Spacer from "./components/spacer";
import { BottomSheet } from 'react-spring-bottom-sheet';
import 'react-spring-bottom-sheet/dist/style.css';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';


export default function Settings() {
  const router = useRouter();
  const [activeTheme, setActiveTheme] = useState("system");
  const [yearHakgi, setYearHakgi] = useState(null);
  const [appVersion, setAppVersion] = useState(null);
  const [isOpenSettingsModal, setIsOpenSettingsModal] = useState(false);
  const [hideGrades, setHideGrades] = useState(false);
  const [showGrades, setShowGrades] = useState(true);
  const [menuOrder, setMenuOrder] = useState([]);

  useEffect(() => {
    window.receiveTheme = function (theme) {
      if (!theme) return;
      setActiveTheme(theme);
    };

    window.receiveYearHakgi = function (yearHakgi) {
      if (!yearHakgi) return;
      setYearHakgi(yearHakgi);
    }

    window.receiveVersion = function (version) {
      if (!version) return;
      setAppVersion(version);
    }

    const savedHideGrades = localStorage.getItem('hideGrades');
    if (savedHideGrades !== null) {
      const parsedHideGrades = savedHideGrades === 'true';
      setHideGrades(parsedHideGrades);
      setShowGrades(!parsedHideGrades);
    }


  }, []);


  useEffect(() => {
    localStorage.setItem('hideGrades', hideGrades.toString());
  }, [hideGrades]);

  const handleHideGradesChange = (e) => {
    const checked = e.target.checked;
    setHideGrades(checked);
    setShowGrades(!checked);
  };

  return (
    <main>
      <h3 style={{ margin: '10px' }}>테마</h3>
      <Spacer y={5} />
      <ThemeSelector active={activeTheme} />
      <Spacer y={30} />

      <Spacer y={5} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 10px' }}>
        <label for="hideGrades">메뉴 탭에서 학점 숨기기</label>
        <label className="switch">
          <input
            type="checkbox"
            id="hideGrades"
            checked={hideGrades}
            onChange={handleHideGradesChange}
          />
          <span className="slider"></span>
        </label>
      </div>
      <Spacer y={5} />
      <button style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        onClick={() => Android.openYearHakgiSelectModal()}>
        <span>표시할 학기</span>
        <span style={{ opacity: .8, fontSize: '14px' }}>{yearHakgi && yearHakgi.replace(",3", ",하계계절").replace(",4", ",동계계절").replace(",", "년도 ") + "학기"}</span>
      </button>

      <button style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        onClick={() => Android.openLibraryQRSettingsModal()}>
        <span>모바일 학생증 설정</span>
        <span style={{ opacity: .8, fontSize: '14px' }}><IonIcon name="chevron-forward-outline" /></span>
      </button>


      <Spacer y={20} />
      <hr style={{ margin: '0 10px', opacity: .1 }} />
      <Spacer y={20} />
      <h3 style={{ margin: '10px' }}>링크</h3>

      <button onClick={() => Android.openExternalLink("https://klasplus-log.yuntae.in/widget")}>
        <span className="tossface">🔔</span>
        <span>공지사항</span>
      </button>
      <button onClick={() => Android.openExternalLink("https://status.klasplus.yuntae.in")}>
        <span className="tossface">📶</span>
        <span>서비스 상태</span>
      </button>
      <button onClick={() => Android.openExternalLink("https://blog.yuntae.in/23363fe4-f23d-4677-8f71-7f33e502b13a")}>
        <span className="tossface">❓</span>
        <span>자주 묻는 질문(FAQ)</span>
      </button>
      <button onClick={() => Android.openExternalLink("https://blog.yuntae.in/11cfc9b9-3eca-8078-96a0-c41c4ca9cb8f")}>
        <span className="tossface">🔒</span>
        <span>개인정보 처리방침</span>
      </button>
      <button onClick={() => Android.openExternalLink("https://blog.yuntae.in/11cfc9b9-3eca-802c-8c10-ebbccc3b2811")}>
        <span className="tossface">🔧</span>
        <span>오픈소스 라이선스</span>
      </button>

      <Spacer y={20} />
      <hr style={{ margin: '0 10px', opacity: .1 }} />
      <Spacer y={20} />
      <h3 style={{ margin: '10px' }}>정보</h3>
      <button className="unclikable" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} disabled>
        <span style={{ fontSize: '16px' }}>앱 버전</span>
        <span style={{ opacity: .8, fontSize: '14px' }}>v{appVersion}</span>
      </button>
      <button className="unclikable" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} disabled>
        <span style={{ fontSize: '16px' }}>WebView Git SHA</span>
        <span style={{ opacity: .8, fontSize: '14px' }}>
          {process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA
            ? process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA.substring(0, 7)
            : 'n/a'}
        </span>
      </button>
      <button className="unclikable" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} disabled>
        <span style={{ fontSize: '16px' }}>Runtime Region</span>
        <span style={{ opacity: .8, fontSize: '14px' }}>icn1</span>
      </button>
      <Spacer y={10} />
      <div style={{ fontSize: '14px', opacity: .5, margin: '5px' }}><span className="tossface">⚠️</span> KLAS+는 학교의 공식 앱이 아닙니다. 불법적인 목적으로 사용 시 발생하는 불이익에 대해서 개발자는 어떠한 책임도 지지 않음을 밝힙니다.</div>
      <Spacer y={20} />

      <BottomSheet
        open={isOpenSettingsModal}
        onDismiss={() => { setIsOpenSettingsModal(false); }}
        draggable={false}
      >
        <div style={{ maxHeight: '90dvh', padding: '20px', overflow: 'hidden' }}>
          <h2>옵션</h2>

        </div>


        <div className='bottom-sheet-footer'>
          <button onClick={() => setIsOpenSettingsModal(false)}>확인</button>
        </div>
      </BottomSheet>
    </main>
  );
}

const ThemeSelector = ({ active = "system" }) => {
  const [selectedTheme, setSelectedTheme] = useState('system');

  useEffect(() => {
    if (!active) return;
    setSelectedTheme(active);
  }, [active]);

  const themes = [
    { id: 'light', label: '밝은' },
    { id: 'dark', label: '어두운' },
    { id: 'system', label: '시스템 설정' }
  ];

  const containerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px',
    padding: '0 10px',
    boxSizing: 'border-box',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    flexWrap: 'wrap',
  };

  const themeItemStyle = (themeId) => ({
    width: '30%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s'
  });

  const iconContainerStyle = (themeId) => ({
    width: '100%',
    height: '70px',
    borderRadius: '15px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: selectedTheme === themeId ? '2px solid #007AFF' : '2px solid transparent',
    position: 'relative'
  });

  const labelStyle = {
    fontSize: '14px',
    marginTop: '4px',
    opacity: .8
  };

  const textStyle = (themeId) => ({
    color: themeId === 'light' ? '#333' : '#fff',
    fontSize: '24px',
    fontWeight: '500',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)'
  });

  const checkmarkStyle = {
    position: 'absolute',
    bottom: '8px',
    right: '8px',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: '#007AFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '14px'
  };

  const handleThemeChange = (themeId) => {
    setSelectedTheme(themeId);
    Android.changeAppTheme(themeId);
  }

  return (
    <div style={containerStyle}>
      {themes.map((theme) => (
        <div
          key={theme.id}
          style={themeItemStyle(theme.id)}
          onTouchStart={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
          onTouchEnd={(e) => e.currentTarget.style.transform = 'scale(1)'}
          onClick={() => handleThemeChange(theme.id)}
        >
          <div style={iconContainerStyle(theme.id)}>
            {theme.id === 'system' ? (
              <>
                <div style={{ width: '50%', height: '100%', backgroundColor: '#333', borderRadius: '13px 0 0 13px' }} />
                <div style={{ width: '50%', height: '100%', backgroundColor: '#f5f5f5', borderRadius: '0 13px 13px 0' }} />
              </>
            ) : theme.id === 'light' ? (
              <>
                <div style={{ width: '100%', height: '100%', borderRadius: '13px', backgroundColor: '#f5f5f5' }} />
              </>
            ) : (
              <>
                <div style={{ width: '100%', height: '100%', borderRadius: '13px', backgroundColor: '#333' }} />
              </>
            )}
            <span style={textStyle(theme.id)}>A<span style={{ color: theme.id === 'system' ? '#333' : undefined }}>a</span></span>
            {selectedTheme === theme.id && (
              <div style={checkmarkStyle}>✓</div>
            )}
          </div>
          <span style={labelStyle}>{theme.label}</span>
        </div>
      ))}
    </div>
  );
};