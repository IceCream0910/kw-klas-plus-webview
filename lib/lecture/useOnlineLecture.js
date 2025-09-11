import { useState, useEffect } from 'react';
import { filterLectureList } from '../lecture/onlineLectureUtils';
import { KLAS } from '../core/klas';

/**
 * 온라인 강의 데이터 관리 커스텀 훅
 * @returns {Object} 온라인 강의 관련 상태와 함수들
 */
export const useOnlineLecture = () => {
    const [list, setList] = useState(null);
    const [filteredList, setFilteredList] = useState(null);
    const [token, setToken] = useState(null);
    const [subj, setSubj] = useState(null);
    const [yearHakgi, setYearHakgi] = useState(null);
    const [excludeFinished, setExcludeFinished] = useState(false);

    useEffect(() => {
        window.receivedData = function (token, subj, yearHakgi) {
            if (!token || !subj || !yearHakgi) return;

            KLAS("https://klas.kw.ac.kr/std/lis/evltn/SelectOnlineCntntsStdList.do", token, {
                "selectYearhakgi": yearHakgi,
                "selectSubj": subj,
                "selectChangeYn": "Y"
            })
                .then((data) => {
                    setList(data);
                })
                .catch((error) => {
                    console.error(error);
                });
        };

        const savedExcludeFinished = JSON.parse(localStorage.getItem('excludeFinished') || 'false');
        setExcludeFinished(savedExcludeFinished);
    }, []);

    // 리스트가 업데이트될 때 필터링 적용
    useEffect(() => {
        if (list) {
            const filtered = filterLectureList(list, excludeFinished);
            setFilteredList(filtered);
        }
    }, [list, excludeFinished]);

    /**
     * 완료된 강의 제외 토글 처리
     */
    const handleToggleChange = () => {
        const checked = !excludeFinished;
        localStorage.setItem('excludeFinished', JSON.stringify(checked));
        setExcludeFinished(checked);
    };

    return {
        list,
        filteredList,
        token,
        subj,
        yearHakgi,
        excludeFinished,
        handleToggleChange
    };
};
