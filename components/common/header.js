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

    useEffect(() => {
        const appVersion = getAppVersionFromUserAgent();
        if (appVersion) {
            setVersion(appVersion);
            setIsCompatible(checkAppCompatibility(appVersion));
            setIsAgentCompatible(checkAgentCompatibility(appVersion));
        }
    }, []);

    const handleAiClick = () => {try {
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
