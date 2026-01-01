import { useState, useEffect } from "react";
import { KLAS } from "../core/klas";
import handleCalculateGPA, { calculateGPA } from "../grade/calculateGPA";
import { openWebViewBottomSheet, closeWebViewBottomSheet, openCustomBottomSheet } from "../core/androidBridge";
import { getStoredData, setStoredData } from "../core/storageUtils";

export const useProfileData = () => {
    const [data, setData] = useState(null);
    const [token, setToken] = useState("");
    const [grade, setGrade] = useState(null);
    const [synthesisGPAs, setSynthesisGPAs] = useState();
    const [totGrade, setTotGrade] = useState();
    const [stdInfo, setStdInfo] = useState(null);

    useEffect(() => {
        window.receiveToken = function (receivedToken) {
            if (!receivedToken) return;
            setToken(receivedToken);
        };
    }, []);

    useEffect(() => {
        if (!token) return;

        // 학적 정보 조회
        KLAS("https://klas.kw.ac.kr/std/cps/inqire/AtnlcScreHakjukInfo.do", token)
            .then((data) => {
                setData(data);
            })
            .catch((error) => {
                console.error(error);
            });

        // 성적 정보 조회
        KLAS("https://klas.kw.ac.kr/std/cps/inqire/AtnlcScreSungjukInfo.do", token)
            .then((data) => {
                setGrade(data);
            })
            .catch((error) => {
                console.error(error);
            });

        // 학생 정보 조회
        KLAS("https://klas.kw.ac.kr/mst/lis/evltn/LrnSttusStdOne.do", token, {})
            .then((data) => {
                setStdInfo(data);
            });
    }, [token]);

    useEffect(() => {
        if (!grade) return;

        const getData = async () => {
            const semesters = await handleCalculateGPA(grade);
            const synthesisGPAs = await calculateGPA(semesters);
            setSynthesisGPAs(synthesisGPAs);
        };

        getData();
    }, [grade]);

    useEffect(() => {
        if (!synthesisGPAs) return;
        const tot = synthesisGPAs.find(semester => semester.name === '전체 학기');
        setTotGrade(tot);
    }, [synthesisGPAs]);

    return { data, grade, totGrade, stdInfo };
};

export const useMenuSettings = () => {
    const [favorites, setFavorites] = useState([]);

    useEffect(() => {
        const savedFavorites = getStoredData('favorites');
        if (savedFavorites) {
            setFavorites(savedFavorites);
        }
    }, []);

    const handleToggleFavorite = (item) => {
        setFavorites(prevFavorites => {
            const isFavorite = prevFavorites.includes(item.url);
            const newFavorites = isFavorite
                ? prevFavorites.filter(url => url !== item.url)
                : [...prevFavorites, item.url];
            setStoredData('favorites', newFavorites);
            return newFavorites;
        });
    };

    return {
        favorites,
        handleToggleFavorite
    };
};

export const useModalSettings = () => {
    const [isOpenSettingsModal, setIsOpenSettingsModal] = useState(false);
    const [isCardOpen, setIsCardOpen] = useState(false);

    useEffect(() => {
        window.closeWebViewBottomSheet = function () {
            setIsOpenSettingsModal(false);
            setIsCardOpen(false);
        };
    }, []);

    useEffect(() => {
        if (isOpenSettingsModal) {
            openWebViewBottomSheet();
        } else {
            closeWebViewBottomSheet();
        }
    }, [isOpenSettingsModal]);

    useEffect(() => {
        if (isCardOpen) {
            openWebViewBottomSheet();
        } else {
            closeWebViewBottomSheet();
        }
    }, [isCardOpen]);

    const handleCardClick = () => {
        openCustomBottomSheet("https://klasplus.yuntae.in/modal/idCard", true);
        if (!openCustomBottomSheet) setIsCardOpen(true);
    };

    return {
        isOpenSettingsModal,
        isCardOpen,
        setIsOpenSettingsModal,
        setIsCardOpen,
        handleCardClick
    };
};
