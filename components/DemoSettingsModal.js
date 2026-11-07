import { useEffect, useRef, useState } from 'react';
import { isDemoSession } from '../lib/core/demoSession';

export default function DemoSettingsModal() {
    const [type, setType] = useState(null);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');
    const dialog = useRef(null);
    useEffect(() => {
        const open = event => { if (isDemoSession()) { setSaved(false); setError(''); setType(event.detail.type); } };
        window.addEventListener('klas-demo-settings', open);
        return () => window.removeEventListener('klas-demo-settings', open);
    }, []);
    useEffect(() => { if (type) dialog.current?.showModal(); }, [type]);
    if (!type) return null;
    if (type === 'unavailable') return <dialog ref={dialog} onCancel={() => setType(null)} onClose={() => setType(null)} aria-label="데모 모드 안내" style={{ background: 'var(--background)', color: 'var(--text-color)', border: 0, borderRadius: 20, width: 'min(420px, 85vw)' }}>
        <p>데모 모드에서는 학교 페이지를 사용할 수 없어요.</p>
        <button type="button" autoFocus onClick={() => { dialog.current.close(); setType(null); }}>확인</button>
    </dialog>;
    const library = type === 'library';
    const save = async event => {
        event.preventDefault();
        if (!isDemoSession()) { dialog.current?.close(); setType(null); return; }
        const values = new FormData(event.currentTarget);
        if (!library && values.get('password') !== values.get('confirm')) { setError('비밀번호가 일치하지 않아요.'); return; }
        if (library) sessionStorage.setItem('demo-library-settings', JSON.stringify({ student: values.get('student'), phone: values.get('phone') }));
        else {
            // 데모 PIN은 저장하지 않고 설정 상태만 모의한다.
            const native = await import('../lib/klas/nativeTransport');
            await native.nativeKlasRequest('/demo/DemoLockSave.do', {});
            window.dispatchEvent(new Event('klas-demo-settings-changed'));
        }
        setSaved(true);
    };
    return <dialog ref={dialog} onCancel={() => setType(null)} onClose={() => setType(null)} style={{ background: 'var(--background)', color: 'var(--text-color)', border: 0, borderRadius: 20, width: 'min(420px, 85vw)' }}>
        <h2>{library ? '중앙도서관 출입증 설정' : '앱 잠금 설정'}</h2>
        <p>데모 설정이에요. 실제 계정과 기기 설정에는 적용되지 않아요.</p>
        <form onSubmit={event => save(event).catch(() => setError('저장하지 못했어요. 다시 시도해 주세요.'))}>
            {library && <><label>학번<input name="student" defaultValue="0000000000" inputMode="numeric" required /></label><label>전화번호<input name="phone" type="tel" required /></label></>}
            <label>{library ? '중앙도서관 비밀번호' : '비밀번호'}<input name="password" type="password" required minLength={library ? 1 : 4} /></label>
            {!library && <label>비밀번호 확인<input name="confirm" type="password" required minLength={4} /></label>}
            {error && <p role="alert">{error}</p>}
            {saved && <p role="status">데모 설정을 저장했어요.</p>}
            <button type="submit">저장</button><button type="button" onClick={() => { dialog.current.close(); setType(null); }}>닫기</button>
        </form>
    </dialog>;
}
