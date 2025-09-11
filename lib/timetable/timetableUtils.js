import { WEEKEND_DAYS, DEADLINE_COLORS, DEADLINE_THRESHOLDS } from '../core/constants';
import { normalizeBuildingName } from '../core/normalizeBuildingName';

export const getCurrentDay = () => {
    let currentDay = new Date().getDay() - 1;
    if (currentDay === -1) currentDay = 6;
    return currentDay;
};

export const getCurrentTimeInHours = () => {
    const now = new Date();
    return now.getHours() + now.getMinutes() / 60;
};

export const timeStringToHours = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(num => parseInt(num));
    return hours + minutes / 60;
};

export const isWeekend = () => {
    return WEEKEND_DAYS.includes(getCurrentDay());
};

export const processTimetableData = (timetableData) => {
    const processedData = {};

    for (const day in timetableData) {
        processedData[day] = timetableData[day].map(item => ({
            ...item,
            info: normalizeBuildingName(item.info.split('/')[0]) + '/' + item.info.split('/').slice(1).join('/')
        }));
    }

    return processedData;
};

export const calculateClassStatus = (timetableData) => {
    const currentDay = getCurrentDay();
    const currentTime = getCurrentTimeInHours();

    if (isWeekend()) {
        return {
            type: 'no_class_weekend',
            message: "오늘 수업이 없어요 😊"
        };
    }

    const todayClasses = Object.values(timetableData)
        .flatMap(classes => classes.filter(c => c.day === currentDay));

    if (todayClasses.length === 0) {
        return {
            type: 'no_class_today',
            message: "오늘 수업이 없어요 😊"
        };
    }

    // 현재 진행 중인 수업 찾기
    for (const classItem of todayClasses) {
        const startTime = timeStringToHours(classItem.startTime);
        const endTime = timeStringToHours(classItem.endTime);

        if (startTime <= currentTime && currentTime < endTime) {
            const endHour = Math.floor(endTime);
            const endMinute = Math.floor((endTime - endHour) * 60);

            return {
                type: 'ongoing_class',
                classInfo: classItem,
                message: `<span style="opacity: 0.6">지금은</span><br/>${classItem.title} <span style="opacity: 0.6">수업 중</span>
        <br/>
        <span style="opacity: 0.6; font-size:14px;">${endHour}:${endMinute.toString().padStart(2, '0')}에 종료</span>`
            };
        }
    }

    // 다음 수업 찾기
    const upcomingClasses = todayClasses
        .filter(c => timeStringToHours(c.startTime) > currentTime)
        .sort((a, b) => timeStringToHours(a.startTime) - timeStringToHours(b.startTime));

    if (upcomingClasses.length > 0) {
        const nextClass = upcomingClasses[0];
        const startTime = timeStringToHours(nextClass.startTime);
        const startHour = Math.floor(startTime);
        const startMinute = Math.floor((startTime - startHour) * 60);
        const building = nextClass.info.split('/')[0];
        const professor = nextClass.info.split('/').slice(1).join('/');
        const buildingName = building.match(/^([가-힣]+)(\d+.*)?$/)?.[1] || building;

        return {
            type: 'upcoming_class',
            classInfo: nextClass,
            buildingName,
            message: `${startHour}:${startMinute.toString().padStart(2, '0')}<span style="opacity: 0.6">에</span><br/> ${nextClass.title} <span style="opacity: 0.6">수업이 있어요.</span>
      <br/>
      <span style="opacity: 0.6; font-size:14px;"><span onclick="window.openBuildingMap('${buildingName}')" style="text-decoration: underline; cursor: pointer;">${building}</span> / ${professor} 교수</span>`
        };
    }

    return {
        type: 'no_more_classes',
        message: "오늘 수업이 더 이상 없어요 😎"
    };
};

export const getDeadlineColor = (hourGap) => {
    if (hourGap <= DEADLINE_THRESHOLDS.URGENT) return DEADLINE_COLORS.URGENT;
    if (hourGap <= DEADLINE_THRESHOLDS.WARNING) return DEADLINE_COLORS.WARNING;
    return DEADLINE_COLORS.SAFE;
};

export const formatDeadline = (hourGap) => {
    if (hourGap === Infinity) return null;

    const remainingDay = Math.floor(hourGap / 24);
    return remainingDay === 0 ? 'D-DAY' : `D-${remainingDay}`;
};
