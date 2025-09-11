import { useState, useEffect } from "react";

export const useLecturePlan = () => {
    const [data, setData] = useState(null);
    const [subjId, setSubjId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadLecturePlanData = async (token, subj) => {
        if (!token || !subj) {
            setError("토큰과 과목 정보가 필요합니다.");
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            setSubjId(subj);

            const response = await fetch("/api/lecturePlan", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token, subj }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            setData(result.data);
        } catch (err) {
            console.error("강의계획서 데이터 로드 실패:", err);
            setError("강의계획서 정보를 불러오는데 실패했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        window.receivedData = function (token, subj) {
            loadLecturePlanData(token, subj);
        };
    }, []);

    const refreshData = (token, subj) => {
        loadLecturePlanData(token, subj);
    };

    return {
        data,
        subjId,
        isLoading,
        error,
        loadLecturePlanData,
        refreshData
    };
};
