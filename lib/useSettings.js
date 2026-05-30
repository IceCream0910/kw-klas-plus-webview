import { useState, useEffect } from 'react';

export const useSettings = () => {
    const [activeTheme, setActiveTheme] = useState("system");
    const [yearHakgi, setYearHakgi] = useState(null);
    const [appVersion, setAppVersion] = useState(null);
    const [isOpenSettingsModal, setIsOpenSettingsModal] = useState(false);
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
    }, []);

    return {
        activeTheme,
        yearHakgi,
        appVersion,
        isOpenSettingsModal,
        menuOrder,
        setIsOpenSettingsModal
    };
};
