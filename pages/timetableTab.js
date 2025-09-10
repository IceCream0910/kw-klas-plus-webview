import { useTimetable } from '../lib/timetable/useTimetable';
import TimetableHeader from '../components/timetable/TimetableHeader';
import TimetableRenderer from '../components/timetable/TimetableRenderer';
import TimetableStyles from '../components/timetable/TimetableStyles';

export default function Timetable() {
    const {
        timetableData,
        yearHakgiLabel,
        handleClickTimetable
    } = useTimetable();

    return (
        <>
            <TimetableHeader yearHakgiLabel={yearHakgiLabel} />
            <div>
                <TimetableRenderer
                    timetableData={timetableData}
                    onClassClick={handleClickTimetable}
                />
            </div>
            <TimetableStyles />
        </>
    );
}
