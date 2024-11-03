import { useEffect, useState } from 'react';
import Spacer from './components/spacer';
import IonIcon from '@reacticons/ionicons';
import { useRouter } from 'next/router';

export default function LectureHome() {
    const router = useRouter();
    const [isValid, setIsValid] = useState(false);
    const [data, setData] = useState(null);
    const [searchMode, setSearchMode] = useState(true);
    const [token, setToken] = useState(null);

    const [gwamokList, setGwamokList] = useState([]);
    const [hakgwaList, setHakgwaList] = useState([]);
    const [majorList, setMajorList] = useState([]);

    const [year, setYear] = useState(new Date().getFullYear());
    const [hakgi, setHakgi] = useState(1);
    const [name, setName] = useState('');
    const [professor, setProfessor] = useState('');
    const [selectedGwamok, setSelectedGwamok] = useState('');
    const [selectedHakgwa, setSelectedHakgwa] = useState('');
    const [selectedMajor, setSelectedMajor] = useState('');
    const [isMy, setIsMy] = useState(false);

    useEffect(() => {
        window.receiveToken = function (receivedToken) {
            if (!receivedToken) return;
            setToken(receivedToken);

            fetchGwamokList(receivedToken);
            fetchHakgwaList(receivedToken);
        }

        // 현재 날짜 기준으로 학기 초기값 설정 (8월 이전 1학기, 8월 이후 2학기)
        const currentMonth = new Date().getMonth();
        if (currentMonth < 8) {
            setHakgi(1);
        } else {
            setHakgi(2);
        }

        //Android.completePageLoad();
        window.receiveToken('MmRlOWEzODItOWQ3ZC00YzQ2LWE5OTQtNTg3N2I1YTQ2NDAw')
    }, []);

    useEffect(() => {
        if (router.query.result && !isValid) {
            setSearchMode(true);
            return;
        }
        setSearchMode(!router.query.result);
    }, [router.query]);

    const fetchGwamokList = async (currentToken) => {
        const response = await fetch("/api/searchLecturePlan/gwamokList", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: currentToken }),
        });
        const data = await response.json();
        setGwamokList(data);
    };

    const fetchHakgwaList = async (currentToken) => {
        const response = await fetch("/api/searchLecturePlan/hakgwaList", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: currentToken, year, hakgi }),
        });
        const data = await response.json();
        setHakgwaList(data);
    };

    const fetchMajorList = async (hakgwa) => {
        const response = await fetch("/api/searchLecturePlan/majorList", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, hakgwa }),
        });
        const data = await response.json();
        setMajorList(data);
    };

    const handleGwamokChange = (value) => {
        setSelectedGwamok(value);
        setSelectedHakgwa('');
        setSelectedMajor('');
    };

    const handleHakgwaChange = (value) => {
        setSelectedHakgwa(value);
        setSelectedGwamok('');
        if (value) {
            fetchMajorList(value);
        } else {
            setSelectedMajor('');
            setMajorList([]);
        }
    };

    const search = async () => {
        if (!name && !professor && !selectedGwamok && !selectedHakgwa && !isMy) {
            alert('과목명 또는 교수명을 입력하지 않은 경우 반드시 공통 과목이나 학과를 선택하셔야 합니다.');
            return;
        }

        setIsValid(true);

        router.push({
            pathname: router.pathname,
            query: { result: 'true' }
        });

        const response = await fetch("/api/searchLecturePlan/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                token,
                year,
                hakgi,
                name,
                professor,
                gwamok: selectedGwamok,
                hakgwa: selectedHakgwa,
                major: selectedMajor,
                isMy
            }),
        });
        const responseData = await response.json();
        setData(responseData);
    };

    const openLecturePlan = (id) => () => {
        try {
            Android.openLecturePlanPage(id);
        } catch {
            Android.openPage(`https://klas.kw.ac.kr/std/cps/atnlc/popup/LectrePlanStdView.do?selectSubj=${id}`);
        }
    };

    const backToSearch = () => {
        router.back();
    };

    return (
        <main>
            <Spacer y={5} />
            <h2>강의계획서 조회
                <button onClick={() => Android.openPage("https://klas.kw.ac.kr/std/cps/atnlc/LectrePlanStdPage.do")}
                    style={{ float: 'right', border: '1px solid var(--card-background)', width: 'fit-content', fontSize: '14px', marginTop: '-5px', borderRadius: '20px', padding: '10px 15px' }}>
                    KLAS에서 열기
                </button>
            </h2>
            <Spacer y={30} />
            {searchMode ? (
                <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                        <select
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            style={{ width: '100%', padding: '10px', fontSize: '16px', borderRadius: '10px', border: '1px solid var(--card-background)' }}>
                            {[...Array(11)].map((_, index) => (
                                <option key={index} value={new Date().getFullYear() - index}>
                                    {new Date().getFullYear() - index}년
                                </option>
                            ))}
                        </select>

                        <select
                            value={hakgi}
                            onChange={(e) => setHakgi(e.target.value)}
                            style={{ width: '100%', padding: '10px', fontSize: '16px', borderRadius: '10px', border: '1px solid var(--card-background)' }}>
                            <option value={1}>1학기</option>
                            <option value={3}>여름학기</option>
                            <option value={2}>2학기</option>
                            <option value={4}>겨울학기</option>
                        </select>
                    </div>
                    <Spacer y={10} />

                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="과목명"
                        style={{ width: '100%', padding: '10px', fontSize: '16px', borderRadius: '10px', border: '1px solid var(--card-background)' }}
                    />
                    <Spacer y={10} />
                    <input
                        type="text"
                        value={professor}
                        onChange={(e) => setProfessor(e.target.value)}
                        placeholder="교수명"
                        style={{ width: '100%', padding: '10px', fontSize: '16px', borderRadius: '10px', border: '1px solid var(--card-background)' }}
                    />
                    <Spacer y={10} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                        <select
                            value={selectedGwamok}
                            onChange={(e) => handleGwamokChange(e.target.value)}
                            style={{ width: '100%', padding: '10px', fontSize: '16px', borderRadius: '10px', border: '1px solid var(--card-background)' }}>
                            <option value="">공통과목 전체</option>
                            {gwamokList.map((item) => (
                                <option key={item.code} value={item.code}>
                                    {item.codeName1}
                                </option>
                            ))}
                        </select>

                        <select
                            value={selectedHakgwa}
                            onChange={(e) => handleHakgwaChange(e.target.value)}
                            style={{ width: '100%', padding: '10px', fontSize: '16px', borderRadius: '10px', border: '1px solid var(--card-background)' }}>
                            <option value="">학과 전체</option>
                            {hakgwaList.map((item) => (
                                <option key={item.classCode} value={item.classCode}>
                                    {item.openMajorName}
                                </option>
                            ))}
                        </select>

                        <select
                            value={selectedMajor}
                            onChange={(e) => setSelectedMajor(e.target.value)}
                            style={{ width: '100%', padding: '10px', fontSize: '16px', borderRadius: '10px', border: '1px solid var(--card-background)' }}>
                            <option value="">전공 전체</option>
                            {majorList.map((item) => (
                                <option key={item.code} value={item.code}>
                                    {item.codeName1}
                                </option>
                            ))}
                        </select>
                    </div>
                    <Spacer y={10} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label htmlFor="my" style={{ opacity: .7, fontSize: '14px' }}>내가 수강한 과목 중에서 검색</label>
                        <label className="switch" style={{ transform: 'scale(0.8)' }}>
                            <input
                                id="my"
                                type="checkbox"
                                checked={isMy}
                                onChange={(e) => setIsMy(e.target.checked)}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>

                    <div className='bottom-sheet-footer'>
                        <button onClick={search} style={{ background: 'var(--button-background)' }}>조회</button>
                    </div>
                </>
            ) : (
                <>
                    {!data && (<>
                        <div className="skeleton" style={{ height: '80px', width: '100%' }} />
                        <Spacer y={20} />
                        <div className="skeleton" style={{ height: '80px', width: '100%' }} />
                        <Spacer y={20} />
                        <div className="skeleton" style={{ height: '80px', width: '100%' }} />
                        <Spacer y={20} />
                        <div className="skeleton" style={{ height: '80px', width: '100%' }} />
                        <Spacer y={20} />
                        <div className="skeleton" style={{ height: '80px', width: '100%' }} />
                    </>)}

                    {data && data.length === 0 && (
                        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', justifyContent: 'center', marginTop: '10px', opacity: '.3' }}>
                            <svg width="64" height="41" viewBox="0 0 64 41" xmlns="http://www.w3.org/2000/svg">
                                <g transform="translate(0 1)" fill="none" fillRule="evenodd">
                                    <g fillRule="nonzero" stroke="var(--text-color)">
                                        <path d="M55 12.76L44.854 1.258C44.367.474 43.656 0 42.907 0H21.093c-.749 0-1.46.474-1.947 1.257L9 12.761V22h46v-9.24z"></path>
                                        <path d="M41.613 15.931c0-1.605.994-2.93 2.227-2.931H55v18.137C55 33.26 53.68 35 52.05 35h-40.1C10.32 35 9 33.259 9 31.137V13h11.16c1.233 0 2.227 1.323 2.227 2.928v.022c0 1.605 1.005 2.901 2.237 2.901h14.752c1.232 0 2.237-1.308 2.237-2.913v-.007z" fill="#fafafa"></path>
                                    </g>
                                </g>
                            </svg>
                            <span>조회된 데이터가 없습니다</span>
                        </div>)}

                    {data && data.map((item, index) => (
                        <div key={index} className={(item.summary && !item.closeOpt) ? "card" : "card non-anim"} style={{ padding: "10px 15px", opacity: (!item.summary || item.closeOpt) ? 0.5 : 1, marginBottom: '15px' }}
                            onClick={item.summary ? openLecturePlan(`U${item.thisYear}${item.hakgi}${item.openGwamokNo}${item.openMajorCode}${item.bunbanNo}${item.openGrade}`) : null}>
                            <span style={{ fontSize: '16px' }}><b>{item.gwamokKname}
                                {item.closeOpt !== null && "(폐강)"}
                                {!item.summary && "(미입력)"}
                            </b></span>&nbsp;
                            <span style={{ opacity: .8, fontSize: '16px' }}>({item.openMajorCode}-{item.openGrade}-{item.openGwamokNo}-{item.bunbanNo})</span>
                            <Spacer y={1} />
                            <span>
                                <IonIcon style={{ fontSize: '14px', position: 'relative', top: '2px', opacity: .5 }} name='person-outline' />
                                <span style={{ fontSize: '14px', marginLeft: '5px', opacity: .8 }}>{item.memberName}</span>
                            </span><br />
                            <span style={{ fontSize: '15px' }}>
                                <IonIcon style={{ fontSize: '13px', position: 'relative', top: '2px', opacity: .5 }} name='time-outline' />
                                <span style={{ fontSize: '13px', marginLeft: '5px', opacity: .5 }}>{item.codeName1} | {item.hakjumNum}학점/{item.sisuNum}시간</span>
                            </span>
                            <Spacer y={5} />
                        </div>
                    ))}
                    <Spacer y={80} />

                    <div className='bottom-sheet-footer' style={{ position: 'fixed', bottom: '0' }}>
                        <button onClick={backToSearch} style={{ background: 'var(--button-background)' }}>다시 검색</button>
                    </div>
                </>
            )}
        </main>
    );
}