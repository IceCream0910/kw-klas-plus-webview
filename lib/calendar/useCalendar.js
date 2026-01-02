import { useState, useEffect } from 'react';
import moment from 'moment';
import { KLAS } from '../core/klas';
import { getStoredData } from '../core/storageUtils';
import { formatCalendarEvents, getEventsForDate, getDefaultSelectedDate } from './calendarUtils';
import { openWebViewBottomSheet, closeWebViewBottomSheet } from '../core/androidBridge';
import { saveCalendarEvent, deleteCalendarEvent, formatEventForForm } from './calendarActions';

export function useCalendar() {
    const [token, setToken] = useState(null);
    const [events, setEvents] = useState([]);
    const [mergedEvents, setMergedEvents] = useState([]);
    const [selectedDate, setSelectedDate] = useState(moment().toDate());
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAddingEvent, setIsAddingEvent] = useState(false);
    const [selectedDayEvents, setSelectedDayEvents] = useState([]);
    const [currentMonth, setCurrentMonth] = useState(moment());
    const [yearHakgi, setYearHakgi] = useState(null);

    useEffect(() => {
        window.receiveToken = function (receivedToken) {
            if (!receivedToken) return;
            setToken(receivedToken);
        };

        window.closeWebViewBottomSheet = function () {
            setIsModalOpen(false);
        };

        const urlParams = new URLSearchParams(window.location.search);
        const retrievedYearHakgi = urlParams.get('yearHakgi');
        if (retrievedYearHakgi) {
            setYearHakgi(retrievedYearHakgi);
        } else {
            const storedYearHakgi = localStorage.getItem('currentYearHakgi');
            if (storedYearHakgi) {
                setYearHakgi(storedYearHakgi);
            }
        }

        try { Android.completePageLoad() } catch (error) { console.log('not app') }

        return () => {
            window.receiveToken = undefined;
            window.closeWebViewBottomSheet = undefined;
        };
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
        return new Promise((resolve, reject) => {
            const monthStart = currentMonth.clone().startOf('month');
            const monthEnd = currentMonth.clone().endOf('month');

            KLAS("https://klas.kw.ac.kr/std/ads/admst/MySchdulMonthTableList.do", token, {
                start: monthStart.format('YYYY-MM-DD'),
                end: monthEnd.format('YYYY-MM-DD'),
            }).then(data => {
                const formattedEvents = formatCalendarEvents(data);
                setEvents(formattedEvents);
                resolve(formattedEvents);
            }).catch(error => {
                console.error('Failed to fetch events:', error);
                reject(error);
            });
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
        yearHakgi,

        setToken,
        setYearHakgi,
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