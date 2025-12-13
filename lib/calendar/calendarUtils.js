import moment from 'moment';

export const formatCalendarEvents = (events) => {
    return events.map(event => {
        const isAssignment = event.typeNm === "과제";
        const startedM = moment(event.started, "YYYYMMDDHHmm");
        const endedM = moment(event.ended, "YYYYMMDDHHmm");

        let startVal;
        let endVal;

        if (isAssignment) {
            // 과제는 마감일 하루로 표시 (00:00/23:59 문제 회피)
            startVal = endedM.startOf('day').toDate();
            endVal = endedM.endOf('day').toDate();
        } else {
            const startEdge = startedM.format('HHmm') === '2359';
            const endAtMidnight = endedM.format('HHmm') === '0000';

            // 시작이 23:59면 해당 일자에 표시되도록 그 날의 시작으로 정규화
            startVal = startEdge ? startedM.startOf('day').toDate() : startedM.toDate();

            // 종료가 00:00이면 해당 일자까지 포함되도록 그 날의 끝으로 정규화
            endVal = endAtMidnight ? endedM.endOf('day').toDate() : endedM.toDate();
        }

        return {
            ...event,
            start: startVal,
            end: endVal,
            title: event.title.replace("[개인일정] ", "").replace("[학사일정] ", ""),
            place: isAssignment ? `${event.subj}` : event.place
        };
    });
};

export const getEventsForDate = (events, date) => {
    const dayStart = moment(date).startOf('day');
    const dayEnd = moment(date).endOf('day');

    return events.filter(event =>
        moment(event.start).isBefore(dayEnd) &&
        moment(event.end).isAfter(dayStart)
    );
};

export const getDefaultSelectedDate = (currentMonth) => {
    const today = moment();
    if (today.isSame(currentMonth, 'month')) {
        return today.toDate();
    } else {
        return currentMonth.clone().startOf('month').toDate();
    }
};

export const getEventStyle = (event) => {
    const typeColors = {
        '과제': '#e74c3c',
        '시험': '#e67e22',
        '수업': '#3498db',
        '기타': '#95a5a6'
    };

    return {
        backgroundColor: typeColors[event.typeNm] || typeColors['기타'],
        borderRadius: '3px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
    };
};
