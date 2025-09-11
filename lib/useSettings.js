import { useState, useEffect } from 'react';

export const useSettings = () => {
    const [activeTheme, setActiveTheme] = useState("system");
    const [yearHakgi, setYearHakgi] = useState(null);
    const [appVersion, setAppVersion] = useState(null);
    const [isOpenSettingsModal, setIsOpenSettingsModal] = useState(false);
    const [hideGrades, setHideGrades] = useState(false);
    const [showGrades, setShowGrades] = useState(true);
    const [menuOrder, setMenuOrder] = useState([]);

    useEffect(() => {
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
