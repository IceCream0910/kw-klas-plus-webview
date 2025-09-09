import { useOnlineLecture } from '../lib/hooks/useOnlineLecture';
import OnlineLectureHeader from './components/OnlineLectureHeader';
import OnlineLectureCard from './components/OnlineLectureCard';
import OnlineLectureLoadingSkeleton from './components/OnlineLectureLoadingSkeleton';

export default function Page() {
  const {
    filteredList,
    excludeFinished,
    handleToggleChange
  } = useOnlineLecture();

  return (
    <main>
      <OnlineLectureHeader
        excludeFinished={excludeFinished}
        onToggleChange={handleToggleChange}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {!filteredList && <OnlineLectureLoadingSkeleton />}

        {filteredList && filteredList.length === 0 && (
          <span style={{ opacity: .5 }}>온라인 강의가 없습니다!</span>
        )}

        {filteredList && filteredList.map((item, index) => (
          <OnlineLectureCard key={index} item={item} />
        ))}
      </div>
    </main>
  );
}