import IonIcon from '@reacticons/ionicons';
import { useOnlineLecture } from '../lib/lecture/useOnlineLecture';
import OnlineLectureHeader from '../components/lecture/OnlineLectureHeader';
import OnlineLectureCard from '../components/lecture/OnlineLectureCard';
import OnlineLectureLoadingSkeleton from '../components/lecture/OnlineLectureLoadingSkeleton';
import styles from '../styles/OnlineLecture.module.css';

const emptyMessages = {
    all: '아직 등록된 온라인 강의가 없어요.',
    remaining: '온라인 강의를 모두 들었어요.',
    complete: '아직 수강을 완료한 강의가 없어요.'
};

export default function Page() {
    const { groups, filter, selectFilter, now } = useOnlineLecture();
    const lectures = groups?.[filter];

    return (
        <main className={styles.page}>
            <OnlineLectureHeader groups={groups} filter={filter} onSelectFilter={selectFilter} />

            <section aria-label="온라인 강의 목록" aria-busy={!groups}>
                {!groups ? (
                    <OnlineLectureLoadingSkeleton />
                ) : lectures.length ? (
                    <ul className={styles.list}>
                        {lectures.map((item, index) => (
                            <OnlineLectureCard key={item.oid ?? item.cntntsId ?? index} item={item} now={now} />
                        ))}
                    </ul>
                ) : (
                    <div className={styles.empty} role="status">
                        <IonIcon name={filter === 'remaining' && groups.all.length ? 'checkmark-circle-outline' : 'play-circle-outline'} aria-hidden="true" />
                        <p>{groups.all.length ? emptyMessages[filter] : emptyMessages.all}</p>
                    </div>
                )}
            </section>
        </main>
    );
}
