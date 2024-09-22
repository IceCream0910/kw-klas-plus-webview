import IonIcon from '@reacticons/ionicons';
import React, { useEffect, useState } from 'react';

const LectureNotices = ({ notices, loading }) => {
    const [showAll, setShowAll] = useState(false);

    const handleShowMore = () => {
        setShowAll(!showAll);
    };

    const handleCollapse = () => {
        setShowAll(false);
    };

    useEffect(() => {
        if (!showAll) {
            document.getElementById('notices').scrollIntoView({ behavior: 'smooth' });
        }
    }, [showAll]);


    if (loading) {
        return (
            <div className="card non-anim" id="notices" style={{ paddingBottom: '20px' }}>
                <div className="skeleton" style={{ height: '50px', width: '100%', marginBottom: '15px' }} />
                <div className="skeleton" style={{ height: '50px', width: '100%', marginBottom: '15px' }} />
                <div className="skeleton" style={{ height: '50px', width: '100%' }} />
            </div>
        );
    }

    if (!notices || notices.length === 0) {
        return (
            <div className="card non-anim" id="notices" style={{ paddingBottom: '20px' }}>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', justifyContent: 'center', marginTop: '10px', opacity: '.3' }}>
                    <svg width="64" height="41" viewBox="0 0 64 41" xmlns="http://www.w3.org/2000/svg">
                        <g transform="translate(0 1)" fill="none" fillRule="evenodd">
                            <g fillRule="nonzero" stroke="var(--text-color)">
                                <path d="M55 12.76L44.854 1.258C44.367.474 43.656 0 42.907 0H21.093c-.749 0-1.46.474-1.947 1.257L9 12.761V22h46v-9.24z"></path>
                                <path d="M41.613 15.931c0-1.605.994-2.93 2.227-2.931H55v18.137C55 33.26 53.68 35 52.05 35h-40.1C10.32 35 9 33.259 9 31.137V13h11.16c1.233 0 2.227 1.323 2.227 2.928v.022c0 1.605 1.005 2.901 2.237 2.901h14.752c1.232 0 2.237-1.308 2.237-2.913v-.007z" fill="#fafafa"></path>
                            </g>
                        </g>
                    </svg>
                    <span>최근 공지사항이 없습니다!</span>
                </div>
            </div>
        );
    }

    return (
        <div className="card non-anim" id="notices" style={{ paddingBottom: '20px' }}>
            {notices.slice(0, showAll ? notices.length : 5).map((notice, index) => (
                <div key={index} className="notice-item" onClick={() => typeof Android !== 'undefined' && Android.openPage(`https://klas.kw.ac.kr/?redirectUrl=/mst/cmn/login/PushLinkForm.do?pushSeq=${notice.pushSeq}`)}>
                    <span>{notice.title} · <span><b>{notice.body}</b></span></span><br />
                    <span style={{ opacity: 0.6, fontSize: '12px' }}>{notice.registDt}</span>
                    {index !== (showAll ? notices.length : 5) - 1 && index !== notices.length - 1 && <hr style={{ opacity: 0.3 }} />}
                </div>
            ))}
            {notices.length > 5 && (
                <button
                    onClick={showAll ? handleCollapse : handleShowMore}
                    style={{ width: '100%', padding: '10px 0 0 0', textAlign: 'center', opacity: '.7', border: 'none', cursor: 'pointer', fontSize: '13px' }}
                >
                    {showAll ? (
                        <>
                            <IonIcon name='chevron-up-outline' style={{ position: 'relative', top: '2px' }} /><br />접기
                        </>
                    ) : (
                        <>
                            <IonIcon name='chevron-down-outline' style={{ position: 'relative', top: '2px' }} /><br />더보기
                        </>
                    )}
                </button>
            )}
        </div>
    );
};

export default LectureNotices;