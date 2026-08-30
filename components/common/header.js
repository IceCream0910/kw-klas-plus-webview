import { useEffect, useState } from "react";
import IonIcon from "@reacticons/ionicons";
import Spacer from "../common/spacer";
import KlasNativeBridge from "../../lib/core/klasNativeBridge";
import { getNativeAppFromUserAgent, isNativeFeatureCompatible } from "../../lib/core/nativeApp";
import toast, { Toaster } from 'react-hot-toast';
import GradualBlur from "../common/GradualBlur";

const handleChangelogClick = () => {
    try {
        KlasNativeBridge.openPage("https://klasplus.yuntae.in/changelog")
    } catch (error) {
        toast("앱을 최신버전으로 업데이트해주세요.")
    }
};

const handleAiClick = () => {
    try {
        KlasNativeBridge.openPage("https://klasplus.yuntae.in/agent")
    } catch (error) {
        toast("앱을 최신버전으로 업데이트해주세요.")
    }
};

function Header({ title }) {
    const [version, setVersion] = useState("");
    const [isCompatible, setIsCompatible] = useState(false);
    const [isAgentCompatible, setIsAgentCompatible] = useState(false);

    useEffect(() => {
        const app = getNativeAppFromUserAgent();
        if (app) {
            setVersion(app.version);
            setIsCompatible(isNativeFeatureCompatible("header", app));
            setIsAgentCompatible(isNativeFeatureCompatible("agent", app));
        }
    }, []);

    if (!isCompatible) {
        return null;
    }

    return (
        <>
            <Toaster position="bottom-center" />
            <div className="app-header">
                <div className="app-header-inner">
                    <div onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        {title}
                    </div>
                    <div className="app-header-actions">
                        <button
                            type="button"
                            style={{ width: 'fit-content' }}
                            onClick={handleChangelogClick}
                            aria-label="업데이트 내역 열기"
                        >
                            <released-badge channel-id="b8696cec-f681-43a8-9baa-d5737483003e"></released-badge>
                            <IonIcon
                                name='rocket'
                                style={{
                                    fontSize: '20px',
                                    color: 'var(--text-color)',
                                    position: 'relative',
                                    top: '2px'
                                }}
                            />
                        </button>


                        {isAgentCompatible && (
                            <div style={{ position: 'relative' }}>
                                <button
                                    type="button"
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
                                            top: '2px'
                                        }}
                                    />
                                </button>
                            </div>
                        )}

                        <button
                            type="button"
                            style={{ width: 'fit-content' }}
                            onClick={() => KlasNativeBridge.openOptionsMenu()}
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


                <GradualBlur
                    position="top"
                    height="5rem"
                    strength={1.5}
                />
            </div>

            <Spacer y={75} className="app-header-spacer" />
        </>
    );
}

export default Header;
