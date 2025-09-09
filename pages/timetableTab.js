import { useTimetable } from '../lib/hooks/useTimetable';
import TimetableHeader from './components/TimetableHeader';
import TimetableRenderer from './components/TimetableRenderer';
import TimetableStyles from './components/TimetableStyles';

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
