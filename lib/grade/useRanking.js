import { useState, useEffect } from 'react';
import { KLAS } from '../core/klas';

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
