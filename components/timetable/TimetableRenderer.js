import {
    getRandomColor,
    getContrastColor,
    calculateTimeRange,
    calculateClassDimensions
} from '../../lib/timetable/timetableHelpers';
import { SkeletonLayouts } from '../common/Skeleton';

const TimetableRenderer = ({ timetableData, onClassClick }) => {
    if (!timetableData) return <SkeletonLayouts.Timetable />;

    const days = ['월', '화', '수', '목', '금'];
    const colorMap = {};
    const flatClasses = Object.values(timetableData).flat();
    const uniqueClasses = [...new Set(flatClasses.map(item => item.title))];
    const uniqueClassesIndices = Object.fromEntries(uniqueClasses.map((title, i) => [title, i]));
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
                    {flatClasses.reduce((acc, classItem) => {
                        if (
                            classItem.day === day &&
                            parseInt(classItem.startTime.split(':')[0]) === hour
                        ) {
                            if (!colorMap[classItem.title]) {
                                colorMap[classItem.title] = getRandomColor(uniqueClassesIndices[classItem.title], uniqueClasses.length);
                            }

                            const backgroundColor = colorMap[classItem.title];
                            const textColor = getContrastColor(backgroundColor);
                            const { topOffset, height } = calculateClassDimensions(classItem);

                            acc.push(
                                <div
                                    key={`class-${classItem.title}-${acc.length}`}
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
                        }
                        return acc;
                    }, [])}
                </div>
            );
        }
    }

    const weekendClasses = flatClasses.reduce((acc, classItem) => {
        if (classItem.day >= 5) {
            acc.push(
                <div
                    key={`weekend-${acc.length}`}
                    className="weekend-class"
                    onClick={() => onClassClick(classItem.subj, classItem.title)}
                >
                    <div><b>{classItem.title}</b></div>
                </div>
            );
        }
        return acc;
    }, []);

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
