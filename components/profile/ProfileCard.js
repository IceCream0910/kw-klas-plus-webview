import { motion } from 'framer-motion';
import IonIcon from '@reacticons/ionicons';
import Spacer from "../common/spacer";

const ProfileCard = ({ data, stdInfo, totGrade, onCardClick, onGradeClick }) => {
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
            <motion.div
                layoutId="card"
                onClick={onCardClick}
                style={{
                    padding: 0,
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: "space-between",
                    alignItems: 'center',
                    width: '100%',
                    boxShadow: 'none',
                    willChange: 'transform, opacity'
                }}
            >
                <div style={{ opacity: 0.8, fontSize: '14px' }}>
                    <Spacer y={5} />
                    <h3 style={{ marginBottom: '5px', fontSize: '18px' }}>
                        <span className="rr-mask">{data.kname}</span>
                    </h3>
                    <div style={{ display: 'flex', gap: '5px' }}>
                        <div className="rr-mask">{stdInfo && stdInfo.hakgwa}</div>
                        <div className="rr-mask">| {data.hakbun}</div><br />
                    </div>
                    <div style={{ opacity: 0.5, fontSize: '12px' }}>
                        <span className="rr-mask">{data.hakjukStatu}</span>
                    </div>
                </div>
                <IonIcon name="chevron-forward-outline" style={{ position: 'relative', top: '2px', fontSize: '20px' }} />
            </motion.div>

            <Spacer y={15} />

            {totGrade && (
                <div
                    className="grade-card"
                    style={{
                        padding: 0,
                        flexDirection: 'row',
                        alignItems: 'space-between',
                        width: '100%',
                        backgroundColor: 'none !important'
                    }}
                    onClick={() => Android.openPage('https://klasplus.yuntae.in/grade')}
                >
                    <div style={{ textAlign: 'center', width: '100%' }}>
                        <span style={{ opacity: 0.8, fontSize: '12px' }}>취득학점</span>
                        <h3 className="rr-mask">{totGrade.credit}</h3>
                    </div>
                    <div style={{ textAlign: 'center', width: '100%' }}>
                        <span style={{ opacity: 0.8, fontSize: '12px' }}>평균평점</span>
                        <h3 className="rr-mask">{totGrade.averageGPA.includeF}</h3>
                    </div>
                    <div style={{ textAlign: 'center', width: '100%' }}>
                        <span style={{ opacity: 0.8, fontSize: '12px' }}>전공평점</span>
                        <h3 className="rr-mask">{totGrade.majorGPA.includeF}</h3>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileCard;
