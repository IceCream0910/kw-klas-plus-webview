import IonIcon from '@reacticons/ionicons';

const SearchBar = ({ searchTerm, onSearchChange }) => (
    <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 0',
        gap: "10px",
        width: '100%'
    }}>
        <div className="search-container" style={{ width: '100%' }}>
            <span className="tossface" style={{ position: 'relative', left: '10px', top: '30px' }}>🔍</span>
            <input
                style={{ paddingLeft: '35px' }}
                placeholder={"메뉴 검색"}
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyUp={(e) => {
                    if (e.key === 'Enter') {
                        e.target.blur();
                    }
                }}
            />
        </div>
    </div>
);

export default SearchBar;
