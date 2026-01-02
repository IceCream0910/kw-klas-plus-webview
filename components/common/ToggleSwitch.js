
function ToggleSwitch({
    checked,
    onChange,
    label,
    id,
    scale = 0.8,
    style = {}
}) {
    const handleChange = (e) => {
        if (window.Android && window.Android.performHapticFeedback) {
            const feedbackType = e.target.checked ? "TOGGLE_ON" : "TOGGLE_OFF";
            window.Android.performHapticFeedback(feedbackType);
        }
        if (onChange) {
            onChange(e);
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            ...style
        }}>
            <label htmlFor={id} style={{ opacity: 0.7, fontSize: '14px', cursor: 'pointer', flex: 1 }}>
                {label}
            </label>
            <label
                className="switch"
                style={{ transform: `scale(${scale})` }}
                htmlFor={id}
            >
                <input
                    id={id}
                    type="checkbox"
                    checked={checked}
                    onChange={handleChange}
                />
                <span className="slider"></span>
            </label>
        </div>
    );
}

export default ToggleSwitch;
