/**
 * 석차 로딩 스켈레톤 컴포넌트
 * @returns {JSX.Element}
 */
const RankingLoadingSkeleton = () => {
    return (
        <div>
            <div className="skeleton" style={{ height: '70px', width: '100%', marginBottom: '10px' }} />
            <div className="skeleton" style={{ height: '70px', width: '100%', marginBottom: '10px' }} />
            <div className="skeleton" style={{ height: '70px', width: '100%' }} />
        </div>
    );
};

export default RankingLoadingSkeleton;
