const DAY = 24 * 60 * 60 * 1000;
const SEOUL_OFFSET = 9 * 60 * 60 * 1000;
const LECTURE_DATE = /^(\d{4})[-./](\d{1,2})[-./](\d{1,2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}(?:\.\d{1,3})?))?\s*(Z|[+-]\d{2}:?\d{2})?)?$/;

const parseLectureDate = (value, endOfDay = false) => {
    if (typeof value !== 'string') return null;
    const match = value.trim().match(LECTURE_DATE);
    if (!match) return null;

    const [, year, month, day, hour, minute, second, zone] = match;
    const pad = (part) => part.padStart(2, '0');
    const date = `${year}-${pad(month)}-${pad(day)}`;
    const time = hour ? `${pad(hour)}:${minute}:${second ?? '00'}` : endOfDay ? '23:59:59.999' : '00:00:00';
    const timestamp = Date.parse(`${date}T${time}${zone ?? '+09:00'}`);
    return Number.isFinite(timestamp) ? timestamp : null;
};

const getLecturePeriod = (item) => {
    const [rangeStart, rangeEnd] = typeof item.lrnPd === 'string' ? item.lrnPd.split(/[~∼～]/) : [];
    return {
        start: parseLectureDate(item.startDate) ?? parseLectureDate(rangeStart),
        end: parseLectureDate(item.endDate, true) ?? parseLectureDate(rangeEnd, true)
    };
};

const getSeoulDate = (timestamp) => new Date(timestamp + SEOUL_OFFSET);
const formatDate = (date, includeYear = false) => {
    const day = `${date.getUTCMonth() + 1}.${date.getUTCDate()}`;
    return includeYear ? `${date.getUTCFullYear()}.${day}` : day;
};
const formatTime = (date) => date.toISOString().slice(11, 16);

const formatPeriod = (start, end, fallback) => {
    if (start === null || end === null || start > end) return fallback || '';
    const first = getSeoulDate(start);
    const last = getSeoulDate(end);
    const includeYear = first.getUTCFullYear() !== last.getUTCFullYear();
    const from = formatDate(first, includeYear);
    const to = formatDate(last, includeYear);
    const startTime = formatTime(first);
    const endTime = formatTime(last);
    const startLabel = startTime === '00:00' ? from : `${from} ${startTime}`;
    const endLabel = endTime === '23:59' ? to : `${to} ${endTime}`;
    return startLabel === endLabel ? startLabel : `${startLabel} ~ ${endLabel}`;
};

export const isLectureComplete = (item) => Number(item.prog) >= 100;

export const isBeforeStartDate = (item, now = Date.now()) => {
    const { start } = getLecturePeriod(item);
    return start !== null && now < start;
};

export const getLecturePresentation = (item, now) => {
    const { start, end } = getLecturePeriod(item);
    const period = formatPeriod(start, end, item.lrnPd);
    const complete = isLectureComplete(item);
    const upcoming = start !== null && now < start;
    const ended = !complete && !upcoming && end !== null && now > end;
    const progress = Math.max(0, Math.min(100, Number(item.prog) || 0));
    const total = Number(item.ptime);
    const minutes = Number(item.learnTime);
    const duration = Number.isFinite(total) && total > 0 ? `${total}분` : '';
    const watchedTime = duration && item.learnTime != null && Number.isFinite(minutes) && minutes >= 0
        ? `${minutes}/${duration}`
        : '';
    const progressText = `${Math.floor(progress * 10) / 10}%`;

    let status = duration ? `미수강 · ${duration}` : '미수강';
    if (complete) {
        status = '수강 완료';
    } else if (upcoming) {
        status = `${formatDate(getSeoulDate(start))} 수강 시작`;
    } else if (progress > 0) {
        status = watchedTime ? `${progressText} · ${watchedTime}` : progressText;
    }

    if (ended) {
        status = progress > 0 ? `${status} · 기간 종료` : '미수강 · 기간 종료';
    }

    let deadline = '';
    if (!complete && !upcoming && !ended && end !== null && end - now < DAY) {
        const day = getSeoulDate(end).getUTCDate() === getSeoulDate(now).getUTCDate() ? '오늘' : '내일';
        deadline = `${day} ${formatTime(getSeoulDate(end))} 마감`;
    }

    return {
        period, status, deadline, upcoming,
        tone: complete ? 'complete' : ended ? 'ended' : 'neutral',
        progress: progress > 0 && !complete && !upcoming && !ended ? progress : null
    };
};

export const createLectureData = (item) => {
    return {
        grcode: item.grcode,
        subj: item.subj,
        year: item.year,
        hakgi: item.hakgi,
        bunban: item.bunban,
        module: item.module,
        lesson: item.lesson,
        oid: item.oid,
        starting: 'xxx',
        contentsType: 'xxx',
        weekNo: item.weekNo,
        weeklyseq: item.weeklyseq,
        width: item.width,
        height: item.height,
        today: item.today,
        sdate: item.sdate,
        edate: item.edate,
        ptype: item.ptype,
        learnTime: item.learnTime,
        prog: item.prog,
        ptime: item.ptime
    };
};

export const handlePreviewLecture = (item, nativeBridge) => {
    if (item.starting) {
        alert("학습 시작일 이전에 강의 영상을 미리 시청할 수 있습니다. 이 경우 학습 시간은 인정되지 않습니다. 학습 시작일 이후 강의를 다시 시청해야 출석으로 인정되니 주의바랍니다.");
        nativeBridge.openExternalLink(item.starting);
    } else {
        alert("아직 강의 영상이 업로드되지 않았습니다.");
    }
};
