// 강의계획서 검색 관련 유틸리티 함수들

/**
 * 현재 날짜 기준으로 학기 초기값 설정
 * @returns {number} 학기 번호 (8월 이전 1학기, 8월 이후 2학기)
 */
export const getDefaultHakgi = () => {
    const currentMonth = new Date().getMonth();
    return currentMonth < 8 ? 1 : 2;
};

/**
 * 연도 옵션 생성 (현재 연도부터 10년 이전까지)
 * @returns {Array} 연도 배열
 */
export const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 11 }, (_, index) => currentYear - index);
};

/**
 * 검색 조건 유효성 검사
 * @param {Object} searchParams - 검색 파라미터
 * @returns {boolean} 유효성 여부
 */
export const validateSearchParams = ({ name, professor, selectedGwamok, selectedHakgwa, isMy }) => {
    if (!name && !professor && !selectedGwamok && !selectedHakgwa && !isMy) {
        return false;
    }
    return true;
};

/**
 * 강의계획서 ID 생성
 * @param {Object} item - 강의 데이터
 * @returns {string} 강의계획서 ID
 */
export const generateLecturePlanId = (item) => {
    return `U${item.thisYear}${item.hakgi}${item.openGwamokNo}${item.openMajorCode}${item.bunbanNo}${item.openGrade}`;
};

/**
 * 강의 상태 확인
 * @param {Object} item - 강의 데이터
 * @returns {Object} 강의 상태 정보
 */
export const getLectureStatus = (item) => {
    return {
        isAccessible: item.summary && !item.closeOpt,
        isClosed: item.closeOpt !== null,
        isNotUploaded: !item.summary
    };
};
