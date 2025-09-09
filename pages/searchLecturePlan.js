import { useSearchLecturePlan } from '../lib/hooks/useSearchLecturePlan';
import SearchLecturePlanHeader from './components/SearchLecturePlanHeader';
import SearchLecturePlanForm from './components/SearchLecturePlanForm';
import SearchResultCard from './components/SearchResultCard';
import SearchLecturePlanLoadingSkeleton from './components/SearchLecturePlanLoadingSkeleton';
import SearchLecturePlanEmptyState from './components/SearchLecturePlanEmptyState';
import Spacer from './components/spacer';

export default function LectureHome() {
    const {
        // 상태
        searchMode,
        data,
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

        // 상태 변경 함수
        setYear,
        setHakgi,
        setName,
        setProfessor,
        setSelectedGwamok,
        setSelectedHakgwa,
        setSelectedMajor,
        setIsMy,

        // 기능 함수
        search,
        backToSearch,
        fetchMajorList
    } = useSearchLecturePlan();

    const handleGwamokChange = (value) => {
        setSelectedGwamok(value);
        setSelectedHakgwa('');
        setSelectedMajor('');
    };

    const handleHakgwaChange = (value) => {
        setSelectedHakgwa(value);
        setSelectedGwamok('');
        if (value) {
            fetchMajorList(value);
        } else {
            setSelectedMajor('');
        }
    };

    const openLecturePlan = (id) => {
        try {
            window.Android.openLecturePlanPage(id);
        } catch {
            window.Android.openPage(`https://klas.kw.ac.kr/std/cps/atnlc/popup/LectrePlanStdView.do?selectSubj=${id}`);
        }
    };

    return (
        <main>
            <SearchLecturePlanHeader />

            {searchMode ? (
                <SearchLecturePlanForm
                    year={year}
                    hakgi={hakgi}
                    name={name}
                    professor={professor}
                    selectedGwamok={selectedGwamok}
                    selectedHakgwa={selectedHakgwa}
                    selectedMajor={selectedMajor}
                    isMy={isMy}
                    gwamokList={gwamokList}
                    hakgwaList={hakgwaList}
                    majorList={majorList}
                    onYearChange={setYear}
                    onHakgiChange={setHakgi}
                    onNameChange={setName}
                    onProfessorChange={setProfessor}
                    onGwamokChange={handleGwamokChange}
                    onHakgwaChange={handleHakgwaChange}
                    onMajorChange={setSelectedMajor}
                    onMyToggle={setIsMy}
                    onSearch={search}
                />
            ) : (
                <>
                    {!data && <SearchLecturePlanLoadingSkeleton />}

                    {data && data.length === 0 && <SearchLecturePlanEmptyState />}

                    {data && data.map((item, index) => (
                        <SearchResultCard
                            key={index}
                            item={item}
                            onLecturePlanClick={openLecturePlan}
                        />
                    ))}

                    <Spacer y={80} />

                    <div className='bottom-sheet-footer' style={{ position: 'fixed', bottom: '0' }}>
                        <button
                            onClick={backToSearch}
                            style={{ background: 'var(--button-background)', borderRadius: '15px' }}
                        >
                            다시 검색
                        </button>
                    </div>
                </>
            )}
        </main>
    );
}