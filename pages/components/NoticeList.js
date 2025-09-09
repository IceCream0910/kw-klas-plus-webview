import { openKlasPage } from '../../lib/androidBridge';
import { SkeletonLayouts } from './Skeleton';

/**
 * 공지사항 목록 컴포넌트
 */
function NoticeList({ notices, isLoading }) {
    if (isLoading) {
        return <SkeletonLayouts.NoticeList />;
    }

    if (!notices || notices.length === 0) {
        return (
            <div style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: '.5'
            }}>
                <span>최근 공지사항이 없습니다!</span>
            </div>
        );
    }

    return (
        <>
            {notices.slice(0, 6).map((notice, index) => (
                <div
                    key={index}
                    className="notice-item"
                    onClick={() => openKlasPage(notice.link)}
                >
                    <span>
                        <b>{notice.title.replace("신규게시글", "").replace("Attachment", "")}</b>
                    </span>
                    <br />
                    <span style={{ opacity: 0.6, fontSize: '12px' }}>
                        {notice.createdDate} · {notice.author}
                    </span>
                    {index !== 5 && <hr style={{ opacity: 0.3 }} />}
                </div>
            ))}
        </>
    );
}

export default NoticeList;
