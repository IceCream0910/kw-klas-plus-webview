import { useState, useEffect } from 'react';
import { preprocessTimetableData } from './timetableHelpers';

export const useTimetable = () => {
    const [timetableData, setTimetableData] = useState(null);
    const [yearHakgiLabel, setYearHakgiLabel] = useState("");

    useEffect(() => {
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
