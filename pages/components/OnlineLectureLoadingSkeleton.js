/**
 * 온라인 강의 로딩 스켈레톤 컴포넌트
 * @returns {JSX.Element}
 */
const OnlineLectureLoadingSkeleton = () => {
    return (
        <>
            <div className="skeleton" style={{ height: '80px', width: '100%' }} />
            <div className="skeleton" style={{ height: '80px', width: '100%' }} />
            <div className="skeleton" style={{ height: '80px', width: '100%' }} />
            <div className="skeleton" style={{ height: '80px', width: '100%' }} />
        </>
    );
};

export default OnlineLectureLoadingSkeleton;
