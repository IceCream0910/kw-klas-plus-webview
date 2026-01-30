import { useTimetable } from '../lib/timetable/useTimetable';
import TimetableHeader from '../components/timetable/TimetableHeader';
import TimetableRenderer from '../components/timetable/TimetableRenderer';
import TimetableStyles from '../components/timetable/TimetableStyles';
import BottomNav from '../components/common/bottomNav';
import Spacer from '../components/common/spacer';

export default function Timetable() {
    const {
        timetableData,
        yearHakgiLabel,
        handleClickTimetable
    } = useTimetable();

    return (
        <>
            <TimetableHeader yearHakgiLabel={yearHakgiLabel} />
            <BottomNav currentTab="timetable" />
            <div>
                <TimetableRenderer
                    timetableData={timetableData}
                    onClassClick={handleClickTimetable}
                />
            </div>
            <Spacer y={80} />
            <TimetableStyles />
        </>
    );
}
