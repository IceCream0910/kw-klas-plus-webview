import { useState, useEffect } from 'react';
import IonIcon from '@reacticons/ionicons';
import Spacer from './spacer';


const LectureNotices = ({ token }) => {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(false);

    const fetchNotices = async (fetchAll = false) => {
        setLoading(true);
        try {
            let response;
            if (process.env.NEXT_PUBLIC_DEVELOPMENT === 'true') {
                // 더미 데이터 생성
                response = {
                    json: async () => ({
                        notices: [
                            {
                                pushSeq: 1,
                                title: "컴퓨터구조",
                                body: "중간고사 시험 일정이 변경되었습니다",
                                registDt: "2024-10-15 09:30"
                            },
                            {
                                pushSeq: 2,
                                title: "자료구조",
                                body: "과제 제출 마감일이 연장되었습니다 (10/25까지)",
                                registDt: "2024-10-14 14:20"
                            },
                            {
                                pushSeq: 3,
                                title: "웹프로그래밍",
                                body: "실습실 변경 안내: 새빛관 201호",
                                registDt: "2024-10-13 16:45"
                            },
                            {
                                pushSeq: 4,
                                title: "알고리즘",
                                body: "팀 프로젝트 발표 순서가 공지되었습니다",
                                registDt: "2024-10-12 11:15"
                            },
                            {
                                pushSeq: 5,
                                title: "운영체제",
                                body: "보강 수업 일정: 10/20(금) 오후 2시",
                                registDt: "2024-10-11 10:00"
                            },
                            {
                                pushSeq: 6,
                                title: "머신러닝",
                                body: "퀴즈 시험 범위 안내 (3-5장)",
                                registDt: "2024-10-10 13:30"
                            }
                        ]
                    })
                };
            } else {
                response = await fetch("/api/lectureNotice", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token, all: fetchAll }),
                });
            }
            const data = await response.json();
            setNotices(data.notices);
        } catch (error) {
            console.error('Error fetching lecture notices:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (!token) return;
        fetchNotices(false);
    }, [token]);

    const handleShowMore = async () => {
        if (expanded) {
            setExpanded(false);
            document.getElementById('notices-section').scrollIntoView({ behavior: 'smooth' });
        } else {
            await fetchNotices(true);
            setExpanded(true);
        }
    };

    if (!loading && (!notices || notices.length === 0)) {
        return (
            <>
                <Spacer y={20} />
                <div className="card non-anim" id="notices" style={{ paddingBottom: '30px' }}>
                    <div className='card-title'>
                        <span>강의 알림</span>
                    </div>
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', justifyContent: 'center', marginTop: '10px', opacity: '.3' }}>
                        <svg width="64" height="41" viewBox="0 0 64 41" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: '5px' }}>
                            <g transform="translate(0 1)" fill="none" fillRule="evenodd">
                                <g fillRule="nonzero" stroke="var(--text-color)">
                                    <path d="M55 12.76L44.854 1.258C44.367.474 43.656 0 42.907 0H21.093c-.749 0-1.46.474-1.947 1.257L9 12.761V22h46v-9.24z"></path>
                                    <path d="M41.613 15.931c0-1.605.994-2.93 2.227-2.931H55v18.137C55 33.26 53.68 35 52.05 35h-40.1C10.32 35 9 33.259 9 31.137V13h11.16c1.233 0 2.227 1.323 2.227 2.928v.022c0 1.605 1.005 2.901 2.237 2.901h14.752c1.232 0 2.237-1.308 2.237-2.913v-.007z" fill="#fafafa"></path>
                                </g>
                            </g>
                        </svg>
                        <span>최근 받은 알림이 없어요</span>
                    </div >
                </div >
            </>
        );
    }

    return (
        <>
            <div id="notices-section" />
            <Spacer y={20} />
            <div className="card non-anim" style={{ paddingBottom: '20px' }}>
                <div className='card-title'>
                    <span>강의 알림</span>
                </div>

                <div className='card-content'>
                    {notices && expanded ? (
                        notices.map((notice, index) => (
                            <div key={index} className="notice-item" onClick={() => typeof Android !== 'undefined' && Android.openPage(`https://klas.kw.ac.kr/?redirectUrl=/mst/cmn/login/PushLinkForm.do?pushSeq=${notice.pushSeq}`)}>
                                <span>{notice.title} · <span><b>{notice.body}</b></span></span><br />
                                <span style={{ opacity: 0.6, fontSize: '12px' }}>{notice.registDt}</span>
                                {index !== (expanded ? notices.length : 5) - 1 && index !== notices.length - 1 && <hr />}

                            </div>
                        ))
                    )
                        : (
                            notices.slice(0, Math.min(5, notices.length)).map((notice, index) => (
                                <div key={index} className="notice-item" onClick={() => typeof Android !== 'undefined' && Android.openPage(`https://klas.kw.ac.kr/?redirectUrl=/mst/cmn/login/PushLinkForm.do?pushSeq=${notice.pushSeq}`)}>
                                    <span>{notice.title} · <span><b>{notice.body}</b></span></span><br />
                                    <span style={{ opacity: 0.6, fontSize: '12px' }}>{notice.registDt}</span>
                                    {index !== (expanded ? notices.length : 5) - 1 && index !== notices.length - 1 && <hr />}
                                </div>
                            ))
                        )
                    }


                    {loading && (<>
                        <div className="skeleton" style={{ height: '50px', width: '100%', marginBottom: '15px' }} />
                        <div className="skeleton" style={{ height: '50px', width: '100%', marginBottom: '15px' }} />
                        <div className="skeleton" style={{ height: '50px', width: '100%' }} />
                    </>
                    )}

                    {
                        <div style={{ textAlign: 'center', marginTop: '20px' }}>
                            <button
                                onClick={handleShowMore}
                                disabled={loading}
                                style={{ width: '100%', padding: '10px 0 0 0', textAlign: 'center', opacity: '.7', border: 'none', cursor: 'pointer', fontSize: '13px' }}
                            >
                                {loading ? '로딩 중...' : expanded ? <>
                                    <IonIcon name='chevron-up-outline' style={{ position: 'relative', top: '2px' }} /><br />접기
                                </> : <>
                                    <IonIcon name='chevron-down-outline' style={{ position: 'relative', top: '2px' }} /><br />더보기
                                </>}
                            </button>
                        </div>
                    }
                </div>
            </div>
        </>
    );
};

export default LectureNotices;