import { useRouter } from "next/router";
import Spacer from '../common/spacer';

const BoardNavigation = ({ prevPost, nextPost }) => {
    const router = useRouter();

    const NavigationButton = ({ post, direction }) => {
        if (!post) return null;

        const handleClick = () => {
            router.push(`/boardView?boardNo=${post.boardNo}&masterNo=${post.masterNo}`);
        };

        return (
            <button
                onClick={handleClick}
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

    return (
        <>
            <Spacer y={40} />
            <NavigationButton post={prevPost} direction="이전 글" />
            <Spacer y={15} />
            <NavigationButton post={nextPost} direction="다음 글" />
        </>
    );
};

export default BoardNavigation;
