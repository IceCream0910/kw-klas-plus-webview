import React from "react";
import IonIcon from '@reacticons/ionicons';
import Spacer from '../common/spacer';

/**
 * 강의 기본 정보 컴포넌트
 */
const LectureBasicInfo = ({ lecturePlan, lectureTime, lectureStdCrtNum }) => {
    const formatLectureTime = (timeData) => {
        if (!timeData || !Array.isArray(timeData)) return '';

        return timeData.map((item, index) => (
            <span key={index}>
                {item.dayname1} {item.timeNo1}교시 ({item.locHname})
                {index !== timeData.length - 1 ? ', ' : ''}
            </span>
        ));
    };

    const getRemoteClassInfo = () => {
        const remoteInfo = [];
        if (lecturePlan.onlineOpt === "1") remoteInfo.push("원격 수업 100%");
        if (lecturePlan.blendedOpt === "1") remoteInfo.push("원격수업 50% 이상");
        return remoteInfo.join(', ');
    };

    const getLectureOperationTypes = () => {
        const types = [];
        if (lecturePlan.face100Opt === 'Y') types.push('100% 대면강의');
        if (lecturePlan.faceliveOpt === 'Y') types.push('대면+실시간 화상강의');
        if (lecturePlan.facerecOpt === 'Y') types.push('대면+사전녹화강의');
        if (lecturePlan.faceliverecOpt === 'Y') types.push('대면+실시간 화상강의+사전녹화강의');
        if (lecturePlan.recliveOpt === 'Y') types.push('실시간 화상강의+사전녹화강의');
        if (lecturePlan.live100Opt === 'Y') types.push('100% 실시간 화상강의');
        if (lecturePlan.rec100Opt === 'Y') types.push('100% 사전녹화강의');
        return types.length > 0 ? types.join(', ') : '강의운영 방식 정보 없음';
    };

    const getLectureTypes = () => {
        const types = [];
        if (lecturePlan.tblOpt == '1') types.push('TBL강의');
        if (lecturePlan.pblOpt == '1') types.push('PBL강의');
        if (lecturePlan.seminarOpt == '1') types.push('세미나강의');
        if (lecturePlan.typeSmall == '1') types.push('소규모강의');
        if (lecturePlan.typeFusion == '1') types.push('융합강의');
        if (lecturePlan.typeTeam == '1') types.push('팀티칭강의');
        if (lecturePlan.typeWork == '1') types.push('일학습병행강의');
        if (lecturePlan.typeForeigner == '1') types.push('외국인전용강의');
        if (lecturePlan.typeElearn == '1') types.push('서울권역e-러닝');
        if (lecturePlan.typeExperiment == '1') types.push('실험실습실기설계강의');
        if (lecturePlan.typeJibjung == '1') types.push('집중이수제강의');
        return types.length > 0 ? types.join(', ') : '강의유형 정보 없음';
    };

    return (
        <div>
            {/* 강의 시간 */}
            <span style={{ fontSize: '15px' }}>
                <IonIcon style={{ position: 'relative', top: '2px', color: '#ff7661' }} name='time-outline' />
                <span style={{ marginLeft: '5px', opacity: .7 }}>
                    {formatLectureTime(lectureTime)}
                </span>
            </span><br />

            {/* 수강 인원 */}
            <span style={{ fontSize: '15px' }}>
                <IonIcon style={{ position: 'relative', top: '2px', color: '#ff7661' }} name='people-outline' />
                <span style={{ marginLeft: '5px', opacity: .7 }}>{lectureStdCrtNum.currentNum || 'N/A'}명</span>
            </span><br />

            {/* 학점/시간 */}
            <span style={{ fontSize: '15px' }}>
                <IonIcon style={{ position: 'relative', top: '2px', color: '#ff7661' }} name='layers-outline' />
                <span style={{ marginLeft: '5px', opacity: .7 }}>{lecturePlan.hakjumNum}학점/{lecturePlan.sisuNum}시간</span>
            </span><br />

            {/* 이론/실험/설계 학점 */}
            {(!lecturePlan.getScore1 && !lecturePlan.getScore2 && !lecturePlan.getScore3) ? null : (
                <span style={{ fontSize: '15px' }}>
                    <IonIcon style={{ position: 'relative', top: '2px', color: '#ff7661' }} name='apps-outline' />
                    <span style={{ marginLeft: '5px', opacity: .7 }}>
                        이론학점({lecturePlan.getScore1 || 0}), 실험학점({lecturePlan.getScore2 || 0}), 설계학점({lecturePlan.getScore3 || 0})
                    </span>
                    <br />
                </span>
            )}

            {/* 강의 운영 방식 */}
            <span style={{ fontSize: '15px' }}>
                <IonIcon style={{ position: 'relative', top: '2px', color: '#ff7661' }} name='desktop-outline' />
                <span style={{ marginLeft: '5px', opacity: .7 }}>
                    {getRemoteClassInfo()}
                    {getRemoteClassInfo() && ', '}
                </span>
                <span style={{ opacity: .7 }}>
                    {getLectureOperationTypes()}
                </span>
            </span><br />

            {/* 강의 유형 */}
            <span style={{ fontSize: '15px' }}>
                <IonIcon style={{ position: 'relative', top: '2px', color: '#ff7661' }} name='golf-outline' />
                <span style={{ marginLeft: '5px', opacity: .7 }}>
                    {getLectureTypes()}
                </span>
            </span>

            {/* 영어 강의 */}
            {lecturePlan.engOpt === "1" && (
                <span style={{ fontSize: '15px' }}>
                    <IonIcon style={{ position: 'relative', top: '2px', color: '#ff7661' }} name='text-outline' />
                    <span style={{ marginLeft: '5px', opacity: .7 }}>영어강의 {lecturePlan.englishBiyul}%</span>
                </span>
            )}

            {/* 제2외국어 강의 */}
            {lecturePlan.frnOpt === "1" && (
                <span style={{ fontSize: '15px' }}>
                    <IonIcon style={{ position: 'relative', top: '2px', color: '#ff7661' }} name='text-outline' />
                    <span style={{ marginLeft: '5px', opacity: .7 }}>제2외국어 강의 {lecturePlan.frnBiyul}%</span>
                </span>
            )}
        </div>
    );
};

export default LectureBasicInfo;
