import { KLAS } from '../core/klas';

/**
 * 캘린더 이벤트 저장
 */
export const saveCalendarEvent = async (token, eventData) => {
    const body = {
        gubun: "10",
        grcodeList: [],
        yearhakgiList: [],
        subjList: [],
        selectGrcode: null,
        selectYearhakgi: ",",
        selectSubj: null,
        title: eventData.title,
        weightgubun: "M",
        place: eventData.place || null,
        sdate: eventData.sdate,
        stimeHour: eventData.stimeHour,
        stimeMin: eventData.stimeMin,
        edate: eventData.edate,
        etimeHour: eventData.etimeHour,
        etimeMin: eventData.etimeMin,
        contents: null,
        schdulId: eventData.schdulId,
        schdulColor: eventData.schdulColor
    };

    try {
        const response = await KLAS("https://klas.kw.ac.kr/std/ads/admst/MySchdulSave.do", token, body);

        return response;
    } catch (error) {
        console.error('Failed to save event:', error);
        throw error;
    }
};

/**
 * 캘린더 이벤트 삭제
 */
export const deleteCalendarEvent = async (token, eventData) => {
    if (!confirm("정말로 일정을 삭제하시겠습니까?")) {
        return;
    }
    const deleteBody = {
        gubun: "10",
        grcodeList: [],
        yearhakgiList: [],
        subjList: [],
        selectGrcode: null,
        selectYearhakgi: ",",
        selectSubj: null,
        title: eventData.title,
        weightgubun: "M",
        place: eventData.place,
        sdate: eventData.sdate,
        stimeHour: eventData.stimeHour,
        stimeMin: eventData.stimeMin,
        edate: eventData.edate,
        etimeHour: eventData.etimeHour,
        etimeMin: eventData.etimeMin,
        contents: null,
        schdulId: eventData.schdulId,
        schdulColor: eventData.schdulColor
    };

    try {
        const response = await KLAS("https://klas.kw.ac.kr/std/ads/admst/MySchdulDelete.do", token, deleteBody);

        return response;
    } catch (error) {
        console.error('Failed to delete event:', error);
        throw error;
    }
};

/**
 * 이벤트 데이터를 폼 형식으로 변환
 */
export const formatEventForForm = (event) => {
    if (!event) return null;

    return {
        title: event.title || '',
        place: event.place || '',
        content: event.content || '',
        sdate: event.start,
        edate: event.end,
        stimeHour: event.stimeHour || new Date(event.start).getHours(),
        stimeMin: event.stimeMin || new Date(event.start).getMinutes(),
        etimeHour: event.etimeHour || new Date(event.end).getHours(),
        etimeMin: event.etimeMin || new Date(event.end).getMinutes(),
        bunban: event.bunban || '',
        gwamokKname: event.gwamokKname || '',
        startTime: event.startTime || null,
        endTime: event.endTime || null
    };
};
