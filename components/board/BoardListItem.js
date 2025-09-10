import { useRouter } from "next/router";

const BoardListItem = ({ item }) => {
    const router = useRouter();

    const handleClick = () => {
        router.push(`/boardView?boardNo=${item.boardNo}&masterNo=${item.masterNo}`);
    };

    return (
        <button
            key={item.sortOrdr}
            onClick={handleClick}
            style={{ paddingLeft: 0 }}
        >
            <span>{item.title}</span><br />
            <span style={{ opacity: 0.5, fontSize: '14px' }}>
                {item.userNm} | {item.registDt.substring(0, 10)}
            </span>
        </button>
    );
};

export default BoardListItem;
