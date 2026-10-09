import { useEffect, useRef, useState } from "react";
import IonIcon from "@reacticons/ionicons";
import Spacer from "../common/spacer";
import KlasNativeBridge from "../../lib/core/klasNativeBridge";
import { getNativeAppFromUserAgent, isNativeFeatureCompatible } from "../../lib/core/nativeApp";
import toast, { Toaster } from 'react-hot-toast';
import GradualBlur from "../common/GradualBlur";
import { useSearch } from '../search/SearchProvider';

const RELEASED_CHANNEL_ID = "b8696cec-f681-43a8-9baa-d5737483003e";

const handleChangelogClick = () => {
    try {
        KlasNativeBridge.openPage("https://klasplus.yuntae.in/changelog")
    } catch (error) {
        toast("앱을 최신버전으로 업데이트해주세요.")
    }
};

function ChangelogAction() {
    const badgeProbeRef = useRef(null);
    const [hasUnreadRelease, setHasUnreadRelease] = useState(false);

    useEffect(() => {
        let badgeObserver;
        let isDisposed = false;

        const observeBadge = () => {
            const badgeElement = badgeProbeRef.current;
            if (!badgeElement || isDisposed) return;

            const updateUnreadState = () => {
                const { width, height } = badgeElement.getBoundingClientRect();
                setHasUnreadRelease(width > 0 && height > 0);
            };

            updateUnreadState();
            badgeObserver = new ResizeObserver(updateUnreadState);
            badgeObserver.observe(badgeElement);
        };

        customElements.whenDefined("released-badge").then(observeBadge);

        return () => {
            isDisposed = true;
            badgeObserver?.disconnect();
        };
    }, []);

    return (
        <>
            <span className="released-badge-probe" aria-hidden="true">
                <released-badge
                    ref={badgeProbeRef}
                    channel-id={RELEASED_CHANNEL_ID}
                ></released-badge>
            </span>

            {hasUnreadRelease && (
                <button
                    type="button"
                    style={{ width: 'fit-content', marginRight: '0.3rem' }}
                    onClick={handleChangelogClick}
                    aria-label="업데이트 내역 열기"
                >
                    <released-badge channel-id={RELEASED_CHANNEL_ID}></released-badge>
                    <IonIcon
                        name='gift-outline'
                        style={{
                            fontSize: '20px',
                            color: 'var(--text-color)',
                            position: 'relative',
                            top: '2px'
                        }}
                    />
                </button>
            )}
        </>
    );
}

function Header({ title }) {
    const search = useSearch();
    const [version, setVersion] = useState("");
    const [isCompatible, setIsCompatible] = useState(false);
    const [isSearchCompatible, setIsSearchCompatible] = useState(false);
    const [isAgentCompatible, setIsAgentCompatible] = useState(false);

    useEffect(() => {
        const app = getNativeAppFromUserAgent();
        if (app) {
            setVersion(app.version);
            setIsCompatible(isNativeFeatureCompatible("header", app));
            setIsSearchCompatible(isNativeFeatureCompatible("search", app));
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
                        <ChangelogAction />

                        {isSearchCompatible && search?.enabled && (
                            <button
                                type="button"
                                style={{ width: 'fit-content' }}
                                onClick={search.show}
                                aria-label="통합 검색 열기"
                                aria-haspopup="dialog"
                            >
                                <IonIcon name="search-outline" aria-hidden="true"
                                    style={{
                                        fontSize: '20px',
                                        color: 'var(--text-color)',
                                        position: 'relative',
                                        top: '2px'
                                    }} />

                            </button>
                        )}
                        {!isSearchCompatible && isAgentCompatible && (
                            <button type="button" style={{ width: 'fit-content' }} onClick={() => {
                                try { Promise.resolve(KlasNativeBridge.openPage('https://klasplus.yuntae.in/agent')).catch(() => toast('앱을 최신버전으로 업데이트해주세요.')); }
                                catch { toast('앱을 최신버전으로 업데이트해주세요.'); }
                            }} aria-label="AI 챗봇 열기">
                                <img src="/icons/ai-chatbot-animated.svg" className="ai-chatbot-icon" alt="" aria-hidden="true" />
                            </button>
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
