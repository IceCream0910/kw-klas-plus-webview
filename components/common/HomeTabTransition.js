import { Ssgoi } from '@ssgoi/react';
import { slide } from '@ssgoi/react/view-transitions';
import { useMemo, useState, useSyncExternalStore } from 'react';
import BottomNav from './bottomNav';
import HomeTabHeaderContext from './HomeTabHeaderContext';
import { HeaderBar } from './header';

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';
const CALENDAR_PATH = '/calendar';

function subscribeToMotionPreference(onChange) {
    const query = window.matchMedia(REDUCED_MOTION);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
}

function shouldReduceMotion() {
    return window.matchMedia(REDUCED_MOTION).matches || typeof Element.prototype.animate !== 'function';
}

export default function HomeTabTransition({ pathname, paths, currentTab, children }) {
    const [calendarHost, setCalendarHost] = useState(null);
    const [titleHost, setTitleHost] = useState(null);
    const header = useMemo(() => ({ calendarHost, titleHost }), [calendarHost, titleHost]);
    const reducedMotion = useSyncExternalStore(subscribeToMotionPreference, shouldReduceMotion, () => true);
    const config = useMemo(() => ({
        scrollLock: false,
        transitions: reducedMotion ? [] : [{ ordered: paths, transition: slide() }]
    }), [paths, reducedMotion]);

    return (
        <div className="home-tab-transition">
            <HomeTabHeaderContext.Provider value={header}>
                <div className="home-tab-pages">
                    <Ssgoi config={config}>
                        <div key={pathname} data-ssgoi-transition={pathname}>
                            {children}
                        </div>
                    </Ssgoi>
                </div>
            </HomeTabHeaderContext.Provider>
            <HeaderBar titleRef={setTitleHost} inactive={pathname === CALENDAR_PATH} />
            <div ref={setCalendarHost} className="home-tab-header" />
            <BottomNav currentTab={currentTab} />
        </div>
    );
}
