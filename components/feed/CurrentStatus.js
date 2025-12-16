import { openLectureActivity, openQRCheckIn } from '../../lib/core/androidBridge';
import { SkeletonLayouts } from '../common/Skeleton';

function CurrentStatus({ statusText, showClassActions, selectedSubj, selectedSubjName, isNoCourse }) {
    const handleLectureClick = () => {
        openLectureActivity(selectedSubj, selectedSubjName);
    };

    const handleQRClick = () => {
        openQRCheckIn(selectedSubj, selectedSubjName);
    };

    const handleYearHakgiSelect = () => {
        if (typeof window !== 'undefined' && window.Android) {
            window.Android.openYearHakgiSelectModal();
        }
    };

    if (!statusText) {
        return (
            <div id="current_status">
                <SkeletonLayouts.CurrentStatus />
            </div>
        );
    }

    const renderActionButtons = () => {
        if (showClassActions) {
            return (
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
            );
        }

        if (isNoCourse) {
            return <div id="status_btns">
                    <button
                        id="lecture_btn"
                        onClick={handleYearHakgiSelect}
                        style={{
                            backgroundColor: 'var(--button-background)',
                            color: 'var(--button-text)',
                            width: 'fit-content',
                            padding: '10px 15px',
                            fontSize: '15px'
                        }}
                    >
                        학기 선택
                    </button>
                </div>;
        }

        return null;
    };

    return (
        <div id="current_status">
            <h4 id="status_txt" dangerouslySetInnerHTML={{ __html: statusText }} />
            {renderActionButtons()}
        </div>
    );
}

export default CurrentStatus;
