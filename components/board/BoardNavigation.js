import { useRouter } from "next/router";
import Spacer from '../common/spacer';

const NavigationButton = ({ post, direction, onClick }) => {
    if (!post) return null;

    return (
        <button
            type="button"
            onClick={onClick}
            style={{
                padding: '10px 15px',
                borderRadius: '20px',
                border: '1px solid var(--card-background)',
                fontSize: '14px',
            }}
        >
            <span style={{ opacity: 0.6 }}>{direction}</span><br />
            {post.title}
        </button>
    );
};

const BoardNavigation = ({ prevPost, nextPost }) => {
    const router = useRouter();

    return (
        <>
            <Spacer y={40} />
            <NavigationButton post={prevPost} direction="이전 글" onClick={() => router.push(`/boardView?boardNo=${prevPost.boardNo}&masterNo=${prevPost.masterNo}`)} />
            <Spacer y={15} />
            <NavigationButton post={nextPost} direction="다음 글" onClick={() => router.push(`/boardView?boardNo=${nextPost.boardNo}&masterNo=${nextPost.masterNo}`)} />
        </>
    );
};

export default BoardNavigation;
