const PrerequisiteItem = ({ label, value, showHr = true }) => (
    <div className="notice-item">
        <span>{label}</span> ·&nbsp;
        <span style={{ opacity: 0.6, fontSize: '15px' }}>{value || "해당없음"}</span>
        {showHr && <hr style={{ opacity: 0.3 }} />}
    </div>
);

export default PrerequisiteItem;
