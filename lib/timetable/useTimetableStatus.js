import { useState, useEffect, useCallback } from 'react';
import { calculateClassStatus, processTimetableData } from './timetableUtils';
import { TIME_CONSTANTS } from '../core/constants';

export const useTimetableStatus = () => {
    const [timetable, setTimetable] = useState(null);
    const [statusText, setStatusText] = useState("");
    const [selectedSubj, setSelectedSubj] = useState(null);
    const [selectedSubjName, setSelectedSubjName] = useState(null);
    const [showButtons, setShowButtons] = useState(false);

    const updateTimetableStatus = useCallback((timetableData) => {
        if (!timetableData) return;

        const status = calculateClassStatus(timetableData);

        setStatusText(status.message);

        switch (status.type) {
            case 'ongoing_class':
            case 'upcoming_class':
                setSelectedSubj(status.classInfo.subj);
                setSelectedSubjName(status.classInfo.title);
                setShowButtons(true);
                break;
            default:
                setSelectedSubj(null);
                setSelectedSubjName(null);
                setShowButtons(false);
        }
    }, []);

    const setTimetableData = useCallback((data) => {
        const processedData = processTimetableData(data);
        setTimetable(processedData);
        updateTimetableStatus(processedData);
    }, [updateTimetableStatus]);

    useEffect(() => {
        if (!timetable) return;

        const interval = setInterval(() => {
            updateTimetableStatus(timetable);
        }, TIME_CONSTANTS.UPDATE_INTERVAL);

        return () => clearInterval(interval);
    }, [timetable, updateTimetableStatus]);

    return {
        timetable,
        statusText,
        selectedSubj,
        selectedSubjName,
        showButtons,
        setTimetableData,
        updateTimetableStatus
    };
};
