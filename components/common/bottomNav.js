import { useEffect, useState } from "react";
import IonIcon from "@reacticons/ionicons";
import Spacer from "../common/spacer";
import { useRouter } from "next/router";
import GradualBlur from "../common/GradualBlur";

const TAB_ITEMS = [
    { key: "feed", label: "피드", icon: "newspaper-outline", href: "/feed" },
    { key: "timetable", label: "시간표", icon: "calendar-outline", href: "/timetableTab" },
    { key: "calendar", label: "캘린더", icon: "today-outline", href: "/calendar" },
    { key: "menu", label: "전체", icon: "grid-outline", href: "/profile" }
];

const checkAppCompatibility = (version) => {
    if (!version) return false;
    return version >= 24;
};

const getAppVersionFromUserAgent = () => {
    const userAgent = navigator.userAgent;
    const match = userAgent.match(/AndroidApp_v(\d+)/);
    return match ? parseInt(match[1], 10) : null;
};

function BottomNav({ currentTab }) {
    const [isCompatible, setIsCompatible] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const appVersion = getAppVersionFromUserAgent();
        if (appVersion) {
            setIsCompatible(checkAppCompatibility(appVersion));
        }
    }, []);

    const handleTabClick = (tab) => {
        if (tab) {
            router.push(tab.href);
            try {
                Android.performHapticFeedback("CLOCK_TICK");
            } catch (error) { }
        }
    };

    if (!isCompatible) {
        return null;
    }


    return (
        <>
            <style jsx>{`
                .bottom-nav-tab-button:active {
                    transform: scale(1.05, 0.85) !important;
                }
            `}</style>
            <nav
                style={{
                    position: 'fixed',
                    left: 0,
                    bottom: 0,
                    width: '100%',
                    padding: '10px 16px calc(12px + env(safe-area-inset-bottom, 0px))',
                    boxSizing: 'border-box',
                    zIndex: 500
                }}
            >
                <div style={{
                    display: 'flex', gap: '8px', justifyContent: 'center', position: 'fixed',
                    left: 0,
                    bottom: 0,
                    width: '100%',
                    padding: '10px 16px calc(12px + env(safe-area-inset-bottom, 0px))',
                    background: 'linear-gradient(to top, var(--background) 0%, transparent 100%)',
                    boxSizing: 'border-box',
                    zIndex: 9999
                }}>
                    {TAB_ITEMS.map((tab) => {
                        const isActive = tab.key === currentTab;
                        return (
                            <button
                                key={tab.key}
                                type="button"
                                className="bottom-nav-tab-button"
                                onClick={() => handleTabClick(tab)}
                                aria-label={tab.label}
                                aria-current={isActive ? 'page' : undefined}
                                style={{
                                    width: '100px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '10px 0 8px',
                                    borderRadius: '14px',
                                    backgroundColor: isActive ? 'var(--card-background)' : 'transparent',
                                    color: isActive ? 'var(--text-color)' : 'var(--text-color-transparent)',
                                    transition: 'transform 0.1s ease-out',
                                }}
                            >
                                <IonIcon
                                    name={tab.icon}
                                    style={{
                                        fontSize: '22px',
                                        color: isActive ? 'var(--red)' : 'var(--text-color-transparent)'
                                    }}
                                />
                                <span style={{ fontSize: '12px', fontWeight: isActive ? 700 : 500 }}>
                                    {tab.label}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <GradualBlur
                    position="bottom"
                    height="8rem"
                    strength={1.5}
                />
            </nav>
        </>
    );
}

export default BottomNav;
