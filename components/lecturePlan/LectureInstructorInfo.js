import React from "react";
import IonIcon from '@reacticons/ionicons';
import Spacer from '../common/spacer';

const LectureInstructorInfo = ({ lecturePlan, lectureTeam, lectureAssistant }) => {
    return (
        <div className="card non-anim" style={{ paddingBottom: '20px' }}>
            {/* 주담당 교수 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h5>{lecturePlan.memberName}</h5>
                    <span style={{ opacity: .7, marginTop: '5px' }}>{lecturePlan.jikgeubName}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <span style={{ fontSize: '15px' }}>
                        <IonIcon style={{ position: 'relative', top: '2px', color: '#ff7661' }} name='call-outline' />
                        <span style={{ marginLeft: '5px', opacity: .7 }}>{lecturePlan.telNo || "비공개"}</span>
                    </span>
                    <span style={{ fontSize: '15px' }}>
                        <IonIcon style={{ position: 'relative', top: '2px', color: '#ff7661' }} name='phone-portrait-outline' />
                        <span style={{ marginLeft: '5px', opacity: .7 }}>{lecturePlan.hpNo || "비공개"}</span>
                    </span>
                    <span style={{ fontSize: '15px' }}>
                        <IonIcon style={{ position: 'relative', top: '2px', color: '#ff7661' }} name='mail-outline' />
                        <span style={{ marginLeft: '5px', opacity: .7 }}>{lecturePlan.addinfoemail || "비공개"}</span>
                    </span>
                </div>
            </div>

            <Spacer y={10} />

            {/* 팀티칭/공동교수 */}
            {lectureTeam.length > 0 && (
                <>
                    <hr style={{ opacity: 0.1 }} />
                    <Spacer y={10} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignContent: 'center' }}>
                            <h5>{lectureTeam[0].name}</h5>
                            <span style={{ opacity: .7, marginTop: '5px' }}>팀티칭/공동교수</span>
                        </div>
                    </div>
                </>
            )}

            {/* 담당 조교 */}
            {lectureAssistant.length > 0 && (
                <>
                    <hr style={{ opacity: 0.1 }} />
                    <Spacer y={10} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignContent: 'center' }}>
                            <h5>{lectureAssistant[0].name}</h5>
                            <span style={{ opacity: .7, marginTop: '5px' }}>담당조교</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <span style={{ fontSize: '15px' }}>
                                <IonIcon style={{ position: 'relative', top: '2px', color: '#ff7661' }} name='mail-outline' />
                                <span style={{ marginLeft: '5px', opacity: .7 }}>{lectureAssistant[0].astntemail}</span>
                            </span>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default LectureInstructorInfo;
