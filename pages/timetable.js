import { useState, useEffect } from 'react';
import Header from "./components/header";
import IonIcon from '@reacticons/ionicons';

export default function Timetable() {
    const [timetableData, setTimetableData] = useState(null);
    const days = ['월', '화', '수', '목', '금'];
    const [yearHakgiLabel, setYearHakgiLabel] = useState("");

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);

        window.receiveTimetableData = (data) => {
            const parsedData = JSON.parse(data);
            console.log(parsedData);
            setTimetableData(parsedData);
        };

        window.updateYearHakgiBtnText = (text) => {
            setYearHakgiLabel(text);
        }

        return () => {
            window.receiveTimetableData = undefined;
            window.updateYearHakgiBtnText = undefined;
        };
    }, []);


    const getRandomColor = (index, total) => {
        const hue = (index / total) * 360;
        const saturation = 70 + Math.random() * 10;
        const lightness = 65 + Math.random() * 10;

        const c = (1 - Math.abs(2 * lightness / 100 - 1)) * saturation / 100;
        const x = c * (1 - Math.abs((hue / 60) % 2 - 1));
        const m = lightness / 100 - c / 2;

        let r, g, b;
        if (hue < 60) {
            [r, g, b] = [c, x, 0];
        } else if (hue < 120) {
            [r, g, b] = [x, c, 0];
        } else if (hue < 180) {
            [r, g, b] = [0, c, x];
        } else if (hue < 240) {
            [r, g, b] = [0, x, c];
        } else if (hue < 300) {
            [r, g, b] = [x, 0, c];
        } else {
            [r, g, b] = [c, 0, x];
        }

        const toHex = (c) => {
            const hex = Math.round((c + m) * 255).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };

        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    };

    const getContrastColor = (hexcolor) => {
        var r = parseInt(hexcolor.substr(1, 2), 16);
        var g = parseInt(hexcolor.substr(3, 2), 16);
        var b = parseInt(hexcolor.substr(5, 2), 16);
        var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return (yiq >= 128) ? 'black' : 'white';
    };

    const handleClickTimetable = (subjId, title) => {
        if (typeof window !== 'undefined' && window.Android) {
            window.Android.openLectureActivity(subjId, title);
        } else {
            console.log(`Clicked: ${title} (${subjId})`);
        }
    };

    const renderTimetable = () => {
        if (!timetableData) return null;

        const colorMap = {};
        const uniqueClasses = [...new Set(Object.values(timetableData).flat().map(item => item.title))];

        let minStartHour = 24;
        let maxEndHour = 0;
        Object.values(timetableData).flat().forEach(classItem => {
            const startHour = parseInt(classItem.startTime.split(':')[0]);
            const endHour = parseInt(classItem.endTime.split(':')[0]);
            if (startHour === 0 && endHour === 0) return;
            minStartHour = Math.min(minStartHour, startHour);
            maxEndHour = Math.max(maxEndHour, endHour);
        });

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

                                const startTime = classItem.startTime.split(':');
                                const endTime = classItem.endTime.split(':');
                                const startHour = parseInt(startTime[0]);
                                const endHour = parseInt(endTime[0]);
                                const startMinute = parseInt(startTime[1]);
                                const endMinute = parseInt(endTime[1]);
                                const duration = (endHour - startHour) + (endMinute - startMinute) / 60;

                                const topOffset = (startMinute / 60) * 60;
                                const height = duration * 60;

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
                                        onClick={() => handleClickTimetable(classItem.subj, classItem.title)}
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
                    onClick={() => handleClickTimetable(classItem.subj, classItem.title)}
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

    return (
        <>
            <Header title={<button onClick={() => Android.openYearHakgiBottomSheet()} style={{ background: 'var(--card-background)', width: 'fit-content', padding: '10px 15px', borderRadius: '20px', fontSize: '0.9rem' }}>
                {yearHakgiLabel}
                <IonIcon name='chevron-down' style={{ position: 'relative', top: '2px', marginLeft: '5px', opacity: .5 }} />
            </button>} />

            <div>
                {timetableData ? renderTimetable() : <div>시간표 로딩 중....</div>}
            </div>

            <style jsx global>{`    q
        :root {
          --bg-color: #f5e8e8;
          --text-color: #000000;
          --header-bg: #f0f0f0;
          --cell-border: #fff8f7;
        }

        @media (prefers-color-scheme: dark) {
          :root {
            --bg-color: #3a3434;
            --text-color: #ffffff;
            --header-bg: #1e1e1e;
            --cell-border: #211e1e;
          }
        }

        body {
          margin: 0;
          padding: 0;
          padding-top: 20px;
          color: var(--text-color);
        }

        .timetable {
          display: grid;
          grid-template-columns: 20px repeat(5, 1fr);
          gap: 1px;
          margin-bottom: 20px;
          background-color: var(--bg-color);
        }

        .timetable > div {
          text-align: left;
          background-color: var(--cell-border);
        }

        .timetable .class {
          position: absolute;
          z-index: 2;
        }

        .header {
          font-weight: bold;
          text-align: center !important;
          height: 30px;
        }

        .time {
          grid-column: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          font-size: 10px;
        }

        .class {
          cursor: pointer;
          font-size: 0.8em;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          border-radius: 10px;
          padding: 5px;
          position: absolute;
          width: calc(100% - 10px);
          transition: all 0.3s;
          overflow: hidden;
        }

        .class:active {
          transform: scale(0.95);
        }

        .weekend-classes {
          padding: 15px;
        }

        .weekend-class {
          background-color: var(--bg-color);
          padding: 10px 15px;
          margin-bottom: 10px;
          border-radius: 15px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .weekend-class:active {
          transform: scale(0.98);
        }
      `}</style>
        </>
    );
}
