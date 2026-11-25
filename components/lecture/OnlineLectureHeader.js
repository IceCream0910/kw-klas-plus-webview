import KlasNativeBridge from '../../lib/core/klasNativeBridge';
import styles from '../../styles/OnlineLecture.module.css';

const filters = [
    { key: 'all', label: '전체' },
    { key: 'remaining', label: '미완료' },
    { key: 'complete', label: '완료' }
];

export default function OnlineLectureHeader({ groups, filter, onSelectFilter }) {
    return (
        <header className={styles.header}>
            <div className={styles.heading}>
                <h1>온라인 강의</h1>
                <button
                    type="button"
                    className={styles.openKlas}
                    onClick={() => KlasNativeBridge.openInKLAS()}
                >
                    KLAS에서 열기
                </button>
            </div>
            <div className={styles.filters} role="group" aria-label="수강 상태 필터">
                {filters.map(({ key, label }) => (
                    <button
                        key={key}
                        type="button"
                        aria-pressed={filter === key}
                        onClick={() => onSelectFilter(key)}
                    >
                        {label}
                        {groups && <span className={styles.count}>{groups[key].length}</span>}
                    </button>
                ))}
            </div>
        </header>
    );
}
