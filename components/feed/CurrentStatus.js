import { openLectureActivity, openQRCheckIn } from '../../lib/core/androidBridge';
import { SkeletonLayouts } from '../common/Skeleton';

/**
 * 현재 수업 상태를 표시하는 컴포넌트
 */
function CurrentStatus({ statusText, showButtons, selectedSubj, selectedSubjName }) {
    const handleLectureClick = () => {
        openLectureActivity(selectedSubj, selectedSubjName);
    };

    const handleQRClick = () => {
        openQRCheckIn(selectedSubj, selectedSubjName);
    };

    if (!statusText) {
        return (
            <div id="current_status">
                <SkeletonLayouts.CurrentStatus />
            </div>
        );
    }

    return (
        <div id="current_status">
            <h4 id="status_txt" dangerouslySetInnerHTML={{ __html: statusText }} />
            {showButtons && (
                <div id="status_btns">
                    <button
                        id="lecture_btn"
                        onClick={handleLectureClick}
                        style={{
                            backgroundColor: 'var(--button-background)',
                            color: 'var(--button-text)',
                            width: 'fit-content',
                            padding: '10px 15px',
                            fontSize: '15px'
                        }}
                    >
                        강의 홈
                    </button>
                    <button
                        id="qr_btn"
                        onClick={handleQRClick}
                        style={{
                            backgroundColor: 'var(--card-background)',
                            color: 'var(--text-color)',
                            marginLeft: '10px',
                            width: 'fit-content',
                            padding: '10px 15px',
                            fontSize: '15px'
                        }}
                    >
                        QR 출석
                    </button>
                </div>
            )}
        </div>
    );
}

export default CurrentStatus;
