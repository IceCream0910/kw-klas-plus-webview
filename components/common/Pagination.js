import IonIcon from '@reacticons/ionicons';

const Pagination = ({ currentPage, totalPages, onPrevious, onNext }) => (
    <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '10px'
    }}>
        <button
            style={{
                background: 'var(--card-background)',
                width: '35px',
                height: '35px',
                borderRadius: '50%'
            }}
            onClick={onPrevious}
            disabled={currentPage === 0}
        >
            <IonIcon name="chevron-back-outline" />
        </button>
        <span>{currentPage + 1} / {totalPages}</span>
        <button
            style={{
                background: 'var(--card-background)',
                width: '35px',
                height: '35px',
                borderRadius: '50%'
            }}
            onClick={onNext}
            disabled={currentPage === totalPages - 1}
        >
            <IonIcon name="chevron-forward-outline" />
        </button>
    </div>
);

export default Pagination;
