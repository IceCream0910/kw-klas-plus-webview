
export const getDefaultHakgi = () => {
    const currentMonth = new Date().getMonth();
    return currentMonth < 8 ? 1 : 2;
};

export const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 11 }, (_, index) => currentYear - index);
};

export const validateSearchParams = ({ name, professor, selectedGwamok, selectedHakgwa, isMy }) => {
    if (!name && !professor && !selectedGwamok && !selectedHakgwa && !isMy) {
        return false;
    }
    return true;
};

export const generateLecturePlanId = (item) => {
    return `U${item.thisYear}${item.hakgi}${item.openGwamokNo}${item.openMajorCode}${item.bunbanNo}${item.openGrade}`;
};

export const getLectureStatus = (item) => {
    return {
        isAccessible: item.summary && !item.closeOpt,
        isClosed: item.closeOpt !== null,
        isNotUploaded: !item.summary
    };
};
