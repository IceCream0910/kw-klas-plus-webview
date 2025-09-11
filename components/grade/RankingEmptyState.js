/**
 * 석차 빈 상태 컴포넌트
 * @returns {JSX.Element}
 */
const RankingEmptyState = () => {
    return (
        <div style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '50%',
            transform: 'translateY(-40%)'
        }}>
            <h3 style={{ textAlign: 'center' }}>
                아직 조회 가능한<br />성적 석차가 없어요!
            </h3>
        </div>
    );
};

export default RankingEmptyState;
