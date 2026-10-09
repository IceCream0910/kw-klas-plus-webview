import IonIcon from '@reacticons/ionicons';
import styles from './SearchContextCard.module.css';

export default function SearchContextCard({ context, onRemove, disabled = false }) {
    if (!context?.references?.length) return null;
    return <aside className={styles.card} aria-label="첨부된 검색 컨텍스트">
        <div className={styles.header}><IonIcon name="documents-outline" aria-hidden="true" /><strong>검색 컨텍스트</strong><span>{context.references.length}개</span>
            {onRemove && <button type="button" disabled={disabled} onClick={onRemove} aria-label="검색 컨텍스트 제거"><IonIcon name="close-outline" aria-hidden="true" /></button>}
        </div>
        <ul>{context.references.map((item, index) => <li key={index}><span>{item.title}</span>{item.courseName && <small>{item.courseName}</small>}</li>)}</ul>
    </aside>;
}
