import { useState, useEffect } from "react";
import { KLAS } from "../core/klas";
import { parseScholarshipData, filterScholarships, sortScholarships } from "./scholarshipUtils";

/**
 * 장학금 데이터 관리 훅
 */
export const useScholarships = () => {
    const [scholarships, setScholarships] = useState([]);
    const [filteredScholarships, setFilteredScholarships] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState("전체");
    const [sortBy, setSortBy] = useState("period");

    // 장학금 데이터 로드
    const loadScholarships = async (token) => {
        if (!token) {
            setError("토큰이 필요합니다.");
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const response = await KLAS.getScholarshipList(token);
            const parsedData = parseScholarshipData(response);

            setScholarships(parsedData);
            setFilteredScholarships(parsedData);
        } catch (err) {
            console.error("장학금 데이터 로드 실패:", err);
            setError("장학금 정보를 불러오는데 실패했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    // 필터링 및 정렬 적용
    useEffect(() => {
        let result = filterScholarships(scholarships, filter);
        result = sortScholarships(result, sortBy);
        setFilteredScholarships(result);
    }, [scholarships, filter, sortBy]);

    // 필터 변경
    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
    };

    // 정렬 변경
    const handleSortChange = (newSortBy) => {
        setSortBy(newSortBy);
    };

    // 데이터 새로고침
    const refreshScholarships = (token) => {
        loadScholarships(token);
    };

    return {
        scholarships: filteredScholarships,
        isLoading,
        error,
        filter,
        sortBy,
        loadScholarships,
        handleFilterChange,
        handleSortChange,
        refreshScholarships
    };
};
