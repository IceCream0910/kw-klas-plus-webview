import moment from 'moment';

/**
 * 캘린더 이벤트 아이템 컴포넌트
 */
function EventItem({ event, onClick }) {
    const getEventTypeStyle = (typeNm) => {
        const typeColors = {
            '과제': '#e74c3c',
            '시험': '#e67e22',
            '수업': '#3498db',
            '기타': '#95a5a6'
        };

        return {
            backgroundColor: typeColors[typeNm] || typeColors['기타'],
            color: 'white',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '11px',
            marginRight: '8px'
        };
    };

    const formatTime = (date) => {
        return moment(date).format('HH:mm');
    };

    const formatDate = (start, end) => {
        const startMoment = moment(start);
        const endMoment = moment(end);

        if (startMoment.isSame(endMoment, 'day')) {
            return `${formatTime(start)} - ${formatTime(end)}`;
        } else {
            return `${startMoment.format('MM/DD')} - ${endMoment.format('MM/DD')}`;
        }
    };

    return (
        <div
            onClick={() => onClick && onClick(event)}
            style={{
                padding: '12px',
                marginBottom: '8px',
                backgroundColor: 'var(--card-background)',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                cursor: 'pointer'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                <span style={getEventTypeStyle(event.typeNm)}>
                    {event.typeNm}
                </span>
                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
                    {event.title}
                </span>
            </div>

            <div style={{ fontSize: '12px', opacity: 0.7 }}>
                {formatDate(event.start, event.end)}
            </div>

            {event.subjNm && (
                <div style={{ fontSize: '12px', opacity: 0.6, marginTop: '2px' }}>
                    {event.subjNm}
                </div>
            )}
        </div>
    );
}

export default EventItem;
