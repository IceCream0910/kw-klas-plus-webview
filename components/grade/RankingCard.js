/**
 * 성적 석차 카드 컴포넌트
 * @param {Object} props
 * @param {Object} props.data - 석차 데이터
 * @returns {JSX.Element}
 */
const RankingCard = ({ data }) => {
    return (
        <div className="profile-card" style={{
            border: '2px solid rgba(165, 165, 165, 0.3)',
            marginTop: '20px'
        }}>
            <h3 style={{ width: '100%', fontSize: '15px' }}>
                <span>{data.thisYear}년도 {data.hakgi}학기</span>
                <span style={{ float: 'right', fontSize: '18px' }}>
                    {data.classOrder}위
                    <span style={{ opacity: .3 }}>/{data.manNum}명</span>
                </span>
            </h3>
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                width: '100%',
                gap: '20px',
                opacity: .8,
                fontSize: '15px',
                marginTop: '5px'
            }}>
                <div style={{ textAlign: 'center', width: '100%' }}>
                    <span style={{ opacity: .8, fontSize: '12px' }}>신청학점</span>
                    <h3 style={{ margin: 0 }}>{data.applyHakjum}</h3>
                </div>
                <div style={{ textAlign: 'center', width: '100%' }}>
                    <span style={{ opacity: .8, fontSize: '12px' }}>총점</span>
                    <h3 style={{ margin: 0 }}>{data.applySum}</h3>
                </div>
                <div style={{ textAlign: 'center', width: '100%' }}>
                    <span style={{ opacity: .8, fontSize: '12px' }}>평점</span>
                    <h3 style={{ margin: 0 }}>{data.applyPoint}</h3>
                </div>
                <div style={{ textAlign: 'center', width: '100%' }}>
                    <span style={{ opacity: .8, fontSize: '12px' }}>백분율</span>
                    <h3 style={{ margin: 0 }}>{data.pcnt}</h3>
                </div>
            </div>
        </div>
    );
};

export default RankingCard;
