import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import IonIcon from '@reacticons/ionicons';
import { resultChips } from '../../lib/search/presentation';
import { isNaturalLanguageQuery } from '../../lib/search/queryParser';
import AgentExperience from '../agent/AgentExperience';
import AgentComposer from '../agent/AgentComposer';
import styles from './SearchOverlay.module.css';

const groups = { menu: '메뉴', task: '과제', teamTask: '팀프로젝트', onlineLecture: '온라인 강의', notice: '강의 공지', material: '강의자료', school: '학교 공지' };
export default function SearchOverlay({ closing = false, query, setQuery, onInput, onSubmit, agentDraft, agentContext, onMore, onSourceMore, sources = {}, remoteStatus, more, results, onSelect, onClose, error, snapshot }) {
    const input = useRef(null), panel = useRef(null), composing = useRef(false);
    const [compositionVersion, setCompositionVersion] = useState(0);
    const [mode, setMode] = useState('search'), [agentOpened, setAgentOpened] = useState(false);
    const [agentComposer, setAgentComposer] = useState(null);
    const [dismissedSuggestion, setDismissedSuggestion] = useState(null);
    const submitRef = useRef(onSubmit), lastSubmitted = useRef(null), swipe = useRef(null);
    submitRef.current = onSubmit;
    const submitSearch = () => { if (closing) return; lastSubmitted.current = query; submitRef.current(); };
    useEffect(() => { if (closing) input.current?.blur(); }, [closing]);
    useEffect(() => {
        if (closing || mode !== 'search' || !query.trim()) return;
        const timer = setTimeout(() => { if (lastSubmitted.current !== query) { lastSubmitted.current = query; submitRef.current(); } }, 1500);
        return () => clearTimeout(timer);
    }, [query, compositionVersion, mode, closing]);
    useEffect(() => {
        if (composing.current) return;
        const timer = setTimeout(() => { if (!composing.current) onInput(query); }, 150);
        return () => clearTimeout(timer);
    }, [query, compositionVersion, onInput]);
    useEffect(() => {
        const background = document.getElementById('__next');
        const oldInert = background?.inert;
        const body = document.body, root = document.documentElement;
        const scrollX = window.scrollX, scrollY = window.scrollY;
        const bodyStyles = Object.fromEntries(['position', 'top', 'left', 'width', 'overflow', 'overscrollBehavior'].map(key => [key, body.style[key]]));
        const rootStyles = { overflow: root.style.overflow, overscrollBehavior: root.style.overscrollBehavior };
        if (background) background.inert = true;
        Object.assign(body.style, { position: 'fixed', top: `${-scrollY}px`, left: `${-scrollX}px`, width: '100%', overflow: 'hidden', overscrollBehavior: 'none' });
        Object.assign(root.style, { overflow: 'hidden', overscrollBehavior: 'none' });
        input.current?.focus({ preventScroll: true });
        const viewport = window.visualViewport;
        const layout = () => {
            if (!panel.current) return;
            panel.current.style.height = `${viewport?.height || window.innerHeight}px`;
            panel.current.style.top = `${viewport?.offsetTop || 0}px`;
        };
        layout(); viewport?.addEventListener('resize', layout); viewport?.addEventListener('scroll', layout);
        const keydown = event => {
            if (event.key === 'Escape' && !event.isComposing) { event.preventDefault(); onClose(); }
            if (event.key !== 'Tab') return;
            const controls = [...panel.current.querySelectorAll('button:not([disabled]), input:not([type="file"]), textarea, a[href]')].filter(control => !control.closest('[hidden]'));
            const first = controls[0], last = controls.at(-1);
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
        };
        document.addEventListener('keydown', keydown);
        return () => {
            if (background) background.inert = oldInert;
            Object.assign(body.style, bodyStyles);
            Object.assign(root.style, rootStyles);
            const scrollBehavior = root.style.scrollBehavior;
            root.style.scrollBehavior = 'auto';
            window.scrollTo(scrollX, scrollY);
            root.style.scrollBehavior = scrollBehavior;
            viewport?.removeEventListener('resize', layout); viewport?.removeEventListener('scroll', layout);
            document.removeEventListener('keydown', keydown);
        };
    }, [onClose]);
    const switchMode = next => { setMode(next); if (next === 'agent') setAgentOpened(true); };
    const initial = !query.trim();
    const empty = !initial && results.length === 0 && remoteStatus === 'success' &&
        Object.values(sources).every(source => source.status === 'success') && !error;
    return createPortal(<section ref={panel} className={`${styles.overlay} ${closing ? styles.closing : ''} rr-mask`} role="dialog" aria-modal="true" aria-label="검색 및 에이전트" data-search-overlay data-rybbit-mask
        onTouchStart={event => { const touch = event.touches[0]; swipe.current = touch && touch.clientX <= 28 ? { x: touch.clientX, y: touch.clientY } : null; }}
        onTouchEnd={event => { const start = swipe.current, touch = event.changedTouches[0]; swipe.current = null; if (start && touch && touch.clientX - start.x > 80 && Math.abs(touch.clientY - start.y) < 60) onClose(); }}>
        <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />
        <header className={styles.header}>
            <button className={styles.closeButton} onClick={onClose} type="button" aria-label="검색 닫기"><IonIcon name="close-outline" aria-hidden="true" /></button>
            <div className={styles.tabs} role="tablist" aria-label="검색 모드" onKeyDown={event => {
                if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
                event.preventDefault(); const next = event.key === 'Home' ? 'search' : event.key === 'End' ? 'agent' : mode === 'search' ? 'agent' : 'search';
                switchMode(next); panel.current.querySelector(`#${next}-tab`)?.focus();
            }}>
                <button id="search-tab" type="button" role="tab" tabIndex={mode === 'search' ? 0 : -1} aria-selected={mode === 'search'} aria-controls="search-panel" onClick={() => switchMode('search')}><IonIcon name="search-outline" aria-hidden="true" />검색</button>
                <button id="agent-tab" type="button" role="tab" tabIndex={mode === 'agent' ? 0 : -1} aria-selected={mode === 'agent'} aria-controls="agent-panel" onClick={() => switchMode('agent')}><img
                    src="/icons/ai-chatbot-animated.svg"
                    className="ai-chatbot-icon"
                    alt=""
                    aria-hidden="true"
                />에이전트</button>
            </div>
        </header>
        <div id="search-panel" role="tabpanel" aria-labelledby="search-tab" className={styles.modePanel} hidden={mode !== 'search'}>
            <div className={styles.surface}>
                <div className={`${styles.results} ${initial || empty ? styles.stateResults : ''}`}>
                    {initial && <div className={styles.searchState}>
                        <h2>한 번에 찾아보세요.</h2>
                        <p>KLAS 메뉴부터 강의 별 공지사항, 자료, 과제 등<br />흩어져 있는 정보를 한 번에 검색할 수 있어요.</p>
                    </div>}
                    {empty && <div className={styles.searchState} role="status">
                        <svg className={styles.emptyGraphic} width="120" height="104" viewBox="0 0 120 104" fill="none" aria-hidden="true">
                            <circle cx="53" cy="44" r="35" fill="currentColor" opacity=".04" />
                            <circle cx="53" cy="44" r="25" stroke="currentColor" strokeWidth="2" opacity=".45" />
                            <path d="M71 63L94 86" stroke="currentColor" strokeWidth="7" strokeLinecap="round" opacity=".2" />
                            <path d="M43 44H63" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity=".45" />
                            <path d="M96 24V32M92 28H100M20 78V84M17 81H23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity=".25" />
                            <circle cx="15" cy="29" r="2" fill="currentColor" opacity=".2" />
                        </svg>
                        <h2>검색 결과가 없어요.</h2>
                        <p>다른 키워드나 짧은 검색어로 다시 찾아보세요.</p>
                    </div>}
                    {!initial && Object.entries(groups).map(([kind, title]) => {
                        const rows = results.filter(item => item.kind === kind);
                        const categorySources = Object.entries(sources).filter(([, source]) => source.kind === kind);
                        const loading = kind === 'school' ? remoteStatus === 'loading' : categorySources.some(([, source]) => source.status === 'loading');
                        const loginRequired = categorySources.some(([, source]) => source.status === 'loginRequired');
                        const failed = (kind === 'school' && remoteStatus === 'failed') || categorySources.some(([, source]) => source.status === 'failed');
                        if (!rows.length && !loading && !failed && !loginRequired) return null;
                        return <section key={kind} aria-label={title} aria-busy={loading}><h2>{title} {rows.length > 0 && <span>{rows.length}</span>}{loading && <span className={styles.spinner} role="status" aria-label={`${title} 검색 중`} />}</h2><ul>{rows.map(item => <li key={item.id}>
                            <button type="button" onClick={() => onSelect(item)}><strong>{item.title}</strong><span className={styles.chips}>{resultChips(item).map(chip => <span key={chip.type} className={`${styles.chip} ${chip.type === 'course' ? styles.courseChip : ''}`} style={chip.type === 'course' ? { '--course-hue': chip.hue } : undefined}>{chip.label}</span>)}</span></button>
                        </li>)}</ul>
                            {loading && !rows.length && <div className={styles.skeleton} aria-hidden="true"><i /><i /></div>}
                            {loginRequired ? <p className={styles.hint}>로그인을 확인해 주세요.</p> : failed && <p className={styles.hint}>일부 결과를 불러오지 못했습니다. 다시 검색해 주세요.</p>}
                            {kind === 'school' && more && <button type="button" disabled={loading} onClick={onMore}>더 보기</button>}
                            {categorySources.filter(([, source]) => source.more).map(([id, source]) => <button key={id} type="button" disabled={source.status === 'loading'} onClick={() => onSourceMore(id)}>{source.label} 더 보기</button>)}
                        </section>;
                    })}
                    {error && <p role="alert">{error}</p>}
                </div>
            </div>
        </div>
        <div id="agent-panel" role="tabpanel" aria-labelledby="agent-tab" className={styles.modePanel} hidden={mode !== 'agent'}>{agentOpened && <AgentExperience embedded active={mode === 'agent'} sharedDraft={query} onDraftChange={setQuery} initialContext={agentContext} onComposerChange={setAgentComposer} />}</div>
        <AgentComposer ref={input} mode={mode} {...(mode === 'agent' ? agentComposer || { disabled: true } : { onSubmit: submitSearch })} value={query} onChange={setQuery}
            suggestion={mode === 'search' && isNaturalLanguageQuery(query) && dismissedSuggestion !== query ? <div className={styles.agentSuggestion} role="status">
                <button type="button" onClick={() => switchMode('agent')}><span>에이전트에게 물어보세요.</span></button>
                <button type="button" aria-label="에이전트 제안 닫기" onClick={() => setDismissedSuggestion(query)}><IonIcon name="close-outline" aria-hidden="true" style={{ position: 'relative', top: '2px' }} /></button>
            </div> : null}
            onCompositionStart={() => { composing.current = true; }} onCompositionEnd={() => { composing.current = false; setCompositionVersion(value => value + 1); }} />
    </section>, document.body);
}
