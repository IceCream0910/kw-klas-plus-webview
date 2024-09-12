import { useState } from 'react';
import Spacer from '../components/spacer';
import IonIcon from '@reacticons/ionicons';

export default function LectureHome() {
    const [dataIsEmpty, setDataIsEmpty] = useState(false);
    const [attendExpand, setAttendExpand] = useState(false);
    return (
        <main>
            <Spacer y={10} />
            <span style={{ background: '#ff766160', color: 'var(--text-color)', padding: '5px', borderRadius: '10px', fontSize: '13px' }}>이수구분</span>
            <Spacer y={10} />
            <h2>교과목명</h2>
            <span style={{ opacity: .5, fontSize: '14px' }}>학정번호</span>
            <Spacer y={20} />

            <span style={{ fontSize: '15px' }}>
                <IonIcon style={{ position: 'relative', top: '2px', color: '#ff7661' }} name='time-outline' />
                <span style={{ marginLeft: '5px', opacity: .7 }}>월 6교시 (비403), 수 5교시 (비403)	</span>
            </span><br />
            <span style={{ fontSize: '15px' }}>
                <IonIcon style={{ position: 'relative', top: '2px', color: '#ff7661' }} name='people-outline' />
                <span style={{ marginLeft: '5px', opacity: .7 }}>30명</span>
            </span><br />
            <span style={{ fontSize: '15px' }}>
                <IonIcon style={{ position: 'relative', top: '2px', color: '#ff7661' }} name='layers-outline' />
                <span style={{ marginLeft: '5px', opacity: .7 }}>3학점/3시간</span>
            </span><br />
            <span style={{ fontSize: '15px' }}>
                <IonIcon style={{ position: 'relative', top: '2px', color: '#ff7661' }} name='apps-outline' />
                <span style={{ marginLeft: '5px', opacity: .7 }}>강의유형에 해당하는 항목 있으면 표시(여러개면 콤마로 구분)</span>
            </span><br />
            <span style={{ fontSize: '15px' }}>
                <IonIcon style={{ position: 'relative', top: '2px', color: '#ff7661' }} name='desktop-outline' />
                <span style={{ marginLeft: '5px', opacity: .7 }}>원격수업 100%/50%/해당없음</span>
            </span><br />
            <span style={{ fontSize: '15px' }}>
                <IonIcon style={{ position: 'relative', top: '2px', color: '#ff7661' }} name='golf-outline' />
                <span style={{ marginLeft: '5px', opacity: .7 }}>강의운영방식에 해당하는 항목 표시</span>
            </span>

            <Spacer y={30} />
            <h3>강사진</h3>
            <Spacer y={15} />

            <div className="card non-anim" style={{ paddingBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <h5>홍길동</h5>
                        <span style={{ opacity: .7 }}>구분</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <span style={{ fontSize: '15px' }}>
                            <IonIcon style={{ position: 'relative', top: '2px', color: '#ff7661' }} name='call-outline' />
                            <span style={{ marginLeft: '5px', opacity: .7 }}>02-000-0000 </span>
                        </span>
                        <span style={{ fontSize: '15px' }}>
                            <IonIcon style={{ position: 'relative', top: '2px', color: '#ff7661' }} name='phone-portrait-outline' />
                            <span style={{ marginLeft: '5px', opacity: .7 }}>010-0000-0000</span>
                        </span>
                        <span style={{ fontSize: '15px' }}>
                            <IonIcon style={{ position: 'relative', top: '2px', color: '#ff7661' }} name='mail-outline' />
                            <span style={{ marginLeft: '5px', opacity: .7 }}>email@kw.ac.kr</span>
                        </span>
                    </div>
                </div>
                <Spacer y={10} />
                <hr style={{ opacity: 0.1 }} />
                <Spacer y={10} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignContent: 'center', gap: '5px' }}>
                        <h5>홍길동</h5>
                        <span style={{ opacity: .7 }}>담당조교</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <span style={{ fontSize: '15px' }}>
                            <IonIcon style={{ position: 'relative', top: '2px', color: '#ff7661' }} name='mail-outline' />
                            <span style={{ marginLeft: '5px', opacity: .7 }}>email@kw.ac.kr</span>
                        </span>
                    </div>
                </div>
            </div>


            <Spacer y={30} />
            <h3>개요</h3>
            <p style={{ opacity: .6, fontSize: '15px' }}>
                일변수함수의 극한 및 연속, 연속함수의 성질, 미분의 개념과 도함수, 미분가능한 함수의 성질, 미분법, 적분의 개념과 미적분학의 기본정리 등에 대하여 강의한다. 또한 이러한 주제를 여러 응용문제에 적용하여 생각하고 문제 풀이 연습을 통하여 익힌다. 이 강좌를 통하여 미적분학의 여러가지 결과와 방법을 숙지하고 그를 다양한 응용문제에 적용하는 방법을 익혀 수학적인 사고법과 그를 통한 문제 해결 능력을 키운다.
            </p>

            <span style={{ color: '#ff7661' }}>
                '장애학생 지원, 교과목 대표역량, 학습목표 및 학습방법, 교과목 학습성과, 학점구성, 선수과목, 병수과목, 후수과목' 에 대해 위 개요 레이아웃 동일 적용
            </span>

            <Spacer y={30} />
            <h3>평가/VL역량 반영 비율</h3>
            <Spacer y={15} />
            <div className="card non-anim" id="notices" style={{ paddingBottom: '20px' }}>
                <span><b>평가</b></span><br />
                <div style={{ width: '100%', background: '#ff766160', height: '10px', borderRadius: '5px', marginTop: '5px' }}></div>
                <Spacer y={20} />
                <span><b>VL역량</b></span><br />
                <div style={{ width: '100%', background: '#ff766160', height: '10px', borderRadius: '5px', marginTop: '5px' }}></div>
            </div>
            <span style={{ color: '#ff7661' }}>
                openKLAS에 구현된 원형 그래프에서 선형 그래프로 변경
            </span>

            <Spacer y={30} />
            <h3>교재</h3>
            <Spacer y={15} />
            <div className="card non-anim" id="notices" style={{ paddingBottom: '20px' }}>
                <div className="notice-item">
                    <span>주교재 · <b>교재명</b></span><br />
                    <span style={{ opacity: 0.6, fontSize: '13px' }}>저자명 | 출판사(출판년도)</span>
                    <hr style={{ opacity: 0.3 }} />
                </div>
                <div className="notice-item">
                    <span>부교재 · <b>교재명</b></span><br />
                    <span style={{ opacity: 0.6, fontSize: '13px' }}>저자명 | 출판사(출판년도)</span>
                </div>
            </div>

            <Spacer y={30} />
            <h3>강의 일정</h3>
            <Spacer y={15} />
            <div className="card non-anim" id="notices" style={{ paddingBottom: '20px' }}>
                <div className="notice-item">
                    <span>1주차 · <b>강의 내용(week00Lecture)을 표시</b></span><br />
                    <span style={{ opacity: 0.6, fontSize: '13px' }}>강의운영방식(week00Bigo) 있으면 표시</span>
                    <hr style={{ opacity: 0.3 }} />
                </div>
                <div className="notice-item">
                    <span>2주차 · <b>강의 내용(week00Lecture)을 표시</b></span><br />
                    <span style={{ opacity: 0.6, fontSize: '13px' }}>강의운영방식(week00Bigo) 있으면 표시</span>
                    <hr style={{ opacity: 0.3 }} />
                </div>
                ...
                <hr style={{ opacity: 0.3 }} />
                <div className="notice-item">
                    <span><b>기타</b></span><br />
                    <span style={{ opacity: 0.6, fontSize: '13px' }}>기타(gitaDetail) 있으면 표시</span>
                </div>
            </div>


        </main>
    );
}