import { useContext, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from 'react-dom';
import IonIcon from "@reacticons/ionicons";
import Spacer from "../common/spacer";
import KlasNativeBridge from "../../lib/core/klasNativeBridge";
import { getNativeAppFromUserAgent, isNativeFeatureCompatible } from "../../lib/core/nativeApp";
import toast, { Toaster } from 'react-hot-toast';
import GradualBlur from "../common/GradualBlur";
import { useSearch } from '../search/SearchProvider';
import HomeTabHeaderContext from './HomeTabHeaderContext';

const RELEASED_CHANNEL_ID = "b8696cec-f681-43a8-9baa-d5737483003e";
const subscribeToUserAgent = () => () => {};
const getUserAgent = () => navigator.userAgent;
const getServerUserAgent = () => null;

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
                // The calendar hides the header without changing the unread state.
                if (badgeElement.closest('[hidden]')) return;
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
                    className="app-header-changelog"
                    onClick={handleChangelogClick}
                    aria-label="업데이트 내역 열기"
                >
                    <span className="app-header-changelog-dot" aria-hidden="true" />
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

function useHeaderApp() {
    const userAgent = useSyncExternalStore(subscribeToUserAgent, getUserAgent, getServerUserAgent);
    return userAgent ? getNativeAppFromUserAgent() : null;
}

export function HeaderBar({ title, titleRef, inactive = false }) {
    const search = useSearch();
    const app = useHeaderApp();
    if (!isNativeFeatureCompatible("header", app)) {
        return null;
    }

    const isSearchCompatible = isNativeFeatureCompatible("search", app);
    const isAgentCompatible = isNativeFeatureCompatible("agent", app);
    return (
        <>
            <Toaster position="bottom-center" />
            <div className="app-header" hidden={inactive}>
                <div className="app-header-inner">
                    <div ref={titleRef} className="app-header-title" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
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
        </>
    );
}

function Header({ title }) {
    const homeTabHeader = useContext(HomeTabHeaderContext);
    const app = useHeaderApp();
    if (!isNativeFeatureCompatible("header", app)) return null;

    const titleHost = homeTabHeader?.titleHost;
    return (
        <>
            {homeTabHeader ? titleHost && createPortal(title, titleHost) : <HeaderBar title={title} />}
            <Spacer y={75} className="app-header-spacer" />
        </>
    );
}

export default Header;
