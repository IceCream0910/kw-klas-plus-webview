import { useState, useEffect } from "react";
import { KLAS } from "../core/klas";
import { parseScholarshipData, filterScholarships, sortScholarships } from "./scholarshipUtils";

export const useScholarships = () => {
    const [scholarships, setScholarships] = useState([]);
    const [filteredScholarships, setFilteredScholarships] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState("전체");
    const [sortBy, setSortBy] = useState("period");

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

    useEffect(() => {
        let result = filterScholarships(scholarships, filter);
        result = sortScholarships(result, sortBy);
        setFilteredScholarships(result);
    }, [scholarships, filter, sortBy]);

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
    };

    const handleSortChange = (newSortBy) => {
        setSortBy(newSortBy);
    };

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
