export const isDemoSession = () => typeof window !== 'undefined' && window.__klasDemoSession?.version === 1;

if (isDemoSession() && typeof window.fetch === 'function') {
    const originalFetch = window.fetch.bind(window);
    window.fetch = (input, options) => {
        const url = new URL(typeof input === 'string' ? input : input.url, window.location.href);
        if (url.origin === window.location.origin && url.pathname.startsWith('/api/')) {
            if (url.pathname === '/api/crawler/cafeteria') {
                return Promise.resolve(Response.json({ restaurants: [{ name: '함지마루', price: '예시 메뉴', time: '11:30~14:00', weeklyMenu: [{ day: '월', date: '오늘', menu: '데모 정식\n밥 · 국 · 반찬' }] }], weeklyMenu: [] }));
            }
            if (url.pathname === '/api/crawler/kwNotice') {
                return Promise.resolve(Response.json({ items: [{ number: 1, category: '학사', title: '데모 학사 안내', link: '/demo?feature=plan', createdDate: new Date().toISOString().slice(0, 10), author: '학사팀', views: 10 }], more: false }));
            }
            return Promise.resolve(Response.json({ error: 'DEMO_UNSUPPORTED_ENDPOINT' }, { status: 501 }));
        }
        if (url.hostname === 'kw.ac.kr' || url.hostname.endsWith('.kw.ac.kr')) return Promise.reject(new Error('DEMO_NETWORK_BLOCKED'));
        return originalFetch(input, options);
    };
}

export function demoBridgeInvocation(method, args) {
    if (!isDemoSession()) return null;
    const navigate = feature => { window.location.assign(`/demo?feature=${encodeURIComponent(feature)}`); };
    const blocked = () => { window.alert('데모 모드에서는 학교 페이지를 사용할 수 없어요.'); return { value: Promise.resolve() }; };
    if (['openPage', 'openExternalPage', 'openExternalLink', 'openExternalLinkInBrowser'].includes(method)) {
        try { if (new URL(args[0], window.location.href).hostname === 'klas.kw.ac.kr') return blocked(); } catch {}
    }
    if (method === 'openInKLAS') return blocked();
    if (method === 'openLibraryQRSettingsModal' || method === 'setAppLockPassword' || method === 'setAppLockEnabled' && args[0]) {
        window.dispatchEvent(new CustomEvent('klas-demo-settings', { detail: { type: method === 'openLibraryQRSettingsModal' ? 'library' : 'lock' } }));
        return { value: Promise.resolve() };
    }
    if (method === 'evaluteKLASScript') {
        const script = String(args[0]);
        if (!/appModule\.go(Task|Prjct|Quiz|Exam|Survey|Dscsn)\(\)/.test(script)) return blocked();
        navigate(script.includes('goPrjct') ? 'project' : script.includes('goQuiz') ? 'quiz' : script.includes('goExam') ? 'exam' : script.includes('goSurvey') ? 'survey' : script.includes('goDscsn') ? 'discussion' : 'task');
        return { value: Promise.resolve() };
    }
    if (method === 'requestOnlineLecture' || method === 'openOnlineLecture') {
        navigate('lecture');
        return { value: Promise.resolve() };
    }
    if (method === 'openLecturePlan' || method === 'openLecturePlanPage') {
        navigate('plan');
        return { value: Promise.resolve() };
    }
    if (['openLibraryQR', 'openQRScan', 'qrCheckIn'].includes(method)) {
        navigate(method.includes('QR') || method === 'qrCheckIn' ? 'qr' : 'lecture');
        return { value: Promise.resolve() };
    }
    return null;
}
