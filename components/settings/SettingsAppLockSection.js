import { useState, useEffect } from 'react';
import IonIcon from '@reacticons/ionicons';
import ToggleSwitch from '../common/ToggleSwitch';
import Spacer from '../common/spacer';

const SettingsAppLockSection = () => {
    const [isAppLockEnabled, setIsAppLockEnabled] = useState(false);
    const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
    const [hasPassword, setHasPassword] = useState(false);

    const loadSettings = () => {
        if (typeof window !== 'undefined' && window.Android && window.Android.getAppLockSettings) {
            try {
                const settingsStr = window.Android.getAppLockSettings();
                const settings = JSON.parse(settingsStr);
                setIsAppLockEnabled(settings.enabled);
                setIsBiometricEnabled(settings.biometric);
                setHasPassword(settings.hasPassword);
            } catch (e) {
                console.error("Failed to load app lock settings", e);
            }
        }
    };

    useEffect(() => {
        // 초기 설정 불러오기
        loadSettings();

        // Android에서 생체인증 설정 결과를 받아오는 콜백
        window.onBiometricSettingChanged = (enabled) => {
            setIsBiometricEnabled(enabled);
        };

        // 앱 잠금 설정 화면(LockActivity)에서 돌아왔을 때 상태 갱신
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                loadSettings();
            }
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            delete window.onBiometricSettingChanged;
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, []);

    const handleAppLockToggle = (e) => {
        const checked = e.target.checked;
        setIsAppLockEnabled(checked);
        if (typeof window !== 'undefined' && window.Android && window.Android.setAppLockEnabled) {
            window.Android.setAppLockEnabled(checked);
        }
    };

    const handleBiometricToggle = (e) => {
        const checked = e.target.checked;
        setIsBiometricEnabled(checked); // Optimistic update
        if (typeof window !== 'undefined' && window.Android && window.Android.setBiometricEnabled) {
            window.Android.setBiometricEnabled(checked);
        }
    };

    const handleChangePassword = () => {
        if (typeof window !== 'undefined' && window.Android && window.Android.setAppLockPassword) {
            window.Android.setAppLockPassword();
        }
    };

    return (
        <>
            <Spacer y={10} />
            <ToggleSwitch
                id="app-lock-switch"
                label="앱 잠금 사용"
                checked={isAppLockEnabled}
                onChange={handleAppLockToggle}
                style={{ margin: '0 10px' }}
            />

            {isAppLockEnabled && (
                <>
                    <button
                        type="button"
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        onClick={handleChangePassword}
                    >
                        <span>{hasPassword ? '앱 비밀번호 변경' : '앱 비밀번호 설정'}</span>
                        <span style={{ opacity: .8, fontSize: '14px' }}>
                            <IonIcon name="chevron-forward-outline" />
                        </span>
                    </button>

                    <ToggleSwitch
                        id="biometric-switch"
                        label="생체인증 사용"
                        checked={isBiometricEnabled}
                        onChange={handleBiometricToggle}
                        style={{ padding: '5px 0 0 0', margin: '0 10px' }}
                    />
                </>
            )}
        </>
    );
};

export default SettingsAppLockSection;
