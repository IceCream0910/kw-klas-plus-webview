import { useState, useEffect } from "react";
import { KLAS } from "../core/klas";
import { calculateAttendanceStats } from "./lectureUtils";

export const useLectureHome = () => {
    const [data, setData] = useState(null);
    const [subjectInfo, setSubjectInfo] = useState(null);
    const [subjectPlaceTime, setSubjectPlaceTime] = useState(null);
    const [attendExpand, setAttendExpand] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchSubjectInfo = async (token, subj) => {
        try {
            const data = await KLAS("https://klas.kw.ac.kr/std/cmn/frame/YearhakgiAtnlcSbjectList.do", token, {});
            const subject = data.flatMap(semester => semester.subjList).find(subject => subject.value === subj);
            setSubjectInfo(subject);
            return subject;
        } catch (error) {
            console.error("과목 정보 조회 실패:", error);
            throw error;
        }
    };

    const fetchSubjectPlaceTime = async (token, subj, yearHakgi) => {
        try {
            const data = await KLAS("https://klas.kw.ac.kr/std/cmn/frame/LctrumSchdulInfo.do", token, {
                "selectYearhakgi": yearHakgi,
                "selectSubj": subj
            });
            setSubjectPlaceTime(data);
            return data;
        } catch (error) {
            console.error("강의실 정보 조회 실패:", error);
            throw error;
        }
    };

    const fetchLectureHomeData = async (token, subj, yearHakgi) => {
        try {
            const data = await KLAS("https://klas.kw.ac.kr/std/lis/evltn/LctrumHomeStdInfo.do", token, {
                "selectYearhakgi": yearHakgi,
                "selectSubj": subj,
                "selectChangeYn": "Y"
            });
            setData(data);
            return data;
        } catch (error) {
            console.error("강의 홈 데이터 조회 실패:", error);
            throw error;
        }
    };

    const loadLectureData = async (token, subj, yearHakgi) => {
        if (!token || !subj || !yearHakgi) {
            setError("필수 파라미터가 누락되었습니다.");
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const [subjectInfoResult, placeTimeResult, homeDataResult] = await Promise.all([
                fetchSubjectInfo(token, subj),
                fetchSubjectPlaceTime(token, subj, yearHakgi),
                fetchLectureHomeData(token, subj, yearHakgi)
            ]);

            console.log("강의 데이터 로드 완료:", {
                subjectInfo: subjectInfoResult,
                placeTime: placeTimeResult,
                homeData: homeDataResult
            });

        } catch (err) {
            console.error("강의 데이터 로드 실패:", err);
            setError("강의 정보를 불러오는데 실패했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleAttendanceExpand = () => {
        setAttendExpand(prev => !prev);
    };

    const getAttendanceStats = () => {
        if (!data?.atendSubList) return null;
        return calculateAttendanceStats(data.atendSubList);
    };

    const refreshData = (token, subj, yearHakgi) => {
        loadLectureData(token, subj, yearHakgi);
    };

    return {
        data,
        subjectInfo,
        subjectPlaceTime,
        attendExpand,
        isLoading,
        error,
        loadLectureData,
        toggleAttendanceExpand,
        getAttendanceStats,
        refreshData
    };
};
