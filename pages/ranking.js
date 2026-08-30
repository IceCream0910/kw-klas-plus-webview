import { useRanking } from '../lib/grade/useRanking';
import RankingHeader from '../components/grade/RankingHeader';
import RankingCard from '../components/grade/RankingCard';
import RankingLoadingSkeleton from '../components/grade/RankingLoadingSkeleton';
import RankingEmptyState from '../components/grade/RankingEmptyState';

export default function Grade() {
  const { rank } = useRanking();

  return (
    <main className="ranking-page">
      <RankingHeader />

      <div className="ranking-card-grid">
      {rank ? (
        rank.length === 0 ? (
          <RankingEmptyState />
        ) : (
          rank.slice().reverse().map((data, index) => (
            <RankingCard key={index} data={data} />
          ))
        )
      ) : (
        <RankingLoadingSkeleton />
      )}
      </div>
      <br /><br /><br />
    </main>
  );
}
