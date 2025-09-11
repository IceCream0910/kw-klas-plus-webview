import IonIcon from '@reacticons/ionicons';

const SearchBar = ({ searchTerm, onSearchChange, onSettingsClick }) => (
    <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 0',
        gap: "10px",
        width: '100%'
    }}>
        <div className="search-container">
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
        <button
            onClick={onSettingsClick}
            style={{
                background: 'var(--card-background)',
                padding: '5px',
                width: '50px',
                height: '42px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                float: 'right',
                marginTop: '20px'
            }}
        >
            <IonIcon name='sync-outline' />
        </button>
    </div>
);

export default SearchBar;
