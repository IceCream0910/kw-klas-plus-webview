import IonIcon from "@reacticons/ionicons";
import Spacer from "./spacer";

/**
 * 성적 정보 카드 컴포넌트
 */
function GradeCard({
    data,
    title,
    isTotal = false,
    onClick,
    style = {},
    isClickable = false,
    showChevron = false,
    children
}) {
    if (!data) return null;

    const cardStyle = {
        padding: '15px',
        flexDirection: 'column',
        alignItems: 'space-between',
        ...(isTotal && {
            border: '2px solid rgba(165, 165, 165, 0.3)',
            marginTop: '20px'
        }),
        ...(onClick && { cursor: 'pointer' }),
        ...style
    };

    const renderStatItem = (label, value, subValue = null) => (
        <div style={{ textAlign: 'center', width: '100%' }}>
            <span style={{ opacity: .8, fontSize: '12px' }}>{label}</span>
            <h3 style={{ margin: 0 }}>{value}</h3>
            {subValue && (
                <span style={{ opacity: .5, fontSize: '12px' }}>{subValue}</span>
            )}
        </div>
    );

    const CardComponent = onClick ? 'button' : 'div';

    return (
        <CardComponent
            className="profile-card grade-card"
            style={cardStyle}
            onClick={onClick}
        >
            {title && (
                <h3 style={{ width: '100%', margin: 0 }}>
                    {title}
                    {showChevron && (
                        <IonIcon style={{ float: 'right' }} name="chevron-forward" />
                    )}
                </h3>
            )}

            <Spacer y={10} />

            {children || (
                <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                    {/* 학점 정보 표시 */}
                    {data.applyHakjum !== undefined && (
                        <>
                            {renderStatItem('신청학점', data.applyHakjum, `전공 ${data.majorApplyHakjum || 0}`)}
                            {renderStatItem('삭제학점', data.delHakjum, `전공 ${data.majorDelHakjum || 0}`)}
                            {renderStatItem('취득학점', data.chidukHakjum, `전공 ${data.majorChidukHakjum || 0}`)}
                            {renderStatItem('평량평균', data.jaechulScoresum)}
                        </>
                    )}

                    {/* GPA 정보 표시 */}
                    {data.majorGPA && (
                        <>
                            {renderStatItem('취득학점', data.credit, 'F 미포함 :')}
                            {renderStatItem('전공', data.majorGPA.includeF, data.majorGPA.excludeF)}
                            {renderStatItem('전공 외', data.nonMajorGPA.includeF, data.nonMajorGPA.excludeF)}
                            {renderStatItem('평균', data.averageGPA.includeF, data.averageGPA.excludeF)}
                        </>
                    )}
                </div>
            )}
        </CardComponent>
    );
}

export default GradeCard;
