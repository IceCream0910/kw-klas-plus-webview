import { useState, useEffect } from 'react';
import { KLAS } from '../klas';

/**
 * 성적 석차 데이터 관리 커스텀 훅
 * @returns {Object} 석차 관련 상태와 함수들
 */
export const useRanking = () => {
    const [token, setToken] = useState("");
    const [rank, setRank] = useState(null);

    useEffect(() => {
        window.receiveToken = function (receivedToken) {
            if (!receivedToken) return;
            setToken(receivedToken);
        };
    }, []);

    useEffect(() => {
        if (!token) return;

        KLAS("https://klas.kw.ac.kr/std/cps/inqire/StandStdList.do", token, {})
            .then((data) => {
                setRank(data);
            })
            .catch((error) => {
                console.error(error);
            });
    }, [token]);

    return {
        rank
    };
};
