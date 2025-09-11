/**
 * 강의계획서 관련 유틸리티 함수들
 */

/**
 * 텍스트 줄바꿈 처리
 */
export const formatTextWithBreaks = (text) => {
    if (!text) return '';

    return text.split('\r\n').map((line, i, arr) => (
        <span key={i}>
            {line}
            {i < arr.length - 1 && <br />}
        </span>
    ));
};

/**
 * 강의 운영 방식 파싱
 */
export const getLectureOperationTypes = (lecturePlan) => {
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

/**
 * 강의 유형 파싱
 */
export const getLectureTypes = (lecturePlan) => {
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

/**
 * 원격 수업 정보 생성
 */
export const getRemoteClassInfo = (lecturePlan) => {
    const remoteInfo = [];

    if (lecturePlan.onlineOpt === "1") remoteInfo.push("원격 수업 100%");
    if (lecturePlan.blendedOpt === "1") remoteInfo.push("원격수업 50% 이상");

    return remoteInfo.join(', ');
};

/**
 * 강의 시간 정보 포맷팅
 */
export const formatLectureTime = (lectureTimeData) => {
    if (!lectureTimeData || !Array.isArray(lectureTimeData)) return '';

    return lectureTimeData.map((item, index) => (
        <span key={index}>
            {item.dayname1} {item.timeNo1}교시 ({item.locHname})
            {index !== lectureTimeData.length - 1 ? ', ' : ''}
        </span>
    ));
};

/**
 * 학점/시간 정보 포맷팅
 */
export const formatCreditInfo = (lecturePlan) => {
    if (!lecturePlan.getScore1 && !lecturePlan.getScore2 && !lecturePlan.getScore3) {
        return null;
    }

    return `이론학점(${lecturePlan.getScore1 || 0}), 실험학점(${lecturePlan.getScore2 || 0}), 설계학점(${lecturePlan.getScore3 || 0})`;
};

/**
 * 과목 코드 포맷팅
 */
export const formatSubjectCode = (lecturePlan) => {
    return `${lecturePlan.openMajorCode}-${lecturePlan.openGrade}-${lecturePlan.openGwamokNo}-${lecturePlan.bunbanNo}`;
};

/**
 * 연락처 정보 안전 표시
 */
export const formatContactInfo = (value) => {
    return value || "비공개";
};

/**
 * 평가 항목 데이터 파싱
 */
export const parseEvaluationData = (data) => {
    if (!data || !Array.isArray(data)) return null;

    const labels = [];
    const values = [];

    data.forEach(item => {
        if (item.refivePer && parseFloat(item.refivePer) > 0) {
            labels.push(item.refiveName);
            values.push(parseFloat(item.refivePer));
        }
    });

    return { labels, values };
};

/**
 * 주차별 계획 데이터 파싱
 */
export const parseWeeklyPlan = (data) => {
    if (!data || !Array.isArray(data)) return [];

    return data.map(item => ({
        week: item.weekNo,
        content: item.content,
        method: item.method,
        material: item.material
    }));
};
