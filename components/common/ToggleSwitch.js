/**
 * 재사용 가능한 토글 스위치 컴포넌트
 */
function ToggleSwitch({
    checked,
    onChange,
    label,
    id,
    scale = 0.8,
    style = {}
}) {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            ...style
        }}>
            <span style={{ opacity: 0.7, fontSize: '14px' }}>
                {label}
            </span>
            <label
                className="switch"
                style={{ transform: `scale(${scale})` }}
                htmlFor={id}
            >
                <input
                    id={id}
                    type="checkbox"
                    checked={checked}
                    onChange={onChange}
                />
                <span className="slider"></span>
            </label>
        </div>
    );
}

export default ToggleSwitch;
