import {
    getRandomColor,
    getContrastColor,
    calculateTimeRange,
    calculateClassDimensions
} from '../../lib/timetable/timetableHelpers';

const TimetableRenderer = ({ timetableData, onClassClick }) => {
    if (!timetableData) return <div>시간표 로딩 중....</div>;

    const days = ['월', '화', '수', '목', '금'];
    const colorMap = {};
    const uniqueClasses = [...new Set(Object.values(timetableData).flat().map(item => item.title))];
    const { minStartHour, maxEndHour } = calculateTimeRange(timetableData);

    const headerCells = [
        <div key="header-empty" className="header" style={{ width: '20px' }}></div>,
        ...days.map(day => <div key={`header-${day}`} className="header">{day}</div>)
    ];

    const timeCells = [];
    for (let hour = minStartHour; hour <= maxEndHour; hour++) {
        timeCells.push(
            <div key={`time-${hour}`} className="time">{hour}</div>
        );

        for (let day = 0; day < 5; day++) {
            timeCells.push(
                <div key={`cell-${day}-${hour}`} id={`cell-${day}-${hour}`} style={{ height: '60px', position: 'relative' }}>
                    {Object.values(timetableData).flat()
                        .filter(classItem =>
                            classItem.day === day &&
                            parseInt(classItem.startTime.split(':')[0]) === hour
                        )
                        .map((classItem, idx) => {
                            if (!colorMap[classItem.title]) {
                                colorMap[classItem.title] = getRandomColor(uniqueClasses.indexOf(classItem.title), uniqueClasses.length);
                            }

                            const backgroundColor = colorMap[classItem.title];
                            const textColor = getContrastColor(backgroundColor);
                            const { topOffset, height } = calculateClassDimensions(classItem);

                            return (
                                <div
                                    key={`class-${classItem.title}-${idx}`}
                                    className="class"
                                    style={{
                                        top: `${topOffset}px`,
                                        height: `${height}px`,
                                        backgroundColor,
                                        color: textColor
                                    }}
                                    onClick={() => onClassClick(classItem.subj, classItem.title)}
                                >
                                    <div><b>{classItem.title}</b></div>
                                    <div>{classItem.info}</div>
                                </div>
                            );
                        })
                    }
                </div>
            );
        }
    }

    const weekendClasses = Object.values(timetableData).flat()
        .filter(classItem => classItem.day >= 5)
        .map((classItem, idx) => (
            <div
                key={`weekend-${idx}`}
                className="weekend-class"
                onClick={() => onClassClick(classItem.subj, classItem.title)}
            >
                <div><b>{classItem.title}</b></div>
            </div>
        ));

    return (
        <>
            <div className="timetable">
                {headerCells}
                {timeCells}
            </div>
            <div className="weekend-classes">
                {weekendClasses}
            </div>
        </>
    );
};

export default TimetableRenderer;
