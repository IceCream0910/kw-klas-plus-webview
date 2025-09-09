import { useEffect, useState } from "react";
import IonIcon from "@reacticons/ionicons";
import Spacer from "../components/spacer";
import { openOptionsMenu } from "../../lib/androidBridge";

/**
 * 앱 버전 체크 유틸리티
 */
const checkAppCompatibility = (version) => {
    if (!version) return false;
    if (!version.includes('.') && version >= 21) {
        return true;
    }
    return false;
};

/**
 * 사용자 에이전트에서 앱 버전 추출
 */
const getAppVersionFromUserAgent = () => {
    const userAgent = navigator.userAgent;
    const version = userAgent.split('AndroidApp_v')[1];
    return version ? version.trim() : null;
};

function Header({ title }) {
    const [version, setVersion] = useState("");
    const [isCompatible, setIsCompatible] = useState(false);

    useEffect(() => {
        const appVersion = getAppVersionFromUserAgent();
        if (appVersion) {
            setVersion(appVersion);
            setIsCompatible(checkAppCompatibility(appVersion));
        }
    }, []);

    // 개발 모드가 아니고 호환되지 않는 버전인 경우 렌더링하지 않음
    if (!isCompatible && process.env.NEXT_PUBLIC_DEVELOPMENT !== 'true') {
        return null;
    }

    return (
        <>
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: 'calc(100% - 40px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 20px 20px 20px',
                background: 'linear-gradient(to bottom, var(--background) 65%, transparent 100%)',
                zIndex: 1000
            }}>
                {title}
                <button
                    style={{ width: 'fit-content' }}
                    onClick={openOptionsMenu}
                    aria-label="메뉴 열기"
                >
                    <IonIcon
                        name='ellipsis-vertical'
                        style={{
                            fontSize: '20px',
                            color: 'var(--text-color)',
                            position: 'relative',
                            top: '2px'
                        }}
                    />
                </button>
            </div>

            <Spacer y={50} />
        </>
    );
}

export default Header;