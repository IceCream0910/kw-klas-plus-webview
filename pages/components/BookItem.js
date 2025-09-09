const BookItem = ({ type, bookName, writeName, companyName, printYear, showHr = true }) => {
    if (!bookName) return null;

    return (
        <div className="notice-item">
            <span>{type} · <b>{bookName}</b></span><br />
            <span style={{ opacity: 0.6, fontSize: '13px' }}>{writeName} | {companyName}({printYear})</span>
            {showHr && <hr style={{ opacity: 0.3 }} />}
        </div>
    );
};

export default BookItem;
