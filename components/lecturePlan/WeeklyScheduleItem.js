const WeeklyScheduleItem = ({ week, lecture, bigo, subs }) => {
    if (!lecture) return null;

    return (
        <div className="notice-item">
            <span>{week}주차 · <b>{lecture}</b></span><br />
            <span style={{ opacity: 0.6, fontSize: '13px' }}>{bigo}</span>
            {subs && (
                <span style={{ opacity: 0.6, fontSize: '13px' }}>
                    {bigo && <br />}
                    <span style={{ color: 'var(--red)', fontSize: '13px' }}>
                        강의 보강일시 및 보강방법: {subs}
                    </span>
                </span>
            )}
            <hr style={{ opacity: 0.3 }} />
        </div>
    );
};

export default WeeklyScheduleItem;
