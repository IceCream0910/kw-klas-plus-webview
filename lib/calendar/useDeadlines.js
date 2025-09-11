import { useState, useEffect, useCallback } from 'react';
import { processDeadlineData, applyDeadlineFilters } from '../calendar/deadlineUtils';
import { getFromLocalStorage, setToLocalStorage } from '../core/storageUtils';

export const useDeadlines = () => {
    const [deadlines, setDeadlines] = useState([]);
    const [filteredDeadlines, setFilteredDeadlines] = useState(null);
    const [excludeNotStarted, setExcludeNotStarted] = useState(false);
    const [showToggle, setShowToggle] = useState(false);

    useEffect(() => {
        const savedExcludeNotStarted = getFromLocalStorage('excludeNotStarted', false);
        setExcludeNotStarted(savedExcludeNotStarted);
    }, []);

    const processAndSetDeadlines = useCallback((data) => {
        const { data: processedData, hasStartDate } = processDeadlineData(data);
        setDeadlines(processedData);
        setShowToggle(hasStartDate);

        const filtered = applyDeadlineFilters(processedData, excludeNotStarted);
        setFilteredDeadlines(filtered);
    }, [excludeNotStarted]);

    const handleToggleChange = useCallback(() => {
        const newValue = !excludeNotStarted;
        setExcludeNotStarted(newValue);
        setToLocalStorage('excludeNotStarted', newValue);

        const filtered = applyDeadlineFilters(deadlines, newValue);
        setFilteredDeadlines(filtered);
    }, [excludeNotStarted, deadlines]);

    useEffect(() => {
        if (deadlines.length > 0) {
            const filtered = applyDeadlineFilters(deadlines, excludeNotStarted);
            setFilteredDeadlines(filtered);
        }
    }, [deadlines, excludeNotStarted]);

    return {
        deadlines,
        filteredDeadlines,
        excludeNotStarted,
        showToggle,
        processAndSetDeadlines,
        handleToggleChange
    };
};
