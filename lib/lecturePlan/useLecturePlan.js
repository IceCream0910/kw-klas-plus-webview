import { hasKlasSession } from '../core/nativeApp';
import { loadLecturePlan } from '../klas/services';
import { useState, useEffect } from "react";

export const useLecturePlan = () => {
    const [data, setData] = useState(null);
    const [subjId, setSubjId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadLecturePlanData = async (token, subj) => {
        if (!hasKlasSession(token) || !subj) {
            setError("토큰과 과목 정보가 필요합니다.");
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            setSubjId(subj);

            const result = await loadLecturePlan(token, subj);
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
