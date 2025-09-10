// 온라인 강의 관련 유틸리티 함수들

/**
 * 온라인 강의 목록을 완료 여부에 따라 필터링
 * @param {Array} data - 온라인 강의 데이터 배열
 * @param {boolean} excludeFinished - 완료된 강의 제외 여부
 * @returns {Array} 필터링된 강의 목록
 */
export const filterLectureList = (data, excludeFinished) => {
    if (excludeFinished) {
        return data.filter((item) => item.prog < 100);
    }
    return data;
};

/**
 * 강의 시청을 위한 데이터 객체 생성
 * @param {Object} item - 강의 아이템 데이터
 * @returns {Object} Android 앱으로 전달할 강의 데이터
 */
export const createLectureData = (item) => {
    return {
        grcode: item.grcode,
        subj: item.subj,
        year: item.year,
        hakgi: item.hakgi,
        bunban: item.bunban,
        module: item.module,
        lesson: item.lesson,
        oid: item.oid,
        starting: 'xxx',
        contentsType: 'xxx',
        weekNo: item.weekNo,
        weeklyseq: item.weeklyseq,
        width: item.width,
        height: item.height,
        today: item.today,
        sdate: item.sdate,
        edate: item.edate,
        ptype: item.ptype,
        learnTime: item.learnTime,
        prog: item.prog,
        ptime: item.ptime
    };
};

/**
 * 강의 시작일 확인
 * @param {string} startDate - 강의 시작일
 * @returns {boolean} 시작일 이전 여부
 */
export const isBeforeStartDate = (startDate) => {
    return new Date(startDate) > new Date();
};

/**
 * 미리보기 강의 처리
 * @param {Object} item - 강의 아이템 데이터
 * @param {Object} Android - Android 브리지 객체
 */
export const handlePreviewLecture = (item, Android) => {
    if (item.starting) {
        alert("학습 시작일 이전에 강의 영상을 미리 시청할 수 있습니다. 이 경우 학습 시간은 인정되지 않습니다. 학습 시작일 이후 강의를 다시 시청해야 출석으로 인정되니 주의바랍니다.");
        Android.openExternalLink(item.starting);
    } else {
        alert("아직 강의 영상이 업로드되지 않았습니다.");
    }
};
