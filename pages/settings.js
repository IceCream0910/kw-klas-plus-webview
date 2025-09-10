import { useSettings } from '../lib/useSettings';
import ThemeSelector from '../components/settings/ThemeSelector';
import SettingsMenuSection from '../components/settings/SettingsMenuSection';
import SettingsLinkSection from '../components/settings/SettingsLinkSection';
import SettingsInfoSection from '../components/settings/SettingsInfoSection';
import Spacer from "../components/common/spacer";
import { BottomSheet } from 'react-spring-bottom-sheet';
import 'react-spring-bottom-sheet/dist/style.css';

export default function Settings() {
  const {
    activeTheme,
    yearHakgi,
    appVersion,
    isOpenSettingsModal,
    hideGrades,
    setIsOpenSettingsModal,
    handleHideGradesChange
  } = useSettings();

  return (
    <main>
      <h3 style={{ margin: '10px' }}>테마</h3>
      <Spacer y={5} />
      <ThemeSelector active={activeTheme} />
      <Spacer y={30} />

      <Spacer y={5} />
      <SettingsMenuSection
        hideGrades={hideGrades}
        onHideGradesChange={handleHideGradesChange}
        yearHakgi={yearHakgi}
      />

      <Spacer y={20} />
      <hr style={{ margin: '0 10px', opacity: .1 }} />
      <Spacer y={20} />
      <h3 style={{ margin: '10px' }}>링크</h3>

      <SettingsLinkSection />

      <Spacer y={20} />
      <hr style={{ margin: '0 10px', opacity: .1 }} />
      <Spacer y={20} />
      <h3 style={{ margin: '10px' }}>정보</h3>

      <SettingsInfoSection appVersion={appVersion} />

      <Spacer y={10} />
      <div style={{ fontSize: '14px', opacity: .5, margin: '5px' }}>
        <span className="tossface">⚠️</span> KLAS+는 학교의 공식 앱이 아닙니다. 불법적인 목적으로 사용 시 발생하는 불이익에 대해서 개발자는 어떠한 책임도 지지 않음을 밝힙니다.
      </div>
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

