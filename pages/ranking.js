import { useRanking } from '../lib/grade/useRanking';
import RankingHeader from '../components/grade/RankingHeader';
import RankingCard from '../components/grade/RankingCard';
import RankingLoadingSkeleton from '../components/grade/RankingLoadingSkeleton';
import RankingEmptyState from '../components/grade/RankingEmptyState';

export default function Grade() {
  const { rank } = useRanking();

  return (
    <main>
      <RankingHeader />

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
      <br /><br /><br />
    </main>
  );
}