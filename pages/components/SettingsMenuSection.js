import IonIcon from '@reacticons/ionicons';
import ToggleSwitch from './ToggleSwitch';

/**
 * 설정 메뉴 섹션 컴포넌트
 * @param {Object} props
 * @param {boolean} props.hideGrades - 학점 숨김 여부
 * @param {Function} props.onHideGradesChange - 학점 숨김 변경 핸들러
 * @param {string} props.yearHakgi - 표시할 학기
 * @returns {JSX.Element}
 */
const SettingsMenuSection = ({ hideGrades, onHideGradesChange, yearHakgi }) => {
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
            <ToggleSwitch
                id="hideGrades"
                checked={hideGrades}
                onChange={onHideGradesChange}
                label="메뉴 탭에서 학점 숨기기"
                style={{ margin: '0 10px' }}
            />

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
        </>
    );
};

export default SettingsMenuSection;
