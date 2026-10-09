import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import KlasNativeBridge from '../../lib/core/klasNativeBridge';
import { SearchCache } from '../../lib/search/cache';
import { localSearch, parseQuery } from '../../lib/search/queryParser';
import { SearchCoordinator } from '../../lib/search/coordinator';
import { getSearchSession, setSearchSession } from '../../lib/search/session';
import { createAgentContext, agentSearchContext } from '../../lib/search/agentContext';
import { menuItems } from '../../lib/profile/menuItems';
const SearchOverlay = dynamic(() => import('./SearchOverlay'), { ssr: false });

const SearchContext = createContext(null);
const menus = menuItems.flatMap(group => group.items.map(item => ({ id: `menu:${item.url}`, kind: 'menu', title: item.name, courseName: group.title, sourceRef: { url: item.url } })));
const homePaths = new Set(['/feed', '/profile', '/calendar', '/timetableTab']);
export const useSearch = () => useContext(SearchContext);

export default function SearchProvider({ children }) {
    const router = useRouter();
    const [open, setOpen] = useState(false), [query, setQuery] = useState(''), [committed, setCommitted] = useState('');
    const [closing, setClosing] = useState(false);
    const closeTimer = useRef(null);
    const [items, setItems] = useState([]), [snapshot, setSnapshot] = useState(null), [error, setError] = useState('');
    const [remote, setRemote] = useState([]), [remoteStatus, setRemoteStatus] = useState('idle'), [more, setMore] = useState(false);
    const coordinator = useRef(null), submitted = useRef(null), page = useRef(0);
    const [sources, setSources] = useState({});
    const boardPages = useRef({});
    const cache = useRef(null), generation = useRef(-1), scope = useRef(''), epoch = useRef(0), trigger = useRef(null);
    const receiveVersion = useRef(0);
    const close = useCallback(() => {
        coordinator.current?.cancel(); setClosing(true); setError('');
        clearTimeout(closeTimer.current);
        const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 700;
        closeTimer.current = setTimeout(() => { setOpen(false); setClosing(false); }, duration);
        setRemoteStatus(status => status === 'loading' ? 'cancelled' : status);
        setSources(previous => Object.fromEntries(Object.entries(previous).map(([id, source]) => [id, source.status === 'loading' ? { ...source, status: 'cancelled' } : source])));
    }, []);
    useEffect(() => {
        const store = new SearchCache(); cache.current = store;
        coordinator.current = new SearchCoordinator();
        const receive = async json => {
            let data;
            try { data = typeof json === 'string' ? JSON.parse(json) : json; } catch { return; }
            if (data?.schemaVersion !== 1 || typeof data.accountScope !== 'string' || !data.accountScope ||
                typeof data.term !== 'string' || !Number.isSafeInteger(data.generation) || !Array.isArray(data.batches)) return;
            const key = `${data.accountScope}/${data.term}`;
            if (scope.current === key && data.generation < generation.current) return;
            const version = ++receiveVersion.current;
            if (scope.current !== key) {
                ++epoch.current;
                if (scope.current) { setQuery(''); setCommitted(''); setOpen(false); }
                scope.current = key; generation.current = -1;
                setItems([]); setSnapshot(null);
                coordinator.current.clear(); setRemote([]); setRemoteStatus('idle'); setMore(false); submitted.current = null;
                setSources({}); boardPages.current = {};
            }
            generation.current = data.generation;
            await store.setScope(data.accountScope, data.term);
            if (version !== receiveVersion.current) return;
            for (const batch of data.batches) if (Array.isArray(batch.items)) store.replaceBatch(batch, data.term);
            setSnapshot(data); setItems(store.all());
        };
        window.receiveSearchData = receive;
        window.closeSearchOverlay = close;
        const invalidate = () => {
            ++epoch.current; scope.current = ''; generation.current = -1;
            ++receiveVersion.current;
            setSnapshot(null); setItems([]); setQuery(''); setCommitted(''); close(); void store.clear();
            coordinator.current.clear(); setRemote([]); setRemoteStatus('idle'); submitted.current = null;
            setSearchSession(''); setSources({}); boardPages.current = {};
        };
        window.addEventListener('klas-search-reset', invalidate);
        const request = () => {
            if (!homePaths.has(window.location.pathname)) return;
            if (typeof window.receiveToken !== 'function') window.receiveToken = setSearchSession;
            try { Promise.resolve(KlasNativeBridge.requestSearchData()).catch(() => {}); } catch { /* 구 앱은 메뉴 검색만 제공한다. */ }
        };
        request();
        window.addEventListener('pageshow', request);
        return () => {
            clearTimeout(closeTimer.current);
            ++epoch.current; delete window.receiveSearchData; delete window.closeSearchOverlay;
            coordinator.current.clear();
            window.removeEventListener('klas-search-reset', invalidate); window.removeEventListener('pageshow', request);
        };
    }, [close]);
    useEffect(() => {
        const route = () => close(); router.events.on('routeChangeStart', route);
        return () => router.events.off('routeChangeStart', route);
    }, [router.events, close]);
    useEffect(() => {
        if (!homePaths.has(router.pathname)) return;
        try { Promise.resolve(KlasNativeBridge.setSearchOverlayOpen(open)).catch(() => {}); } catch { /* 구 앱에는 신규 메서드가 없다. */ }
        if (!open) trigger.current?.focus();
        return () => { if (open) { try { Promise.resolve(KlasNativeBridge.setSearchOverlayOpen(false)).catch(() => {}); } catch {} } };
    }, [open, router.pathname]);
    const results = useMemo(() => {
        const local = localSearch([...menus, ...items], committed);
        const all = new Map(local.map(item => [item.id, item]));
        if (submitted.current?.raw === committed) for (const item of remote) all.set(item.id, item);
        return [...all.values()];
    }, [items, committed, remote]);
    const submit = async (next = false, onlySource = null) => {
        const runner = coordinator.current;
        if (!runner) return;
        if (!next) {
            runner.cancel();
            const courses = [...new Map((snapshot?.batches || []).map(batch => [batch.courseId, { courseId: batch.courseId, courseName: batch.courseName }])).values()];
            submitted.current = parseQuery(query, courses); page.current = 0; setRemote([]); setCommitted(query); setSources({}); boardPages.current = {};
        }
        const parsed = submitted.current;
        if (!parsed) return;
        if (next && parsed.raw !== query) return;
        const version = runner.generation, currentEpoch = epoch.current;
        if (!onlySource) setRemoteStatus('loading'); setError('');
        const matchesDate = item => {
            if (!parsed.since) return true;
            const date = Date.parse(`${item.publishedAt?.slice(0, 10)}T00:00:00+09:00`);
            return date >= parsed.since && date < parsed.until;
        };
        const mergeResponse = response => {
            setRemote(previous => [...new Map([...previous, ...response.items.filter(matchesDate)].map(item => [item.id, item])).values()].slice(0, 3000));
            if (snapshot) { cache.current.merge(response.items); setItems(cache.current.all()); }
        };
        const boardJobs = next && !onlySource ? [] : parsed.courses.flatMap(course => parsed.kinds.map(kind => ({ course, kind, id: `${course.courseId}/${kind}` })))
            .filter(source => !onlySource || source.id === onlySource);
        const jobs = boardJobs.map(source => ({ id: source.id, kind: source.kind, courseId: source.course.courseId, courseName: source.course.courseName, page: boardPages.current[source.id] || 0 }));
        const labels = new Map();
        for (const source of boardJobs) {
            const label = `${source.course.courseName} · ${source.kind === 'notice' ? '공지' : '자료실'}`;
            labels.set(source.id, label);
            setSources(previous => ({ ...previous, [source.id]: { label, kind: source.kind, status: 'loading' } }));
        }
        if (!onlySource) jobs.push({ id: 'school', kind: 'school', page: page.current });
        await runner.batch({ scope: scope.current, term: snapshot?.term || '', token: getSearchSession(), keyword: parsed.keyword, sources: jobs, onResult: response => {
            if (version !== runner.generation || currentEpoch !== epoch.current) return;
            if (response.status === 'success') mergeResponse(response);
            if (response.id === 'school') {
                if (response.status === 'success') { setMore(response.more); page.current++; }
                setRemoteStatus(response.status === 'success' ? 'success' : 'failed');
            } else {
                const source = jobs.find(job => job.id === response.id);
                if (response.status === 'success') boardPages.current[response.id] = source.page + 1;
                setSources(previous => ({ ...previous, [response.id]: { label: labels.get(response.id), kind: source.kind, status: response.status, more: response.more } }));
            }
        } });
    };
    const show = event => {
        clearTimeout(closeTimer.current); setClosing(false);
        coordinator.current?.cancel();
        setQuery(''); setCommitted(''); setRemote([]); setRemoteStatus('idle'); setMore(false); setError('');
        submitted.current = null; page.current = 0; boardPages.current = {}; setSources({});
        trigger.current = event.currentTarget; setItems(cache.current?.all() || []); setOpen(true);
        try { Promise.resolve(KlasNativeBridge.requestSearchData()).catch(() => {}); } catch { /* 구 앱은 메뉴 검색만 제공한다. */ }
    };
    const select = async item => {
        setError('');
        try {
            if (item.kind === 'menu') await KlasNativeBridge.openPage(item.sourceRef.url);
            else if (item.kind === 'school') {
                const url = new URL(item.sourceRef.url);
                if (url.origin !== 'https://www.kw.ac.kr' || url.pathname !== '/ko/life/notice.jsp') throw new Error();
                await KlasNativeBridge.openExternalPage(url.href);
            }
            else {
                if (!snapshot || item.term !== snapshot.term) throw new Error();
                if (item.kind === 'notice' || item.kind === 'material') {
                    await KlasNativeBridge.openSearchBoard(item.kind, item.term, item.courseId, item.sourceRef.boardNo, item.sourceRef.masterNo);
                    return;
                }
                const paths = { task: 'TaskStdPage.do', teamTask: 'PrjctStdPage.do', onlineLecture: 'OnlineCntntsStdPage.do' };
                if (!paths[item.kind]) throw new Error();
                await KlasNativeBridge.evaluate(`/std/lis/evltn/${paths[item.kind]}`, snapshot.term, item.courseId);
            }
        } catch { setError('원본을 열지 못했습니다. 앱 연결을 확인하고 다시 시도해 주세요.'); }
    };
    return <SearchContext.Provider value={{ show, enabled: homePaths.has(router.pathname) }}>
        {children}
        {open && <SearchOverlay closing={closing} query={query} setQuery={setQuery} onInput={setCommitted} results={results} onSelect={select} onClose={close}
            onSubmit={() => submit()} agentDraft={query} agentContext={snapshot && query.trim() ? agentSearchContext(createAgentContext(query, snapshot.term, results)) : null} onMore={() => submit(true)} onSourceMore={id => submit(true, id)} sources={submitted.current?.raw === query ? sources : {}} remoteStatus={submitted.current?.raw === query ? remoteStatus : 'idle'} more={more && submitted.current?.raw === query} error={error} snapshot={snapshot} />}
    </SearchContext.Provider>;
}
