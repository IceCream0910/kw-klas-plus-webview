
export const calculateAttendanceStats = (attendanceData) => {
    let totalClasses = 0;
    let attendanceCount = 0;
    let lateCount = 0;
    let absentCount = 0;
    let excusedOrEarlyLeaveCount = 0;

    if (!attendanceData || !Array.isArray(attendanceData)) {
        return {
            attendanceRate: 0,
            lateCount: 0,
            absentCount: 0,
            totalClasses: 0
        };
    }

    attendanceData.forEach(item => {
        ['pgr1', 'pgr2', 'pgr3', 'pgr4'].forEach(key => {
            const value = item[key];
            if (value && value !== '-') {
                totalClasses++;
                if (value === 'O') attendanceCount++;
                if (value === 'L') lateCount++;
                if (value === 'X') absentCount++;
                if (value === 'R' || value === 'A') excusedOrEarlyLeaveCount++;
            }
        });
    });

    const attendanceRate = totalClasses > 0 ? (attendanceCount / totalClasses) * 100 : 0;

    return {
        attendanceRate,
        lateCount,
        absentCount,
        attendanceCount,
        excusedOrEarlyLeaveCount,
        totalClasses
    };
};

// 출석 상태에 따른 색상 반환
export const getAttendanceColor = (status) => {
    const statusColors = {
        'O': '#7099ff',  // 출석
        'L': '#dd36cf',  // 지각
        'R': '#FFA500',  // 조퇴
        'X': '#ff596a',  // 결석
        'A': '#FFA500'   // 공결
    };

    return statusColors[status] || '#6b7280';
};

export const getBuildingMapUrl = (buildingName) => {
    const buildingUrlMap = {
        '누리': 'https://naver.me/G65JGSGc',
        '문화': 'https://naver.me/FK5vCrqC',
        '한울': 'https://naver.me/5tJtisN6',
        '연구': 'https://naver.me/5eZJ0BvX',
        '옥의': 'https://naver.me/565F45w6',
        '비마': 'https://naver.me/xBwfkQLH',
        '참빛': 'https://naver.me/Gal5ZmBK',
        '새빛': 'https://naver.me/Gq8SGz6z',
        '화도': 'https://naver.me/5uIEX9an',
        '기념': 'https://naver.me/58NfGdrj',
        '복지': 'https://naver.me/F0zhmuRO'
    };

    return buildingUrlMap[buildingName] || null;
};

export const getAttendanceRateColor = (attendanceRate) => {
    if (attendanceRate >= 90) return "#22c55e";
    if (attendanceRate >= 80) return "#3b82f6";
    if (attendanceRate >= 70) return "#f59e0b";
    if (attendanceRate >= 60) return "#f97316";
    return "#ef4444";
};

// 과제 제출 상태에 따른 색상 반환
export const getSubmissionStatusColor = (isSubmitted) => {
    return isSubmitted ? "#22c55e" : "#ef4444";
};

// 날짜 형식 변환 (YYYY-MM-DD HH:mm 형태로)
export const formatDateTime = (dateStr) => {
    if (!dateStr) return "";

    try {
        const date = new Date(dateStr);
        return date.toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return dateStr;
    }
};

export const parseClassroomInfo = (placeTimeStr) => {
    if (!placeTimeStr) return { time: "", place: "" };

    const parts = placeTimeStr.split('/');
    return {
        time: parts[0] || "",
        place: parts[1] || ""
    };
};
