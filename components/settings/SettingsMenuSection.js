import IonIcon from '@reacticons/ionicons';
import ToggleSwitch from '../common/ToggleSwitch';

/**
 * 설정 메뉴 섹션 컴포넌트
 * @param {Object} props
 * @param {string} props.yearHakgi - 표시할 학기
 * @returns {JSX.Element}
 */
const SettingsMenuSection = ({ yearHakgi }) => {
    const handleYearHakgiSelect = () => {
        if (typeof window !== 'undefined' && window.Android) {
            window.Android.openYearHakgiSelectModal();
        }
    };

    const handleLibraryQRSettings = () => {
        if (typeof window !== 'undefined' && window.Android) {
            window.Android.openLibraryQRSettingsModal();
        }
    };

    const formatYearHakgi = (yearHakgi) => {
        if (!yearHakgi) return '';
        return yearHakgi
            .replace(",3", ",하계계절")
            .replace(",4", ",동계계절")
            .replace(",", "년도 ") + "학기";
    };

    return (
        <>
            <button
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                onClick={handleYearHakgiSelect}
            >
                <span>표시할 학기</span>
                <span style={{ opacity: .8, fontSize: '14px' }}>
                    {formatYearHakgi(yearHakgi)}
                </span>
            </button>

            <button
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                onClick={handleLibraryQRSettings}
            >
                <span>모바일 학생증 설정</span>
                <span style={{ opacity: .8, fontSize: '14px' }}>
                    <IonIcon name="chevron-forward-outline" />
                </span>
            </button>
            <style jsx global>{`
             label {
                opacity: 1 !important;
                font-size: 16px !important;
                margin-bottom: 5px;
             }
            `}</style>
        </>
    );
};

export default SettingsMenuSection;
