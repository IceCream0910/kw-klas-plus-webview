import moment from 'moment';

export const formatCalendarEvents = (events) => {
    return events.map(event => ({
        ...event,
        start: event.typeNm === "과제"
            ? moment(event.ended, "YYYYMMDDHHmm").startOf('day').toDate()
            : moment(event.started, "YYYYMMDDHHmm").toDate(),
        end: event.typeNm === "과제"
            ? moment(event.ended, "YYYYMMDDHHmm").endOf('day').toDate()
            : moment(event.ended, "YYYYMMDDHHmm").toDate(),
        title: event.title.replace("[개인일정] ", "").replace("[학사일정] ", ""),
        place: event.typeNm === "과제" ? `${event.subj}` : event.place
    }));
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
