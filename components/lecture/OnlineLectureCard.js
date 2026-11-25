import { useId } from 'react';
import IonIcon from '@reacticons/ionicons';
import KlasNativeBridge from '../../lib/core/klasNativeBridge';
import { createLectureData, getLecturePresentation, handlePreviewLecture, isBeforeStartDate } from '../../lib/lecture/onlineLectureUtils';
import styles from '../../styles/OnlineLecture.module.css';

export default function OnlineLectureCard({ item, now }) {
    const titleId = useId();
    const actionId = useId();
    const detailsId = useId();
    const { status, tone, period, deadline, progress, upcoming } = getLecturePresentation(item, now);

    const openLecture = () => {
        if (isBeforeStartDate(item)) {
            handlePreviewLecture(item, KlasNativeBridge);
        } else {
            KlasNativeBridge.requestOnlineLecture(JSON.stringify(createLectureData(item)));
        }
    };

    return (
        <li>
            <button
                type="button"
                className={styles.card}
                aria-labelledby={`${titleId} ${actionId}`}
                aria-describedby={detailsId}
                onClick={openLecture}
            >
                <span className={styles.details}>
                    <strong className={styles.title} id={titleId}>{item.sbjt}</strong>
                    <span className={styles.metadata} id={detailsId}>
                        <span className={styles.statusLine}>
                            <span className={styles.status} data-tone={tone}>
                                {tone === 'complete' && <IonIcon name="checkmark-circle-outline" aria-hidden="true" />}
                                {status}
                            </span>
                            {deadline && <span className={styles.deadline}>{deadline}</span>}
                        </span>
                        {period && (
                            <span className={styles.period}>
                                <IonIcon name="calendar-outline" aria-hidden="true" />
                                {period}
                            </span>
                        )}
                    </span>
                    {progress !== null && (
                        <span className={styles.progressTrack} aria-hidden="true">
                            <span style={{ width: `${progress}%` }} />
                        </span>
                    )}
                </span>
                <span id={actionId} className={styles.action}>{upcoming ? '미리보기' : '보기'}</span>
            </button>
        </li>
    );
}
