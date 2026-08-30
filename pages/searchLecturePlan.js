import KlasNativeBridge from '../lib/core/klasNativeBridge';
import { useSearchLecturePlan } from '../lib/lecturePlan/useSearchLecturePlan';
import SearchLecturePlanHeader from '../components/lecturePlan/SearchLecturePlanHeader';
import SearchLecturePlanForm from '../components/lecturePlan/SearchLecturePlanForm';
import SearchResultCard from '../components/lecturePlan/SearchResultCard';
import SearchLecturePlanLoadingSkeleton from '../components/lecturePlan/SearchLecturePlanLoadingSkeleton';
import SearchLecturePlanEmptyState from '../components/lecturePlan/SearchLecturePlanEmptyState';
import Spacer from '../components/common/spacer';

export default function LectureHome() {
    const {
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

        setYear,
        setHakgi,
        setName,
        setProfessor,
        setSelectedGwamok,
        setSelectedHakgwa,
        setSelectedMajor,
        setIsMy,

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
            KlasNativeBridge.openLecturePlanPage(id);
        } catch {
            KlasNativeBridge.openPage(`https://klas.kw.ac.kr/std/cps/atnlc/popup/LectrePlanStdView.do?selectSubj=${id}`);
        }
    };

    return (
        <main className="search-lecture-plan-page">
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
                    <div className="search-result-grid">
                    {!data && <div className="grid-state"><SearchLecturePlanLoadingSkeleton /></div>}

                    {data && data.length === 0 && <div className="grid-state"><SearchLecturePlanEmptyState /></div>}

                    {data && data.map((item, index) => (
                        <SearchResultCard
                            key={index}
                            item={item}
                            onLecturePlanClick={openLecturePlan}
                        />
                    ))}
                    </div>

                    <div className="page-action-reserve" />

                    <div className='page-action-bar'>
                        <div className="page-action-bar-inner">
                        <button
                            onClick={backToSearch}
                            style={{ background: 'var(--button-background)', borderRadius: '15px' }}
                        >
                            다시 검색
                        </button>
                        </div>
                    </div>
                </>
            )}
        </main>
    );
}
