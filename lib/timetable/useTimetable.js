import KlasNativeBridge from '../core/klasNativeBridge';
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

        try { KlasNativeBridge.completePageLoad() } catch (error) { console.log('not app') }

        return () => {
            window.receiveTimetableData = undefined;
            window.updateYearHakgiBtnText = undefined;
        };
    }, []);

    const handleClickTimetable = (subjId, title) => {
        if (typeof window !== 'undefined' && KlasNativeBridge) {
            KlasNativeBridge.openLectureActivity(subjId, title);
        }
    };

    return {
        timetableData,
        yearHakgiLabel,
        handleClickTimetable
    };
};
