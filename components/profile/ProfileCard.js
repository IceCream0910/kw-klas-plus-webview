import KlasNativeBridge from '../../lib/core/klasNativeBridge';
import IonIcon from '@reacticons/ionicons';
import Spacer from "../common/spacer";

const ProfileCard = ({ data, stdInfo, totGrade, onCardClick }) => {
    if (!data) {
        return (
            <div className="profile-card">
                <div className="skeleton" style={{ height: '25px', width: '30%' }} />
                <div className="skeleton" style={{ height: '15px', width: '80%' }} />
                <div className="skeleton" style={{ height: '10px', width: '60%' }} />
                <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'center', width: '100%', gap: '20px' }}>
                    <div className="skeleton" style={{ height: '40px', width: '33%' }} />
                    <div className="skeleton" style={{ height: '40px', width: '33%' }} />
                    <div className="skeleton" style={{ height: '40px', width: '33%' }} />
                </div>
            </div>
        );
    }

    return (
        <div className="profile-card">
            <button
                type="button"
                onClick={onCardClick}
                style={{
                    padding: 0,
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: "space-between",
                    alignItems: 'center',
                    width: '100%',
                    boxShadow: 'none'
                }}
            >
                <span style={{ paddingTop: '5px', fontSize: '14px', minWidth: 0 }}>
                    <strong className="rr-mask" style={{ display: 'block', marginBottom: '5px', fontSize: '18px' }}>
                        {data.kname}
                    </strong>
                    <span style={{ display: 'flex', flexWrap: 'wrap', gap: '0 5px' }}>
                        {stdInfo?.hakgwa && <span className="rr-mask">{stdInfo.hakgwa} |</span>}
                        <span className="rr-mask">{data.hakbun}</span>
                    </span>
                    <span className="rr-mask" style={{ display: 'block', color: 'var(--text-color-transparent)', fontSize: '12px' }}>
                        {data.hakjukStatu}
                    </span>
                </span>
                <IonIcon name="chevron-forward-outline" style={{ position: 'relative', top: '2px', fontSize: '20px' }} />
            </button>

            <Spacer y={15} />

            {totGrade && (
                <div
                    className="profile-card-grades"
                    onClick={() => KlasNativeBridge.openPage('https://klasplus.yuntae.in/grade')}
                >
                    <div>
                        <span style={{ opacity: 0.8, fontSize: '12px' }}>취득학점</span>
                        <h3 className="rr-mask">{totGrade.credit}</h3>
                    </div>
                    <div>
                        <span style={{ opacity: 0.8, fontSize: '12px' }}>평균평점</span>
                        <h3 className="rr-mask">{totGrade.averageGPA.includeF}</h3>
                    </div>
                    <div>
                        <span style={{ opacity: 0.8, fontSize: '12px' }}>전공평점</span>
                        <h3 className="rr-mask">{totGrade.majorGPA.includeF}</h3>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileCard;
