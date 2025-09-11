import React, { useState, useEffect, cloneElement, Children } from 'react';
import Spacer from "../components/common/spacer";
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { BottomSheet } from 'react-spring-bottom-sheet';
import 'react-spring-bottom-sheet/dist/style.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import IonIcon from '@reacticons/ionicons';
import { KLAS } from "../lib/core/klas";
import { formatCalendarEvents, getEventsForDate, getDefaultSelectedDate, getEventStyle } from '../lib/calendar/calendarUtils';
import { openWebViewBottomSheet, closeWebViewBottomSheet } from '../lib/core/androidBridge';
import { useCalendar } from '../lib/calendar/useCalendar';
import EventItem from '../components/calendar/EventItem';

const localizer = momentLocalizer(moment);
var yearHakgi;

const TouchCellWrapper = ({ children, value, onSelectSlot }) =>
    cloneElement(Children.only(children), {
        onTouchEnd: (event) => {
            const bounds = event.target.getBoundingClientRect();
            onSelectSlot({
                slots: [value],
                start: value,
                end: new Date(new Date(value).getTime() + 24 * 60 * 60 * 1000),
                action: "click",
            });
        },
    });


export default function CalendarPage() {
    const {
        token,
        events,
        selectedDate,
        selectedEvent,
        isModalOpen,
        isAddingEvent,
        selectedDayEvents,
        currentMonth,
        setToken,
        handleSlotSelect,
        handleEventSelect,
        handleNavigate,
        openAddEventModal,
        closeModal,
        updateSelectedDayEvents,
        fetchEvents,
        handleSaveEvent,
        handleDeleteEvent,
        formatEventForForm
    } = useCalendar();

    const handleSelectSlot = (slotInfo) => {
        handleSlotSelect(slotInfo);
    };

    const handleSelectEvent = (selectedEvent) => {
        handleEventSelect(selectedEvent);
    };

    const handlePrevMonth = () => {
        handleNavigate(currentMonth.clone().subtract(1, 'months').toDate());
    };

    const handleNextMonth = () => {
        handleNavigate(currentMonth.clone().add(1, 'months').toDate());
    };

    const handleNextDay = () => {
        const nextDay = moment(selectedDate).add(1, 'day').toDate();
        handleSlotSelect({ start: nextDay });
    };

    const handlePrevDay = () => {
        const prevDay = moment(selectedDate).subtract(1, 'day').toDate();
        handleSlotSelect({ start: prevDay });
    };

    const moveToToday = () => {
        const today = moment().toDate();
        handleNavigate(today);
        handleSlotSelect({ start: today });
    };

    const eventStyleGetter = (event) => {
        return {
            style: {
                backgroundColor: event.schdulColor,
            }
        };
    };

    const dayPropGetter = (date) => {
        const isSelected = moment(date).isSame(selectedDate, 'day');
        return {
            style: {
                backgroundColor: isSelected ? 'var(--card-background)' : 'inherit',
            },
        };
    };

    const onSelectSlot = ({ action, slots }) => {
        return false;
    };

    return (
        <main style={{ padding: '0px 5px 20px 5px' }}>
            <div style={styles.header}>

                <h2 style={{ marginBottom: '20px', marginTop: '20px' }}>{currentMonth.format('MM월')}
                    <button onClick={handleNextMonth}
                        style={{ float: 'right', border: '1px solid var(--card-background)', width: 'fit-content', fontSize: '14px', marginTop: '-5px', borderRadius: '20px', padding: '10px 15px' }}>
                        →
                    </button>
                    <button onClick={handlePrevMonth}
                        style={{ float: 'right', border: '1px solid var(--card-background)', width: 'fit-content', fontSize: '14px', marginTop: '-5px', borderRadius: '20px', padding: '10px 15px', marginRight: '10px' }}>
                        ←
                    </button>
                    <button onClick={moveToToday}
                        style={{ float: 'right', border: '1px solid var(--card-background)', width: 'fit-content', fontSize: '14px', marginTop: '-5px', borderRadius: '20px', padding: '10px 15px', marginRight: '10px' }}>
                        오늘
                    </button>
                </h2>
            </div>
            <Spacer y={10} />
            <div style={styles.calendarContainer}>
                <Calendar
                    components={{
                        dateCellWrapper: (props) => (
                            <TouchCellWrapper {...props} onSelectSlot={handleSelectSlot} />
                        )
                    }}
                    localizer={localizer}
                    events={events}
                    startAccessor={(event) => event.typeNm === "과제" ? event.end : event.start}
                    endAccessor="end"
                    style={styles.calendar}
                    onSelectSlot={handleSelectSlot}
                    onSelectEvent={handleSelectEvent}
                    selectable
                    eventPropGetter={eventStyleGetter}
                    dayPropGetter={dayPropGetter}
                    views={['month']}
                    toolbar={false}
                    date={currentMonth.toDate()}
                    onNavigate={(newDate) => setCurrentMonth(moment(newDate))}
                    onDrillDown={(date) => {
                        handleSelectSlot({ start: date, end: moment(date).add(1, 'day').toDate() });
                    }}
                    longPressThreshold={1}
                />
            </div>

            {selectedDate && (
                <div style={styles.todayView}>
                    <div style={styles.dateHeader}>
                        <h3>{moment(selectedDate).format('MM월 DD일, YYYY')}
                            <button onClick={handleNextDay} disabled={moment(selectedDate).isSame(currentMonth.clone().endOf('month'), 'day')}
                                style={{ float: 'right', border: '1px solid var(--card-background)', width: 'fit-content', fontSize: '14px', marginTop: '-10px', borderRadius: '20px', padding: '10px 15px' }}>
                                →
                            </button>
                            <button onClick={handlePrevDay} disabled={moment(selectedDate).isSame(currentMonth.clone().startOf('month'), 'day')}
                                style={{ float: 'right', border: '1px solid var(--card-background)', width: 'fit-content', fontSize: '14px', marginTop: '-10px', borderRadius: '20px', padding: '10px 15px', marginRight: '10px' }}>
                                ←
                            </button>
                        </h3>
                    </div>
                    <Spacer y={15} />
                    {selectedDayEvents.length > 0 ? (
                        selectedDayEvents.map((event, index) => (
                            <div key={index} style={styles.eventItem} onClick={() => handleSelectEvent(event)}>
                                <div style={{ ...styles.eventColor, backgroundColor: event.schdulColor }}></div>
                                <div>
                                    <div>{event.title}</div>
                                    <div style={{ opacity: .6 }}>{moment(event.start).format('HH:mm')} - {moment(event.end).format('HH:mm')}</div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>이 날은 일정이 없어요 <span className='tossface'>😎</span></p>
                    )}
                </div>
            )}
            <Spacer y={5} />
            <button style={{ background: 'var(--card-background)' }} onClick={() => {
                openAddEventModal();
            }}>
                + 일정 추가
            </button>
            <BottomSheet
                open={isModalOpen}
                onDismiss={() => { closeModal(); }}
            >
                <EventForm
                    event={isAddingEvent ? {
                        start: moment(selectedDate).startOf('day').toDate(),
                        end: moment(selectedDate).endOf('day').toDate(),
                        typeNm: "개인일정"
                    } : selectedEvent}
                    date={selectedDate}
                    onSave={handleSaveEvent}
                    onDelete={handleDeleteEvent}
                    onClose={() => { closeModal(); }}
                />
            </BottomSheet>
        </main>
    );
}



function EventForm({ event, date, onSave, onDelete, onClose }) {
    const [title, setTitle] = useState('');
    const [start, setStart] = useState(new Date());
    const [end, setEnd] = useState(new Date());
    const [color, setColor] = useState('#e95d5d');
    const [place, setPlace] = useState('');
    const [isAllDay, setIsAllDay] = useState(false);
    const [isEditingStart, setIsEditingStart] = useState(false);
    const [isEditingEnd, setIsEditingEnd] = useState(false);
    const [isEditingTitle, setIsEditingTitle] = useState(false);

    useEffect(() => {
        window.setDateTime = (dateTimeStr, isStart) => {
            const newDateTime = new Date(dateTimeStr);
            handleDateTimeChange(isStart, newDateTime);
        };
    }, []);

    useEffect(() => {
        if (event) {
            setTitle(event.title || '');
            setStart(event.start || new Date());
            setEnd(event.end || new Date());
            setColor(event.schdulColor || '#e95d5d');
            setPlace(event.place || '');
        } else if (date) {
            setStart(date);
            setEnd(date);
        }
    }, [event, date]);


    const handleSubmit = (e) => {
        e.preventDefault();
        const eventData = {
            title,
            sdate: moment(start).format('YYYY-MM-DD'),
            edate: moment(end).format('YYYY-MM-DD'),
            stimeHour: isAllDay ? '00' : moment(start).format('HH'),
            stimeMin: isAllDay ? '00' : moment(start).format('mm'),
            etimeHour: isAllDay ? '23' : moment(end).format('HH'),
            etimeMin: isAllDay ? '59' : moment(end).format('mm'),
            schdulId: event ? event.schdulId : '',
            schdulColor: color,
            place,
        };

        if (eventData.title === "") {
            alert('제목을 입력해주세요.');
            return;
        }

        if (moment(start).isAfter(end)) {
            alert('종료 일시가 종료 일시보다 빠를 수 없습니다.');
            return;
        }

        onSave(eventData);
    };


    const handleNativeDateTimePicker = (isStart) => {
        const currentDateTime = isStart ?
            moment(start).format('YYYY-MM-DDTHH:mm') :
            moment(end).format('YYYY-MM-DDTHH:mm');

        Android.openDateTimePicker(currentDateTime, isStart);
    };

    const formatDate = (date) => {
        const days = ['일', '월', '화', '수', '목', '금', '토'];
        const d = new Date(date);
        return `${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`;
    };

    const formatTime = (date) => {
        return moment(date).format('h:mm A');
    };

    const handleAllDayToggle = () => {
        setIsAllDay(!isAllDay);
        if (!isAllDay) {
            setStart(moment(start).startOf('day').toDate());
            setEnd(moment(end).endOf('day').toDate());
        }
    };

    const handleDateTimeChange = (isStart, newDateTime) => {
        if (isStart) {
            setStart(newDateTime);
            setIsEditingStart(false);
        } else {
            setEnd(newDateTime);
            setIsEditingEnd(false);
        }
    };

    const handleTitleClick = () => {
        setIsEditingTitle(true);  // 제목을 클릭하면 편집 모드로 전환
    };

    const handleTitleBlur = () => {
        setIsEditingTitle(false);  // input에서 벗어나면 편집 모드 종료
    };

    return (
        <div style={styles.form}>
            <div style={{ maxHeight: '70dvh', overflow: 'scroll' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    {isEditingTitle ? (
                        <input
                            type="text"
                            value={title}
                            placeholder="제목 입력"
                            onChange={(e) => setTitle(e.target.value)}
                            onBlur={handleTitleBlur}
                            autoFocus
                            style={styles.titleInput}
                        />
                    ) : (

                        <h2 onClick={(event && event.typeNm == "개인일정") ? handleTitleClick : null} style={{ fontSize: '22px', padding: '7px 5px 5px 0' }}>
                            {title || '제목 입력'}
                        </h2>
                    )}

                    {event && event.typeNm == "개인일정" && (
                        <button type="button" onClick={() => onDelete(event)} style={styles.deleteButton}>
                            <IonIcon style={{ position: 'relative', top: '2px' }} name="trash-outline" />
                        </button>
                    )}
                </div>

                <Spacer y={20} />
                <div style={styles.timeSelector}>
                    {event && event.typeNm == "개인일정" && (
                        <div style={styles.timeSelectorHeader}>
                            <span>기간</span>
                            <label style={styles.allDayToggle}>
                                <input
                                    type="checkbox"
                                    checked={isAllDay}
                                    onChange={handleAllDayToggle}
                                    style={styles.allDayCheckbox}
                                />
                                <span>하루 종일</span>
                            </label>
                        </div>)}
                    <div style={styles.dateTimeInputs}>
                        <div style={styles.dateTimeInput} onClick={() => {
                            if (event && event.typeNm === "개인일정") {
                                try {
                                    handleNativeDateTimePicker(true);
                                } catch (e) {
                                    setIsEditingStart(true);
                                }
                            }
                        }}>
                            {isEditingStart ? (
                                <input
                                    type={isAllDay ? 'date' : 'datetime-local'}
                                    value={moment(start).format('YYYY-MM-DDTHH:mm')}
                                    onChange={(e) => handleDateTimeChange(true, new Date(e.target.value))}
                                    style={styles.dateTimeEditor}
                                    autoFocus
                                    onBlur={() => setIsEditingStart(false)}
                                />
                            ) : (
                                <>
                                    <div>{formatDate(start)}</div>
                                    {!isAllDay && <div>{formatTime(start)}</div>}
                                </>
                            )}
                        </div>
                        <span style={styles.dateTimeSeparator}>{'>'}</span>
                        <div style={styles.dateTimeInput} onClick={() => {
                            if (event && event.typeNm === "개인일정") {
                                try {
                                    handleNativeDateTimePicker(false);
                                } catch (e) {
                                    setIsEditingEnd(true);
                                }
                            }
                        }}>
                            {isEditingEnd ? (
                                <input
                                    type={isAllDay ? 'date' : 'datetime-local'}
                                    value={moment(end).format('YYYY-MM-DDTHH:mm')}
                                    onChange={(e) => handleDateTimeChange(false, new Date(e.target.value))}
                                    style={styles.dateTimeEditor}
                                    autoFocus
                                    onBlur={() => setIsEditingEnd(false)}
                                />
                            ) : (
                                <>
                                    <div>{formatDate(end)}</div>
                                    {!isAllDay && <div>{formatTime(end)}</div>}
                                </>
                            )}
                        </div>
                    </div>
                </div>
                {event && event.typeNm == "개인일정" && (
                    <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '10px' }}>
                        <span>색상</span>
                        <input
                            type="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            style={styles.colorInput}
                        />
                    </div>
                )}

                <Spacer y={10} />

                {place.startsWith("U20") ? (<>
                    <button onClick={() => {
                        if (yearHakgi != null && yearHakgi != `${event.year},${event.hakgi}`) {
                            alert('시간표 탭에서 선택되어 있는 학기와 일치하는 강의만 조회할 수 있습니다.' + yearHakgi + " " + `${event.year},${event.hakgi}`);
                            return;
                        }
                        Android.openLectureActivity(place, event.title.split("::")[0].replace("[과제] ", "").trim())
                    }}>해당 강의 홈으로 이동 →</button>
                </>) : (<>
                    <input
                        disabled={event && event.typeNm == "개인일정" ? false : true}
                        type="text"
                        value={place}
                        onChange={(e) => setPlace(e.target.value)}
                        placeholder="메모"
                        style={styles.input}
                    />
                </>)
                }
            </div>

            <div className='bottom-sheet-footer'>
                {event && event.typeNm == "개인일정" ? (<>
                    <button type="button" onClick={onClose} style={styles.button}>취소</button>
                    <button type="submit" onClick={handleSubmit} style={styles.primaryButton}>저장</button>
                </>) : (<>
                    <button type="button" onClick={onClose} style={styles.button}>닫기</button>
                </>)
                }

            </div>
        </div>
    );
}


const styles = {
    header: {
        marginBottom: '20px',
    },
    calendarContainer: {
        height: '50dvh',
        marginBottom: '20px',
    },
    calendar: {
        height: '100%',
        marginLeft: '-10px',
        marginRight: '-10px',
    },
    eventItem: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '10px',
        cursor: 'pointer',
    },
    eventColor: {
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        marginRight: '10px',
    },
    form: {
        padding: '20px',
        paddingBottom: '80px'
    },
    titleInput: {
        width: '100%',
        background: 'none',
        fontSize: '22px',
        fontWeight: 'bold',
        padding: 0,
        borderRadius: 0
    },
    input: {
        width: '100%',
        padding: '10px',
        marginBottom: '10px',
        border: '1px solid var(--card-border)',
        borderRadius: '15px',
    },
    colorInput: {
        width: '40px',
        height: '40px',
        padding: '5px',
        background: 'none',
        borderRadius: '50%'
    },
    arrowButton: {
        width: '30px'
    },
    deleteButton: {
        background: 'none',
        color: 'var(--red)',
        textAlign: 'right',
        float: 'right',
        width: '50px'
    },
    primaryButton: {
        backgroundColor: 'var(--button-background)',
        color: 'var(--button-text)'
    },
    timeSelector: {
        border: '1px solid var(--card-border)',
        borderRadius: '10px',
        overflow: 'hidden',
        marginBottom: '10px',
    },
    timeSelectorHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px',
        borderBottom: '1px solid var(--card-border)',
    },
    allDayToggle: {
        display: 'flex',
        alignItems: 'center'
    },
    allDayCheckbox: {
        width: '20px'
    },
    allDaySlider: {
        position: 'relative',
        display: 'inline-block',
        width: '40px',
        height: '20px',
        backgroundColor: '#ccc',
        borderRadius: '20px',
        transition: '0.4s',
        marginLeft: '10px',
    },
    dateTimeInputs: {
        display: 'flex',
        alignItems: 'center',
        padding: '10px',
    },
    dateTimeInput: {
        flex: 1,
        textAlign: 'center',
    },
    dateTimeSeparator: {
        margin: '0 10px',
    },
    hiddenInput: {
        position: 'absolute',
        opacity: 0,
        cursor: 'pointer',
    },
    dateTimeInput: {
        flex: 1,
        textAlign: 'center',
        cursor: 'pointer',
    },
    dateTimeEditor: {
        width: '100%',
        padding: '5px',
        border: '1px solid #ccc',
        borderRadius: '5px',
    },
};