import { hasKlasSession } from '../core/nativeApp';
import { setSearchSession } from '../search/session';
import KlasNativeBridge from '../core/klasNativeBridge';
import { useState, useEffect } from "react";
import { KLAS } from "../core/klas";
import handleCalculateGPA, { calculateGPA } from "../grade/calculateGPA";
import { getStoredData, setStoredData } from "../core/storageUtils";

export const useProfileData = () => {
    const [token, setToken] = useState("");
    const [profile, setProfile] = useState(null);
    const [totGrade, setTotGrade] = useState(undefined);

    useEffect(() => {
        window.receiveToken = function (receivedToken) {
            if (!hasKlasSession(receivedToken)) return;
            setSearchSession(receivedToken);
            if (receivedToken) setToken(receivedToken);
        };

        try { KlasNativeBridge.completePageLoad() } catch (error) { console.log('not app') }

        return () => {
            window.receiveToken = undefined;
        }
    }, []);

    useEffect(() => {
        if (!hasKlasSession(token)) return;
        const controller = new AbortController();
        const fetchProfile = (path, body) => KLAS(path, token, body, { signal: controller.signal });
        setProfile(null);
        setTotGrade(undefined);

        Promise.allSettled([
            fetchProfile("https://klas.kw.ac.kr/std/cps/inqire/AtnlcScreHakjukInfo.do"),
            fetchProfile("https://klas.kw.ac.kr/mst/lis/evltn/LrnSttusStdOne.do", {})
        ]).then(([record, student]) => {
            if (controller.signal.aborted) return;
            if (record.status === 'rejected') console.error(record.reason);
            if (student.status === 'rejected') console.error(student.reason);
            setProfile({
                data: record.status === 'fulfilled' ? record.value : null,
                stdInfo: student.status === 'fulfilled' ? student.value : null
            });
        });

        fetchProfile("https://klas.kw.ac.kr/std/cps/inqire/AtnlcScreSungjukInfo.do")
            .then((grade) => {
                if (controller.signal.aborted) return;
                const grades = calculateGPA(handleCalculateGPA(grade));
                setTotGrade(grades.find((semester) => semester.name === '전체 학기') ?? null);
            })
            .catch((error) => {
                if (controller.signal.aborted) return;
                console.error(error);
                setTotGrade(null);
            });

        return () => controller.abort();
    }, [token]);

    return { profile, totGrade };
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
            KlasNativeBridge.openWebViewBottomSheet();
        } else {
            KlasNativeBridge.closeWebViewBottomSheet();
        }
    }, [isOpenSettingsModal]);

    useEffect(() => {
        if (isCardOpen) {
            KlasNativeBridge.openWebViewBottomSheet();
        } else {
            KlasNativeBridge.closeWebViewBottomSheet();
        }
    }, [isCardOpen]);

    const handleCardClick = () => {
        setIsCardOpen(true);
    };

    return {
        isOpenSettingsModal,
        isCardOpen,
        setIsOpenSettingsModal,
        setIsCardOpen,
        handleCardClick
    };
};
