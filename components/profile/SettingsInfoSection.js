/**
 * 설정 정보 섹션 컴포넌트
 * @param {Object} props
 * @param {string} props.appVersion - 앱 버전
 * @returns {JSX.Element}
 */
const SettingsInfoSection = ({ appVersion }) => {
    return (
        <>
            <button
                className="unclikable"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                disabled
            >
                <span style={{ fontSize: '16px' }}>앱 버전</span>
                <span style={{ opacity: .8, fontSize: '14px' }}>v{appVersion}</span>
            </button>

            <button
                className="unclikable"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                disabled
            >
                <span style={{ fontSize: '16px' }}>WebView Git SHA</span>
                <span style={{ opacity: .8, fontSize: '14px' }}>
                    {process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA
                        ? process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA.substring(0, 7)
                        : 'n/a'}
                </span>
            </button>

            <button
                className="unclikable"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                disabled
            >
                <span style={{ fontSize: '16px' }}>Runtime Region</span>
                <span style={{ opacity: .8, fontSize: '14px' }}>icn1</span>
            </button>
        </>
    );
};

export default SettingsInfoSection;
