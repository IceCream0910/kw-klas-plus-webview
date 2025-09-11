import React from 'react';
import Spacer from '../components/common/spacer';
import Skeleton from '../components/common/Skeleton';
import LectureBasicInfo from '../components/lecturePlan/LectureBasicInfo';
import LectureInstructorInfo from '../components/lecturePlan/LectureInstructorInfo';
import StudyResultItem from '../components/lecturePlan/StudyResultItem';
import PrerequisiteItem from '../components/lecturePlan/PrerequisiteItem';
import GradeChart from '../components/grade/GradeChart';
import GradeLegend from '../components/grade/GradeLegend';
import BookItem from '../components/lecturePlan/BookItem';
import WeeklyScheduleItem from '../components/lecturePlan/WeeklyScheduleItem';
import IonIcon from '@reacticons/ionicons';
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useLecturePlan } from "../lib/lecturePlan/useLecturePlan";
import { formatTextWithBreaks } from "../lib/lecturePlan/lecturePlanUtils";
import { safeAndroidCall } from "../lib/core/androidBridge";

ChartJS.register(CategoryScale, LinearScale, PointElement, BarElement, Title, Tooltip, Legend);

export default function LecturePlan() {
    const { data, subjId, isLoading, error } = useLecturePlan();

    const handleOpenInKlas = () => {
        safeAndroidCall(() => {
            Android.openPage('https://klas.kw.ac.kr/std/cps/atnlc/popup/LectrePlanStdView.do?selectSubj=' + subjId);
        });
    };


    if (isLoading || !data) {
        return (
            <main>
                <Spacer y={10} />
                <Skeleton height="h-5" width="w-16" className="mb-4" />
                <Skeleton height="h-8" width="w-3/4" className="mb-2" />
                <Skeleton height="h-4" width="w-1/2" className="mb-6" />

                {[...Array(5)].map((_, index) => (
                    <div key={index} className="mb-6">
                        <Skeleton height="h-20" width="w-full" />
                    </div>
                ))}
            </main>
        );
    }

    if (error) {
        return (
            <main className="p-4">
                <div className="text-center py-12">
                    <div className="text-red-500 mb-4">
                        <IonIcon name="alert-circle-outline" size="large" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">오류 발생</h3>
                    <p className="text-gray-600">{error}</p>
                </div>
            </main>
        );
    }

    const lecturePlan = data.lecturePlan[0];
    const lectureAssistant = data.lectureAssistant[0];

    return (
        <main>
            <button onClick={handleOpenInKlas}
                style={{ float: 'right', border: '1px solid var(--card-background)', width: 'fit-content', fontSize: '14px', marginTop: '-16px', borderRadius: '20px', padding: '10px 15px' }}>
                KLAS에서 열기
            </button>

            <Spacer y={10} />

            {data.lecturePlan[0].codeName1 && (
                <>
                    <span style={{ background: '#ff766160', color: 'var(--text-color)', padding: '5px', borderRadius: '10px', fontSize: '13px' }}>{data.lecturePlan[0].codeName1}</span>
                    <Spacer y={10} />
                </>
            )}
            <h2>{data.lecturePlan[0].gwamokKname}</h2>
            <span style={{ opacity: .5, fontSize: '14px' }}>{data.lecturePlan[0].openMajorCode}-{data.lecturePlan[0].openGrade}-{data.lecturePlan[0].openGwamokNo}-{data.lecturePlan[0].bunbanNo}</span>
            <Spacer y={20} />

            {/* 강의 기본 정보 */}
            <LectureBasicInfo
                lecturePlan={lecturePlan}
                lectureTime={data.lectureTime}
                lectureStdCrtNum={data.lectureStdCrtNum}
            />

            <Spacer y={30} />
            <h3>강사진</h3>
            <Spacer y={15} />

            {/* 강사진 정보 */}
            <LectureInstructorInfo
                lecturePlan={lecturePlan}
                lectureTeam={data.lectureTeam}
                lectureAssistant={data.lectureAssistant}
            />

            <Spacer y={30} />
            <h3>개요</h3><Spacer y={15} />
            <div className="card non-anim" id="notices" style={{ padding: '5px 15px' }}>
                <p style={{ opacity: .6, fontSize: '15px' }}>
                    {formatTextWithBreaks(lecturePlan.summary)}
                </p>

                <p style={{ opacity: .6, fontSize: '15px' }}>
                    <b>대표역량: </b>{lecturePlan.gwamokAble}
                </p>
            </div>

            <Spacer y={30} />
            <h3>학습목표 및 학습방법</h3><Spacer y={15} />
            <div className="card non-anim" id="notices" style={{ padding: '5px 15px' }}>
                <p style={{ opacity: .6, fontSize: '15px' }}>
                    {formatTextWithBreaks(lecturePlan.purpose)}
                </p>
            </div>


            {data.lecturePlanTab4.length > 0 && (
                <>
                    <Spacer y={30} />
                    <h3>학습성과</h3><Spacer y={15} />
                    <div className="card non-anim" id="notices" style={{ padding: '20px 15px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map(num => (
                                <StudyResultItem
                                    key={num}
                                    reflectPer={lecturePlan[`reflectPer${num}`]}
                                    studyResultShort={lecturePlan[`studyResultShort${num}`]}
                                    result={lecturePlan[`result${num}`]}
                                />
                            ))}
                        </div>
                    </div>
                </>
            )}


            {data.lectureEngineerCourse.length > 0 && data.lectureEngineerCourse[0].engOpt === "Y" && (
                <>
                    <Spacer y={30} />
                    <h3>선후수과목</h3>
                    <Spacer y={15} />
                    <div className="card non-anim" id="notices" style={{ paddingBottom: '20px' }}>
                        {data.lecturePrerequisite.length > 0 && (
                            <PrerequisiteItem
                                label="(지정)선수과목"
                                value={data.lecturePrerequisite[0].beforeGwamokKname}
                            />
                        )}
                        <PrerequisiteItem
                            label="(권장)선수과목"
                            value={lecturePlan.preGwamok}
                        />
                        <PrerequisiteItem
                            label="(권장)병수과목"
                            value={lecturePlan.pairGwamok}
                        />
                        <PrerequisiteItem
                            label="(권장)후수과목"
                            value={lecturePlan.postGwamok}
                            showHr={false}
                        />
                    </div>
                </>
            )}


            <Spacer y={30} />
            <h3>반영 비율</h3>
            <Spacer y={15} />
            <div className="card non-anim" id="notices" style={{ paddingBottom: '20px' }}>
                <span><b>성적 평가</b></span><br />
                <GradeChart data={lecturePlan} type="grade" />
                <GradeLegend data={lecturePlan} type="grade" />
                <Spacer y={10} />
                <span style={{ opacity: 0.6, fontSize: '14px' }}><b>세부설명: </b>
                    <span>
                        {lecturePlan.gitaDetail ? lecturePlan.gitaDetail?.split('\r\n').map((line, i) => (
                            <span key={i}>
                                {line}
                                {i < lecturePlan.gitaDetail.split('\r\n').length - 1 && <br />}
                            </span>
                        )) : "내용 없음"}
                    </span>
                </span>


                {(lecturePlan.openCode == '11' || lecturePlan.openCode == '13' || lecturePlan.openCode == '91' || lecturePlan.openCode == '93' || lecturePlan.openCode == '21') && (
                    <>
                        <Spacer y={20} />
                        <span><b>VL역량</b></span><br />
                        <GradeChart data={lecturePlan} type="vl" />
                        <GradeLegend data={lecturePlan} type="vl" />
                    </>
                )}
            </div>

            <Spacer y={30} />
            <h3>교재</h3>
            <Spacer y={15} />
            <div className="card non-anim" id="notices" style={{ paddingBottom: '20px' }}>
                <BookItem
                    type="주교재"
                    bookName={lecturePlan.bookName}
                    writeName={lecturePlan.writeName}
                    companyName={lecturePlan.companyName}
                    printYear={lecturePlan.printYear}
                    showHr={!!lecturePlan.book1Name}
                />
                <BookItem
                    type="부교재"
                    bookName={lecturePlan.book1Name}
                    writeName={lecturePlan.write1Name}
                    companyName={lecturePlan.company1Name}
                    printYear={lecturePlan.print1Year}
                    showHr={!!lecturePlan.book2Name}
                />
                <BookItem
                    type="부교재"
                    bookName={lecturePlan.book2Name}
                    writeName={lecturePlan.write2Name}
                    companyName={lecturePlan.company2Name}
                    printYear={lecturePlan.print2Year}
                    showHr={!!lecturePlan.book3Name}
                />
                <BookItem
                    type="부교재"
                    bookName={lecturePlan.book3Name}
                    writeName={lecturePlan.write3Name}
                    companyName={lecturePlan.company3Name}
                    printYear={lecturePlan.print3Year}
                    showHr={false}
                />
            </div>

            <Spacer y={30} />
            <h3>강의 일정</h3>
            <Spacer y={15} />
            <div className="card non-anim" id="notices" style={{ paddingBottom: '20px' }}>
                {[...Array(16)].map((_, i) => (
                    <WeeklyScheduleItem
                        key={i + 1}
                        week={i + 1}
                        lecture={lecturePlan[`week${i + 1}Lecture`]}
                        bigo={lecturePlan[`week${i + 1}Bigo`]}
                        subs={lecturePlan[`week${i + 1}Subs`]}
                    />
                ))}
                <div className="notice-item">
                    <span><b>기타</b></span><br />
                    <span style={{ opacity: 0.6, fontSize: '13px' }}>- 학기 중 결강이 있을 경우에는 15주차에 보강을 실시하고, 16주차에 기말고사 시행.<br />- 학기 중 결강이 없을 경우에는 15주차에 기말고사 시행 가능.<br />
                    </span>
                    <span style={{ opacity: 0.6, fontSize: '13px' }}>{lecturePlan.weekGita}</span>
                </div>
            </div>

            {
                (lecturePlan.cqiNow || lecturePlan.cqiSummary) && (<>
                    <Spacer y={30} />
                    <h3>CQI <span style={{ background: 'var(--button-background)', padding: '3px 5px', borderRadius: '10px', fontSize: '12px', position: 'relative', left: '5px', top: '-1px', opacity: .8 }}>KLAS+</span></h3>
                    <Spacer y={5} />
                    <span style={{ opacity: .6, fontSize: '14px' }}>이전 학기 강의평가 등을 바탕으로 담당 교수가 작성한 강의 개선보고서 내용이에요.</span>
                    <Spacer y={15} />
                    <div className="card non-anim" id="notices" style={{ padding: '5px 15px' }}>
                        <p style={{ opacity: .6, fontSize: '15px' }}>
                            {lecturePlan.cqiSummary}
                            {lecturePlan.cqiNow}
                        </p>
                    </div>
                </>
                )
            }


            <Spacer y={30} />
        </main >
    );
}