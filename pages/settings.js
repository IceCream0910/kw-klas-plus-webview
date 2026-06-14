import { useState, useEffect } from 'react';
import { useSettings } from '../lib/useSettings';
import ThemeSelector from '../components/settings/ThemeSelector';
import SettingsMenuSection from '../components/settings/SettingsMenuSection';
import SettingsLinkSection from '../components/settings/SettingsLinkSection';
import SettingsInfoSection from '../components/settings/SettingsInfoSection';
import SettingsAppLockSection from '../components/settings/SettingsAppLockSection';
import Spacer from "../components/common/spacer";
import BottomSheet from '../components/common/BottomSheet';
import IonIcon from '@reacticons/ionicons';
import { Toaster } from 'react-hot-toast';

export default function Settings() {
  const {
    activeTheme,
    yearHakgi,
    appVersion,
    isOpenSettingsModal,
    setIsOpenSettingsModal,
  } = useSettings();

  const [userAgentVersion, setUserAgentVersion] = useState("0");

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userAgent = navigator.userAgent;
      const versionMatch = userAgent.split('AndroidApp_v')[1];
      if (versionMatch) setUserAgentVersion(versionMatch.trim());
    }
  }, []);

  return (
    <main>
      <h3 style={{ margin: '10px' }}>테마</h3>
      <Spacer y={5} />
      <ThemeSelector active={activeTheme} />
      <Spacer y={30} />

      <Spacer y={5} />
      <SettingsMenuSection
        yearHakgi={yearHakgi}
      />

      <Spacer y={20} />
      <hr style={{ margin: '0 10px', opacity: .1 }} />
      <Spacer y={20} />

      {parseInt(userAgentVersion, 10) >= 32 && (
        <>
          <h3 style={{ margin: '10px' }}>앱 잠금</h3>
          <SettingsAppLockSection />
          <Spacer y={20} />
          <hr style={{ margin: '0 10px', opacity: .1 }} />
          <Spacer y={20} />
        </>
      )}

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
        title="옵션"
        open={isOpenSettingsModal}
        onDismiss={() => { setIsOpenSettingsModal(false); }}
        draggable={false}
      >
        <BottomSheet.Close asChild>
          <div style={{ position: 'absolute', top: '20px', right: '20px' }}><IonIcon name='close'></IonIcon></div>
        </BottomSheet.Close>
        <div className='bottom-sheet'>
          <div style={{ maxHeight: '90dvh', overflow: 'hidden' }}>
            {/* option content if any will go here */}
          </div>
        </div>
      </BottomSheet>
      <Toaster position="bottom-center" />
    </main>
  );
}

