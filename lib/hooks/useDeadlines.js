import { useState, useEffect, useCallback } from 'react';
import { processDeadlineData, applyDeadlineFilters } from '../deadlineUtils';
import { getFromLocalStorage, setToLocalStorage } from '../storageUtils';

/**
 * 마감일 관리 커스텀 훅
 */
export const useDeadlines = () => {
    const [deadlines, setDeadlines] = useState([]);
    const [filteredDeadlines, setFilteredDeadlines] = useState(null);
    const [excludeNotStarted, setExcludeNotStarted] = useState(false);
    const [showToggle, setShowToggle] = useState(false);

    // 초기화 시 로컬 스토리지에서 설정 불러오기
    useEffect(() => {
        const savedExcludeNotStarted = getFromLocalStorage('excludeNotStarted', false);
        setExcludeNotStarted(savedExcludeNotStarted);
    }, []);

    // 마감일 데이터 처리
    const processAndSetDeadlines = useCallback((data) => {
        const { data: processedData, hasStartDate } = processDeadlineData(data);
        setDeadlines(processedData);
        setShowToggle(hasStartDate);

        // 필터링 적용
        const filtered = applyDeadlineFilters(processedData, excludeNotStarted);
        setFilteredDeadlines(filtered);
    }, [excludeNotStarted]);

    // 필터 토글 핸들러
    const handleToggleChange = useCallback(() => {
        const newValue = !excludeNotStarted;
        setExcludeNotStarted(newValue);
        setToLocalStorage('excludeNotStarted', newValue);

        // 기존 데이터에 새로운 필터 적용
        const filtered = applyDeadlineFilters(deadlines, newValue);
        setFilteredDeadlines(filtered);
    }, [excludeNotStarted, deadlines]);

    // excludeNotStarted 변경 시 필터링 재적용
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
