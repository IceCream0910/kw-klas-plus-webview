import Spacer from '../common/spacer';
import ToggleSwitch from '../common/ToggleSwitch';

/**
 * 온라인 강의 페이지 헤더 컴포넌트
 * @param {Object} props
 * @param {boolean} props.excludeFinished - 완료된 강의 제외 여부
 * @param {Function} props.onToggleChange - 토글 변경 핸들러
 * @returns {JSX.Element}
 */
const OnlineLectureHeader = ({ excludeFinished, onToggleChange }) => {
    const handleKLASOpen = () => {
        if (typeof window !== 'undefined' && window.Android) {
            window.Android.openInKLAS();
        }
    };

    return (
        <>
            <Spacer y={5} />
            <h2>
                온라인 강의
                <button
                    onClick={handleKLASOpen}
                    style={{
                        float: 'right',
                        border: '1px solid var(--card-background)',
                        width: 'fit-content',
                        fontSize: '14px',
                        marginTop: '-5px',
                        borderRadius: '20px',
                        padding: '10px 15px'
                    }}
                >
                    KLAS에서 열기
                </button>
            </h2>
            <Spacer y={30} />
            <ToggleSwitch
                id="toggle"
                checked={excludeFinished}
                onChange={onToggleChange}
                label="수강 완료 강의 제외"
                style={{
                    justifyContent: 'flex-end',
                    gap: '5px',
                    fontSize: '14px',
                    opacity: .8,
                    paddingRight: '5px'
                }}
            />
            <Spacer y={20} />
        </>
    );
};

export default OnlineLectureHeader;
