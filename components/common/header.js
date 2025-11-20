import { useEffect, useState } from "react";
import IonIcon from "@reacticons/ionicons";
import Spacer from "../common/spacer";
import { openOptionsMenu, openKlasPage } from "../../lib/core/androidBridge";
import toast, { Toaster } from 'react-hot-toast';


const checkAppCompatibility = (version) => {
    if (!version) return false;
    return version >= 21;
};

const checkAgentCompatibility = (version) => {
    if (!version) return false;
    return version >= 23;
};

const getAppVersionFromUserAgent = () => {
    const userAgent = navigator.userAgent;
    const match = userAgent.match(/AndroidApp_v(\d+)/);
    return match ? parseInt(match[1], 10) : null;
};

function Header({ title }) {
    const [version, setVersion] = useState("");
    const [isCompatible, setIsCompatible] = useState(false);
    const [isAgentCompatible, setIsAgentCompatible] = useState(false);

    const [showTooltip, setShowTooltip] = useState(false);

    useEffect(() => {
        const appVersion = getAppVersionFromUserAgent();
        if (appVersion) {
            setVersion(appVersion);
            setIsCompatible(checkAppCompatibility(appVersion));
            setIsAgentCompatible(checkAgentCompatibility(appVersion));
        }

        const hasSeenTooltip = localStorage.getItem('hasSeenAiTooltip');
        if (!hasSeenTooltip) {
            setShowTooltip(true);
            localStorage.setItem('hasSeenAiTooltip', 'false');
        }
    }, []);

    const handleAiClick = () => {
        if (showTooltip) {
            setShowTooltip(false);
            localStorage.setItem('hasSeenAiTooltip', 'false');
        }

        try {
           openKlasPage("https://klasplus.yuntae.in/agent")
        } catch (error) {
            toast("앱을 최신버전으로 업데이트해주세요.")
        }
    };

    if (!isCompatible) {
        return null;
    }

    return (
        <>
            <Toaster position="bottom-center" />
            <style>{`
                @keyframes rainbow-flash {
                    0% { color: var(--text-color); }
                    20% { color: #CD5D5B; }
                    40% { color: #E5BE4C; }
                    60% { color: #6480F4; }
                    80% { color: #66B479; }
                    100% { color: var(--text-color); }
                }
            `}</style>
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

                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {isAgentCompatible && (
                        <div style={{ position: 'relative' }}>
                            {showTooltip && (
                                <div onClick={() => setShowTooltip(false)} style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    marginTop: '8px',
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    padding: '6px 12px',
                                    borderRadius: '20px',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    whiteSpace: 'nowrap',
                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                    zIndex: 1001,
                                    animation: 'bounce 1s infinite'
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        top: '-4px',
                                        left: '50%',
                                        transform: 'translateX(-50%) rotate(45deg)',
                                        width: '8px',
                                        height: '8px',
                                        backgroundColor: '#3b82f6'
                                    }} />
                                    AI가 여기로 이사했어요!
                                </div>
                            )}
                            <button
                                style={{ width: 'fit-content' }}
                                onClick={handleAiClick}
                                aria-label="AI 챗봇 열기"
                            >
                                <IonIcon
                                    name='chatbubble-ellipses'
                                    style={{
                                        fontSize: '20px',
                                        color: 'var(--text-color)',
                                        position: 'relative',
                                        top: '2px',
                                        animation: showTooltip ? 'rainbow-flash 4s ease-in-out 1' : 'none'
                                    }}
                                />
                            </button>
                        </div>
                    )}

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
            </div>

            <Spacer y={50} />
        </>
    );
}

export default Header;
