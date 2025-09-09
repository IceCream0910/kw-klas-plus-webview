import { useState, useEffect } from 'react';
import { preprocessTimetableData } from '../timetableHelpers';

/**
 * 시간표 데이터 관리 커스텀 훅
 * @returns {Object} 시간표 관련 상태와 함수들
 */
export const useTimetable = () => {
    const [timetableData, setTimetableData] = useState(null);
    const [yearHakgiLabel, setYearHakgiLabel] = useState("");

    useEffect(() => {
        // Android 브리지 콜백 설정
        window.receiveTimetableData = (data) => {
            const parsedData = JSON.parse(data);
            const processedData = preprocessTimetableData(parsedData);
            setTimetableData(processedData);
        };

        window.updateYearHakgiBtnText = (text) => {
            setYearHakgiLabel(text);
        };

        return () => {
            window.receiveTimetableData = undefined;
            window.updateYearHakgiBtnText = undefined;
        };
    }, []);

    /**
     * 시간표 셀 클릭 핸들러
     * @param {string} subjId - 과목 ID
     * @param {string} title - 과목명
     */
    const handleClickTimetable = (subjId, title) => {
        if (typeof window !== 'undefined' && window.Android) {
            window.Android.openLectureActivity(subjId, title);
        } else {
            console.log(`Clicked: ${title} (${subjId})`);
        }
    };

    return {
        timetableData,
        yearHakgiLabel,
        handleClickTimetable
    };
};
