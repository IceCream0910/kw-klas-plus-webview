import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { KLAS } from '../core/klas';
import { getDefaultHakgi, validateSearchParams } from '../../lib/lecturePlan/searchLecturePlanUtils';

export const useSearchLecturePlan = () => {
    const router = useRouter();
    const [isValid, setIsValid] = useState(false);
    const [data, setData] = useState(null);
    const [searchMode, setSearchMode] = useState(true);
    const [token, setToken] = useState(null);

    const [year, setYear] = useState(new Date().getFullYear());
    const [hakgi, setHakgi] = useState(1);
    const [name, setName] = useState('');
    const [professor, setProfessor] = useState('');
    const [selectedGwamok, setSelectedGwamok] = useState('');
    const [selectedHakgwa, setSelectedHakgwa] = useState('');
    const [selectedMajor, setSelectedMajor] = useState('');
    const [isMy, setIsMy] = useState(false);

    const [gwamokList, setGwamokList] = useState([]);
    const [hakgwaList, setHakgwaList] = useState([]);
    const [majorList, setMajorList] = useState([]);

    useEffect(() => {
        window.receiveToken = function (receivedToken) {
            if (!receivedToken) return;
            setToken(receivedToken);
            fetchGwamokList(receivedToken);
            fetchHakgwaList(receivedToken);
        };

        setHakgi(getDefaultHakgi());
    }, []);

    useEffect(() => {
        if (router.query.result && !isValid) {
            setSearchMode(true);
            return;
        }
        setSearchMode(!router.query.result);
    }, [router.query]);

    const fetchGwamokList = async (currentToken) => {
        KLAS("https://klas.kw.ac.kr/std/cps/atnlc/CmmnGamokList.do", currentToken, { "stopFlag": "" })
            .then((data) => {
                setGwamokList(data);
            });
    };

    const fetchHakgwaList = async (currentToken) => {
        KLAS("https://klas.kw.ac.kr/std/cps/atnlc/CmmnHakgwaList.do", currentToken, {
            "selectYear": year,
            "selecthakgi": hakgi
        })
            .then((data) => {
                setHakgwaList(data);
            });
    };

    const fetchMajorList = async (hakgwa) => {
        KLAS("https://klas.kw.ac.kr/std/cps/atnlc/CmmnMagerCodeList.do", token, {
            selecthakgwa: hakgwa
        })
            .then((data) => {
                setMajorList(data);
            });
    };

    const search = async () => {
        if (!validateSearchParams({ name, professor, selectedGwamok, selectedHakgwa, isMy })) {
            alert('과목명 또는 교수명을 입력하지 않은 경우 반드시 공통 과목이나 학과를 선택하셔야 합니다.');
            return;
        }

        setIsValid(true);

        router.push({
            pathname: router.pathname,
            query: { result: 'true' }
        });

        KLAS("https://klas.kw.ac.kr/std/cps/atnlc/LectrePlanStdList.do", token, {
            "selectYear": year,
            "selecthakgi": hakgi,
            "selectRadio": isMy ? "my" : "all",
            "selectText": name,
            "selectProfsr": professor,
            "cmmnGamok": selectedGwamok,
            "selecthakgwa": selectedHakgwa,
            "selectMajor": selectedMajor
        })
            .then(responseData => {
                setData(responseData);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    };

    const backToSearch = () => {
        router.back();
    };

    return {
        searchMode,
        data,
        year,
        hakgi,
        name,
        professor,
        selectedGwamok,
        selectedHakgwa,
        selectedMajor,
        isMy,
        gwamokList,
        hakgwaList,
        majorList,

        setYear,
        setHakgi,
        setName,
        setProfessor,
        setSelectedGwamok,
        setSelectedHakgwa,
        setSelectedMajor,
        setIsMy,

        search,
        backToSearch,
        fetchMajorList
    };
};
