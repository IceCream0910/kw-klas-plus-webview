import { getDeadlineColor, formatDeadline } from '../../lib/timetable/timetableUtils';

function DeadlineContent({ name, data }) {
    if (data.length === 0) return null;

    const { hourGap } = data[0];

    if (hourGap === Infinity) {
        return (
            <span style={{ color: 'var(--green)' }} className="remain-none">
                남아있는 {name}가 없습니다!
            </span>
        );
    }

    const deadline = formatDeadline(hourGap);
    const color = getDeadlineColor(hourGap);

    return (
        <span className="will-remain" style={{ marginBottom: '5px' }}>
            <b style={{ fontSize: '20px', color }}>{deadline}</b> {name} 총 {data.length}개
            <svg
                style={{ width: '15px', marginLeft: '-7px' }}
                xmlns="http://www.w3.org/2000/svg"
                className="ionicon"
                viewBox="0 0 512 512"
            >
                <path
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="48"
                    d="M184 112l144 144-144 144"
                />
            </svg>
        </span>
    );
}

export default DeadlineContent;
