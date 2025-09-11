import { useState, useEffect } from 'react';

/**
 * 설정 페이지 상태 관리 커스텀 훅
 * @returns {Object} 설정 관련 상태와 함수들
 */
export const useSettings = () => {
    const [activeTheme, setActiveTheme] = useState("system");
    const [yearHakgi, setYearHakgi] = useState(null);
    const [appVersion, setAppVersion] = useState(null);
    const [isOpenSettingsModal, setIsOpenSettingsModal] = useState(false);
    const [hideGrades, setHideGrades] = useState(false);
    const [showGrades, setShowGrades] = useState(true);
    const [menuOrder, setMenuOrder] = useState([]);

    useEffect(() => {
        // Android 브리지 콜백 설정
        window.receiveTheme = function (theme) {
            if (!theme) return;
            setActiveTheme(theme);
        };

        window.receiveYearHakgi = function (yearHakgi) {
            if (!yearHakgi) return;
            setYearHakgi(yearHakgi);
        };

        window.receiveVersion = function (version) {
            if (!version) return;
            setAppVersion(version);
        };

        // 로컬 스토리지에서 설정 로드
        const savedHideGrades = localStorage.getItem('hideGrades');
        if (savedHideGrades !== null) {
            const parsedHideGrades = savedHideGrades === 'true';
            setHideGrades(parsedHideGrades);
            setShowGrades(!parsedHideGrades);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('hideGrades', hideGrades.toString());
    }, [hideGrades]);

    /**
     * 학점 숨김 설정 변경 핸들러
     * @param {Event} e - 체크박스 이벤트
     */
    const handleHideGradesChange = (e) => {
        const checked = e.target.checked;
        setHideGrades(checked);
        setShowGrades(!checked);
    };

    return {
        activeTheme,
        yearHakgi,
        appVersion,
        isOpenSettingsModal,
        hideGrades,
        showGrades,
        menuOrder,
        setIsOpenSettingsModal,
        handleHideGradesChange
    };
};
