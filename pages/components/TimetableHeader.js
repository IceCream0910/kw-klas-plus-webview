import Header from "./header";
import IonIcon from '@reacticons/ionicons';

/**
 * 시간표 헤더 컴포넌트
 * @param {Object} props
 * @param {string} props.yearHakgiLabel - 학기 라벨
 * @returns {JSX.Element}
 */
const TimetableHeader = ({ yearHakgiLabel }) => {
    const handleYearHakgiClick = () => {
        if (typeof window !== 'undefined' && window.Android) {
            window.Android.openYearHakgiBottomSheet();
        }
    };

    return (
        <Header
            title={
                <button
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
