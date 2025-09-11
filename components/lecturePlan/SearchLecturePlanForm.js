import Spacer from '../common/spacer';
import { getYearOptions } from '../../lib/lecturePlan/searchLecturePlanUtils';

const SearchLecturePlanForm = ({
    year,
    hakgi,
    name,
    professor,
    selectedGwamok,
    selectedHakgwa,
    selectedMajor,
    isMy,
    gwamokList,
    hakgwaList,
    majorList,
    onYearChange,
    onHakgiChange,
    onNameChange,
    onProfessorChange,
    onGwamokChange,
    onHakgwaChange,
    onMajorChange,
    onMyToggle,
    onSearch
}) => {
    const yearOptions = getYearOptions();

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                <select
                    value={year}
                    onChange={(e) => onYearChange(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '10px',
                        fontSize: '16px',
                        borderRadius: '10px',
                        border: '1px solid var(--card-background)'
                    }}
                >
                    {yearOptions.map((yearOption) => (
                        <option key={yearOption} value={yearOption}>
                            {yearOption}년
                        </option>
                    ))}
                </select>

                <select
                    value={hakgi}
                    onChange={(e) => onHakgiChange(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '10px',
                        fontSize: '16px',
                        borderRadius: '10px',
                        border: '1px solid var(--card-background)'
                    }}
                >
                    <option value={1}>1학기</option>
                    <option value={3}>여름학기</option>
                    <option value={2}>2학기</option>
                    <option value={4}>겨울학기</option>
                </select>
            </div>
            <Spacer y={10} />

            <input
                type="text"
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
                placeholder="과목명"
                style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '16px',
                    borderRadius: '10px',
                    border: '1px solid var(--card-background)'
                }}
            />
            <Spacer y={10} />

            <input
                type="text"
                value={professor}
                onChange={(e) => onProfessorChange(e.target.value)}
                placeholder="교수명"
                style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '16px',
                    borderRadius: '10px',
                    border: '1px solid var(--card-background)'
                }}
            />
            <Spacer y={10} />

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                <select
                    value={selectedGwamok}
                    onChange={(e) => onGwamokChange(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '10px',
                        fontSize: '16px',
                        borderRadius: '10px',
                        border: '1px solid var(--card-background)'
                    }}
                >
                    <option value="">공통과목 전체</option>
                    {gwamokList.map((item) => (
                        <option key={item.code} value={item.code}>
                            {item.codeName1}
                        </option>
                    ))}
                </select>

                <select
                    value={selectedHakgwa}
                    onChange={(e) => onHakgwaChange(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '10px',
                        fontSize: '16px',
                        borderRadius: '10px',
                        border: '1px solid var(--card-background)'
                    }}
                >
                    <option value="">학과 전체</option>
                    {hakgwaList.map((item) => (
                        <option key={item.classCode} value={item.classCode}>
                            {item.openMajorName}
                        </option>
                    ))}
                </select>

                <select
                    value={selectedMajor}
                    onChange={(e) => onMajorChange(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '10px',
                        fontSize: '16px',
                        borderRadius: '10px',
                        border: '1px solid var(--card-background)'
                    }}
                >
                    <option value="">전공 전체</option>
                    {majorList.map((item) => (
                        <option key={item.code} value={item.code}>
                            {item.codeName1}
                        </option>
                    ))}
                </select>
            </div>
            <Spacer y={10} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label htmlFor="my" style={{ opacity: .7, fontSize: '14px' }}>
                    내가 수강한 과목 중에서 검색
                </label>
                <label className="switch" style={{ transform: 'scale(0.8)' }}>
                    <input
                        id="my"
                        type="checkbox"
                        checked={isMy}
                        onChange={(e) => onMyToggle(e.target.checked)}
                    />
                    <span className="slider"></span>
                </label>
            </div>

            <div className='bottom-sheet-footer'>
                <button
                    onClick={onSearch}
                    style={{ background: 'var(--button-background)', borderRadius: '15px' }}
                >
                    조회
                </button>
            </div>
        </>
    );
};

export default SearchLecturePlanForm;
