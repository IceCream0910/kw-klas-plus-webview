import styles from '../../styles/OnlineLecture.module.css';

export default function OnlineLectureLoadingSkeleton() {
    return (
        <ul className={styles.list} aria-hidden="true">
            {Array.from({ length: 4 }, (_, index) => (
                <li className={styles.card} key={index}>
                    <span className={styles.details}>
                        <span className="skeleton" style={{ width: '90%', height: 17 }} />
                        <span className="skeleton" style={{ width: '34%', height: 13 }} />
                        <span className="skeleton" style={{ width: '52%', height: 13 }} />
                    </span>
                    <span className={`${styles.action} skeleton`} />
                </li>
            ))}
        </ul>
    );
}
