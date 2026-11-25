import { useState, useEffect, useCallback, useMemo } from 'react';
import { processDeadlineData, applyDeadlineFilters } from '../calendar/deadlineUtils';
import { getFromLocalStorage, setToLocalStorage } from '../core/storageUtils';

export const useDeadlines = () => {
    const [result, setResult] = useState(null);
    const [excludeNotStarted, setExcludeNotStarted] = useState(false);
    const filteredDeadlines = useMemo(
        () => result ? applyDeadlineFilters(result.data, excludeNotStarted) : null,
        [result, excludeNotStarted]
    );

    useEffect(() => {
        const savedExcludeNotStarted = getFromLocalStorage('excludeNotStarted', false);
        setExcludeNotStarted(savedExcludeNotStarted);
    }, []);

    const processAndSetDeadlines = useCallback((data) => {
        setResult(processDeadlineData(data));
    }, []);

    const handleToggleChange = useCallback(() => {
        const newValue = !excludeNotStarted;
        setExcludeNotStarted(newValue);
        setToLocalStorage('excludeNotStarted', newValue);
    }, [excludeNotStarted]);

    return {
        deadlines: result?.data ?? [],
        filteredDeadlines,
        excludeNotStarted,
        showToggle: result?.hasStartDate ?? false,
        processAndSetDeadlines,
        handleToggleChange
    };
};
