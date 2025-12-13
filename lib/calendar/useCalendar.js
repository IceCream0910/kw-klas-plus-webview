import { useState, useEffect } from 'react';
import moment from 'moment';
import { KLAS } from '../core/klas';
import { formatCalendarEvents, getEventsForDate, getDefaultSelectedDate } from './calendarUtils';
import { openWebViewBottomSheet, closeWebViewBottomSheet } from '../core/androidBridge';
import { saveCalendarEvent, deleteCalendarEvent, formatEventForForm } from './calendarActions';

export function useCalendar() {
    const [token, setToken] = useState(null);
    const [events, setEvents] = useState([]);
    const [selectedDate, setSelectedDate] = useState(moment().toDate());
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAddingEvent, setIsAddingEvent] = useState(false);
    const [selectedDayEvents, setSelectedDayEvents] = useState([]);
    const [currentMonth, setCurrentMonth] = useState(moment());

    useEffect(() => {
        window.receiveToken = function (receivedToken) {
            if (!receivedToken) return;
            setToken(receivedToken);
        };

        window.closeWebViewBottomSheet = function () {
            setIsModalOpen(false);
        };

        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('yearHakgi');
    }, []);

    useEffect(() => {
        if (!token) return;
        fetchEvents();
    }, [token, currentMonth]);

    // 월 변경시 선택된 날짜 업데이트
    useEffect(() => {
        const newSelectedDate = getDefaultSelectedDate(currentMonth);
        setSelectedDate(newSelectedDate);
        updateSelectedDayEvents(newSelectedDate);
    }, [currentMonth, events]);

    useEffect(() => {
        if (isModalOpen) {
            openWebViewBottomSheet();
        } else {
            closeWebViewBottomSheet();
        }
    }, [isModalOpen]);

    const updateSelectedDayEvents = (date) => {
        const filteredEvents = getEventsForDate(events, date);
        setSelectedDayEvents(filteredEvents);
    };

    const fetchEvents = () => {
        const monthStart = currentMonth.clone().startOf('month');
        const monthEnd = currentMonth.clone().endOf('month');

        const prevEvents = events;

        KLAS("https://klas.kw.ac.kr/std/ads/admst/MySchdulMonthTableList.do", token, {
            start: monthStart.format('YYYY-MM-DD'),
            end: monthEnd.format('YYYY-MM-DD'),
        }).then(data => {
            const formattedEvents = formatCalendarEvents(data);

            const carryOvers = (prevEvents || [])
                .filter(ev => ev && ev.typeNm !== '과제' && moment(ev.end).isAfter(monthStart))
                .map(ev => ({
                    ...ev,
                    start: moment(ev.start).isBefore(monthStart) ? monthStart.toDate() : ev.start,
                }));

            const merged = [...formattedEvents];

            carryOvers.forEach(ev => {
                const hasId = !!ev.schdulId;
                const duplicate = merged.some(ne => {
                    if (hasId && ne.schdulId) return ne.schdulId === ev.schdulId;
                    const sameKey = ne.title === ev.title && ne.typeNm === ev.typeNm;
                    const overlaps = moment(ne.end).isAfter(monthStart) && moment(ne.start).isBefore(monthEnd);
                    return sameKey && overlaps;
                });
                if (!duplicate) merged.push(ev);
            });

            setEvents(merged);
        }).catch(error => {
            console.error('Failed to fetch events:', error);
        });
    };

    const handleSlotSelect = (slotInfo) => {
        setSelectedDate(slotInfo.start);
        setSelectedEvent(null);
        updateSelectedDayEvents(slotInfo.start);
        setIsAddingEvent(false);
    };

    const handleEventSelect = (event) => {
        setSelectedEvent(event);
        setIsAddingEvent(false);
        setIsModalOpen(true);
    };

    const handleNavigate = (newDate) => {
        const newMoment = moment(newDate);
        setCurrentMonth(newMoment);
    };

    const openAddEventModal = () => {
        setIsAddingEvent(true);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setIsAddingEvent(false);
        setSelectedEvent(null);
    };

    const handleSaveEvent = async (eventData) => {
        try {
            await saveCalendarEvent(token, eventData);
            await fetchEvents();
            closeModal();
            return true;
        } catch (error) {
            console.error('Failed to save event:', error);
            return false;
        }
    };

    const handleDeleteEvent = async (eventData) => {
        try {
            await deleteCalendarEvent(token, eventData);
            await fetchEvents();
            closeModal();
            return true;
        } catch (error) {
            console.error('Failed to delete event:', error);
            return false;
        }
    };

    return {
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
    };
}
