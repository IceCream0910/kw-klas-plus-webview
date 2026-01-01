import { motion } from 'framer-motion';
import IonIcon from '@reacticons/ionicons';
import Spacer from "../common/spacer";
import { getStoredData, setStoredData } from "../../lib/core/storageUtils";
import { useState } from 'react';

const ProfileCard = ({ data, stdInfo, totGrade, onCardClick, onGradeClick }) => {
    const maskGrades = getStoredData('hideGrades') ?? false;
    const [tempUnmasked, setTempUnmasked] = useState(false);

    const handleGradeClick = () => {
        if (maskGrades) {
            setTempUnmasked(true);
        } else {
            setStoredData('hideGrades', true);
        }
        onGradeClick?.();
    };

    const shouldShow = tempUnmasked || !maskGrades;
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
                    width: '100%'
                }}
            >
                <div style={{ opacity: 0.8, fontSize: '14px' }}>
                    <Spacer y={5} />
                    <motion.h3 layoutId="name" style={{ marginBottom: '5px', fontSize: '18px' }}>
                        {data.kname}
                    </motion.h3>
                    <div style={{ display: 'flex', gap: '5px' }}>
                        <motion.div layoutId="hakgwa">{stdInfo && stdInfo.hakgwa}</motion.div>
                        <motion.div layoutId="number">| {data.hakbun}</motion.div><br />
                    </div>
                    <motion.div layoutId="status" style={{ opacity: 0.5, fontSize: '12px' }}>
                        {data.hakjukStatu}
                    </motion.div>
                </div>
                <IonIcon name="chevron-forward-outline" style={{ position: 'relative', top: '2px', fontSize: '20px' }} />
            </motion.div>

            <Spacer y={10} />

            <button
                onClick={onCardClick}
                style={{ background: 'var(--notice-hover)', borderRadius: '10px' }}
            >
                <span className="tossface">🪪</span>모바일 학생증
                <IonIcon name="chevron-forward-outline" style={{ position: 'relative', top: '2px' }} />
            </button>

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
                    onClick={() => !maskGrades && Android.openPage('https://klasplus.yuntae.in/grade')}
                >
                    <div style={{ textAlign: 'center', width: '100%' }} onClick={handleGradeClick}>
                        <span style={{ opacity: 0.8, fontSize: '12px' }}>취득학점</span>
                        <h3>{shouldShow ? totGrade.credit : '??'}</h3>
                    </div>
                    <div style={{ textAlign: 'center', width: '100%' }} onClick={handleGradeClick}>
                        <span style={{ opacity: 0.8, fontSize: '12px' }}>평균평점</span>
                        <h3>{shouldShow ? totGrade.averageGPA.includeF : '??'}</h3>
                    </div>
                    <div style={{ textAlign: 'center', width: '100%' }} onClick={handleGradeClick}>
                        <span style={{ opacity: 0.8, fontSize: '12px' }}>전공평점</span>
                        <h3>{shouldShow ? totGrade.majorGPA.includeF : '??'}</h3>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileCard;
