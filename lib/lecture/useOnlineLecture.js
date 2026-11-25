import { useEffect, useMemo, useState } from 'react';
import { hasKlasSession } from '../core/nativeApp';
import { getFromLocalStorage, setToLocalStorage } from '../core/storageUtils';
import { KLAS } from '../core/klas';
import { isLectureComplete } from './onlineLectureUtils';

const FILTER_KEY = 'onlineLectureFilter';
const FILTERS = ['all', 'remaining', 'complete'];

export const useOnlineLecture = () => {
    const [list, setList] = useState(null);
    const [filter, setFilter] = useState('all');
    const [now, setNow] = useState(Date.now);

    useEffect(() => {
        const savedFilter = getFromLocalStorage(FILTER_KEY);
        setFilter(FILTERS.includes(savedFilter) ? savedFilter :
            getFromLocalStorage('excludeFinished', false) ? 'remaining' : 'all');

        let request;
        const receiveData = (token, subj, yearHakgi) => {
            if (!hasKlasSession(token) || !subj || !yearHakgi) return;

            request?.abort();
            const controller = new AbortController();
            request = controller;
            KLAS("https://klas.kw.ac.kr/std/lis/evltn/SelectOnlineCntntsStdList.do", token, {
                selectYearhakgi: yearHakgi,
                selectSubj: subj,
                selectChangeYn: 'Y'
            }, { signal: controller.signal })
                .then((data) => {
                    if (controller.signal.aborted) return;
                    setNow(Date.now());
                    setList(data.filter((item) => item?.grcode));
                })
                .catch((error) => {
                    if (!controller.signal.aborted) console.error(error);
                });
        };

        window.receivedData = receiveData;
        return () => {
            request?.abort();
            if (window.receivedData === receiveData) delete window.receivedData;
        };
    }, []);

    useEffect(() => {
        if (!list?.length) return;
        const timer = setInterval(() => setNow(Date.now()), 30_000);
        return () => clearInterval(timer);
    }, [list]);

    const groups = useMemo(() => list && ({
        all: list,
        remaining: list.filter((item) => !isLectureComplete(item)),
        complete: list.filter(isLectureComplete)
    }), [list]);

    const selectFilter = (nextFilter) => {
        setFilter(nextFilter);
        setToLocalStorage(FILTER_KEY, nextFilter);
    };

    return { groups, filter, selectFilter, now };
};
