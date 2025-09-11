import { normalizeBuildingName } from '../core/normalizeBuildingName';


export const preprocessTimetableData = (data) => {
    const processedData = {};
    for (const day in data) {
        processedData[day] = data[day].map(item => ({
            ...item,
            info: normalizeBuildingName(item.info.split('/')[0]) + '/' + item.info.split('/').slice(1).join('/')
        }));
    }
    return processedData;
};

export const getRandomColor = (index, total) => {
    const hue = (index / total) * 360;
    const saturation = 70 + Math.random() * 10;
    const lightness = 65 + Math.random() * 10;

    const c = (1 - Math.abs(2 * lightness / 100 - 1)) * saturation / 100;
    const x = c * (1 - Math.abs((hue / 60) % 2 - 1));
    const m = lightness / 100 - c / 2;

    let r, g, b;
    if (hue < 60) {
        [r, g, b] = [c, x, 0];
    } else if (hue < 120) {
        [r, g, b] = [x, c, 0];
    } else if (hue < 180) {
        [r, g, b] = [0, c, x];
    } else if (hue < 240) {
        [r, g, b] = [0, x, c];
    } else if (hue < 300) {
        [r, g, b] = [x, 0, c];
    } else {
        [r, g, b] = [c, 0, x];
    }

    const toHex = (c) => {
        const hex = Math.round((c + m) * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

export const getContrastColor = (hexcolor) => {
    const r = parseInt(hexcolor.substr(1, 2), 16);
    const g = parseInt(hexcolor.substr(3, 2), 16);
    const b = parseInt(hexcolor.substr(5, 2), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? 'black' : 'white';
};

export const calculateTimeRange = (timetableData) => {
    let minStartHour = 24;
    let maxEndHour = 0;

    Object.values(timetableData).flat().forEach(classItem => {
        const startHour = parseInt(classItem.startTime.split(':')[0]);
        const endHour = parseInt(classItem.endTime.split(':')[0]);
        if (startHour === 0 && endHour === 0) return;
        minStartHour = Math.min(minStartHour, startHour);
        maxEndHour = Math.max(maxEndHour, endHour);
    });

    return { minStartHour, maxEndHour };
};

export const calculateClassDimensions = (classItem) => {
    const startTime = classItem.startTime.split(':');
    const endTime = classItem.endTime.split(':');
    const startHour = parseInt(startTime[0]);
    const endHour = parseInt(endTime[0]);
    const startMinute = parseInt(startTime[1]);
    const endMinute = parseInt(endTime[1]);
    const duration = (endHour - startHour) + (endMinute - startMinute) / 60;

    const topOffset = (startMinute / 60) * 60;
    const height = duration * 60;

    return { topOffset, height, duration };
};
