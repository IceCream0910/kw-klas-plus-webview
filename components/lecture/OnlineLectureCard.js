import Spacer from '../common/spacer';
import IonIcon from '@reacticons/ionicons';
import { isBeforeStartDate, handlePreviewLecture, createLectureData } from '../../lib/lecture/onlineLectureUtils';

const OnlineLectureCard = ({ item }) => {
    if (!item.grcode) return null;

    const handlePreview = () => {
        if (item.starting) {
            alert("학습 시작일 이전에 강의 영상을 미리 시청할 수 있습니다. 이 경우 학습 시간은 인정되지 않습니다. 학습 시작일 이후 강의를 다시 시청해야 출석으로 인정되니 주의바랍니다.");
            window.Android.openExternalLink(item.starting);
        } else {
            alert("아직 강의 영상이 업로드되지 않았습니다.");
        }
    };

    const handleLectureOpen = () => {
        const lectureData = createLectureData(item);
        window.Android.requestOnlineLecture(JSON.stringify(lectureData));
    };

    return (
        <div className="card" style={{
            display: 'flex',
            gap: '10px',
            alignContent: 'center',
            padding: '15px',
            border: item.prog === 100 ? '0.5px solid var(--green)' : undefined
        }}>
            <div>
                <span><b>{item.sbjt}</b></span>
                <Spacer y={5} />
                <span style={{ fontSize: '15px' }}>
                    <IonIcon style={{
                        fontSize: '13px',
                        position: 'relative',
                        top: '2px',
                        opacity: .5
                    }} name='time-outline' />
                    <span style={{
                        fontSize: '13px',
                        marginLeft: '5px',
                        opacity: .5
                    }}>{item.lrnPd}</span>
                </span><br />
                <span style={{ fontSize: '15px' }}>
                    <IonIcon style={{
                        fontSize: '13px',
                        position: 'relative',
                        top: '2px',
                        opacity: .5
                    }} name='time-outline' />
                    <span style={{
                        fontSize: '13px',
                        marginLeft: '5px',
                        opacity: .5
                    }}>{item.prog}% ({item.learnTime}분/{item.ptime}분)</span>
                </span>
            </div>

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '5px',
                width: 'fit-content',
                justifyContent: 'center'
            }}>
                {isBeforeStartDate(item.startDate) ? (
                    <button
                        onClick={handlePreview}
                        style={{
                            width: '70px',
                            background: 'var(--background)',
                            fontSize: '12px',
                            padding: '8px 10px',
                            textAlign: 'center'
                        }}
                    >
                        미리보기
                    </button>
                ) : (
                    <button
                        onClick={handleLectureOpen}
                        style={{
                            width: '50px',
                            background: 'var(--background)',
                            fontSize: '12px',
                            padding: '8px 10px',
                            textAlign: 'center'
                        }}
                    >
                        보기
                    </button>
                )}
            </div>
        </div>
    );
};

export default OnlineLectureCard;
