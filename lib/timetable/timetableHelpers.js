import { normalizeBuildingName } from '../core/normalizeBuildingName';

/**
 * 시간표 데이터 전처리
 * @param {Object} data - 원본 시간표 데이터
 * @returns {Object} 전처리된 시간표 데이터
 */
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

/**
 * 랜덤 색상 생성
 * @param {number} index - 인덱스
 * @param {number} total - 전체 개수
 * @returns {string} HEX 색상 코드
 */
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

/**
 * 대비 색상 계산
 * @param {string} hexcolor - HEX 색상 코드
 * @returns {string} 대비 색상 ('black' 또는 'white')
 */
export const getContrastColor = (hexcolor) => {
    const r = parseInt(hexcolor.substr(1, 2), 16);
    const g = parseInt(hexcolor.substr(3, 2), 16);
    const b = parseInt(hexcolor.substr(5, 2), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? 'black' : 'white';
};

/**
 * 시간표의 최소/최대 시간 계산
 * @param {Object} timetableData - 시간표 데이터
 * @returns {Object} { minStartHour, maxEndHour }
 */
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

/**
 * 수업 블록의 위치와 크기 계산
 * @param {Object} classItem - 수업 데이터
 * @returns {Object} { topOffset, height, duration }
 */
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
