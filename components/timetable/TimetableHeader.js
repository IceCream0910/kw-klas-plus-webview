import Header from "../common/header";
import IonIcon from '@reacticons/ionicons';

const handleYearHakgiClick = () => {
    if (typeof window !== 'undefined' && window.Android) {
        window.Android.openYearHakgiBottomSheet();
    }
};

const TimetableHeader = ({ yearHakgiLabel }) => {
    return (
        <Header
            title={
                <button
                    type="button"
                    onClick={handleYearHakgiClick}
                    style={{
                        background: 'var(--card-background)',
                        width: 'fit-content',
                        padding: '10px 15px',
                        borderRadius: '20px',
                        fontSize: '0.9rem'
                    }}
                >
                    {yearHakgiLabel}
                    <IonIcon
                        name='chevron-down'
                        style={{
                            position: 'relative',
                            top: '2px',
                            marginLeft: '5px',
                            opacity: .5
                        }}
                    />
                </button>
            }
        />
    );
};

export default TimetableHeader;
