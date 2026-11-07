import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { isDemoSession } from '../lib/core/demoSession';
import { KLAS } from '../lib/core/klas';
import KlasNativeBridge from '../lib/core/klasNativeBridge';

const titles = { task: '첫 번째 프로그래밍 과제', project: '팀 프로젝트', lecture: '프로그래밍 시작하기', quiz: '학습 확인 퀴즈', exam: '모의 평가', discussion: '수업 토론', survey: '수업 설문', plan: '강의계획서', qr: '출입증 및 출석 체험' };

export default function DemoActivity() {
    const { query } = useRouter();
    const feature = Object.hasOwn(titles, query.feature) ? query.feature : 'task';
    const [active, setActive] = useState(false);
    const [text, setText] = useState('');
    const [state, setState] = useState({ submitted: false, progress: 0 });
    const video = useRef(null);
    const [playing, setPlaying] = useState(false);
    const [speed, setSpeed] = useState(1);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const request = (endpoint, body = {}) => KLAS(`https://klas.kw.ac.kr/demo/${endpoint}.do`, '', { feature, ...body });

    useEffect(() => {
        setActive(isDemoSession());
        if (!isDemoSession()) return;
        request('DemoState').then(data => { setState(data); setText(data.text || ''); }).catch(() => setError('데모 데이터를 불러오지 못했어요.'));
        KlasNativeBridge.completePageLoad();
    }, [feature]);

    useEffect(() => { if (video.current) video.current.playbackRate = speed; }, [speed]);

    const save = async () => {
        setBusy(true);
        setError('');
        try {
            const data = await request(feature === 'lecture' ? 'DemoLectureProgress' : 'DemoTaskSave', { text, progress: state.progress });
            setState(data);
            video.current?.pause();
            setPlaying(false);
        } catch { setError('저장하지 못했어요. 다시 시도해 주세요.'); }
        finally { setBusy(false); }
    };

    if (!active) return <main><p>데모 세션에서만 열 수 있어요.</p></main>;
    return <main>
        <h2>{titles[feature]}</h2>
        <p>심사용 예시 데이터예요. 입력한 내용은 학교에 전송되지 않아요.</p>
        <div className="card" style={{ padding: 20 }}>
            {feature === 'lecture' ? <>
                <video ref={video} controls playsInline preload="metadata" src="/demo/lecture.mp4"
                    aria-label="데모 온라인 강의 플레이어" style={{ width: '100%', aspectRatio: '16/9', background: '#15202f' }}
                    onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
                    onTimeUpdate={event => { const v = event.currentTarget; if (v.duration) setState(old => ({ ...old, progress: Math.min(100, v.currentTime / v.duration * 100) })); }}
                    onEnded={() => setState(old => ({ ...old, progress: 100 }))} />
                <h3>변수와 자료형</h3><p>변수는 값을 담는 공간이에요. 정수, 문자열, 참과 거짓을 구분해 사용할 수 있어요.</p>
                <progress aria-label="학습 진행률" max="100" value={state.progress} style={{ width: '100%' }} />
                <p>{Math.floor(state.progress)}% 학습</p>
                <button onClick={() => { const v = video.current; if (!v) return; if (v.paused) v.play().catch(() => setError('재생 버튼을 다시 눌러 주세요.')); else v.pause(); }}>{playing ? '일시 정지' : '학습 시작'}</button>{' '}
                <label>학습 속도 <select value={speed} onChange={event => setSpeed(Number(event.target.value))}><option value="1">1배</option><option value="1.5">1.5배</option><option value="2">2배</option></select></label>
                <p><button disabled={busy} onClick={save}>진행률 저장</button></p>
            </> : feature === 'plan' ? <><h3>컴퓨터프로그래밍 · 3학점</h3><p>담당: 김교수</p><p>변수, 조건문, 반복문, 함수와 자료구조를 배우고 예제 프로그램을 작성해요.</p><p>평가: 과제 30%, 중간평가 30%, 기말평가 30%, 출석 10%</p></> : feature === 'qr' ? <><p>김광운 · 0000000000</p><p>데모 출입증이에요. 실제 출입이나 출석에는 사용할 수 없어요.</p><button onClick={() => setState({ ...state, submitted: true })}>출석 동작 체험</button>{state.submitted && <p role="status">데모 출석을 완료했어요.</p>}</> : <>
                <p>{feature === 'task' || feature === 'project' ? '변수를 사용해 간단한 프로그램을 작성하고 설명을 제출해 보세요.' : '수업에서 배운 내용을 입력해 보세요.'}</p>
                <label htmlFor="demo-answer">내용</label>
                <textarea id="demo-answer" value={text} onChange={event => setText(event.target.value)} rows={6} style={{ width: '100%', boxSizing: 'border-box' }} />
                <button disabled={busy || !text.trim()} onClick={save}>{state.submitted ? '수정 제출' : '제출'}</button>
                {state.submitted && <p role="status">데모 제출을 완료했어요.</p>}
            </>}
            {error && <p role="alert">{error}</p>}
        </div>
    </main>;
}
