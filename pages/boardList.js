import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import IonIcon from '@reacticons/ionicons';
import Spacer from "./components/spacer";

export default function BoardList() {
  const router = useRouter();
  const [list, setList] = useState(null);
  const [boardTitle, setBoardTitle] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [requestData, setRequestData] = useState({ path: null, token: null, subj: null, yearHakgi: null });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setBoardTitle(urlParams.get('title'));

    window.receivedData = function (token, subj, yearHakgi, path) {
      if (!token || !subj || !yearHakgi || !path) return;
      setRequestData({ path, token, subj, yearHakgi });

      fetch("/api/board/boardList", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ path, token, subj, yearHakgi, page }),
      })
        .then((response) => response.json())
        .then((data) => {
          setList(data.list);
          setTotalPages(data.page.totalPages);
        })
        .catch((error) => {
          console.error(error);
        });
    };
    Android.completePageLoad();
  }, []);


  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setBoardTitle(urlParams.get('title'));

    const fetchData = () => {
      console.log(requestData);
      if (!requestData.path || !requestData.token || !requestData.subj || !requestData.yearHakgi) return;

      fetch("/api/board/boardList", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ path: requestData.path, token: requestData.token, subj: requestData.subj, yearHakgi: requestData.yearHakgi, page }),
      })
        .then((response) => response.json())
        .then((data) => {
          setList(data.list);
          setTotalPages(data.page.totalPages);
        })
        .catch((error) => {
          console.error(error);
        });
    };

    fetchData();
  }, [page]);

  const handleNextPage = () => {
    if (page < totalPages - 1) setPage(page + 1);
  };

  const handlePreviousPage = () => {
    if (page > 0) setPage(page - 1);
  };

  return (
    <main>
      <Spacer y={20} />
      <h2 style={{
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
      }}>{boardTitle || "게시판"}</h2>
      <Spacer y={15} />

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {!list && (
          <>
            <div className="skeleton" style={{ height: '40px', width: '100%', marginBottom: '15px' }} />
            <div className="skeleton" style={{ height: '40px', width: '100%', marginBottom: '15px' }} />
            <div className="skeleton" style={{ height: '40px', width: '100%', marginBottom: '15px' }} />
            <div className="skeleton" style={{ height: '40px', width: '100%', marginBottom: '15px' }} />
            <div className="skeleton" style={{ height: '40px', width: '100%', marginBottom: '15px' }} />
            <div className="skeleton" style={{ height: '40px', width: '100%', marginBottom: '15px' }} />
          </>
        )}

        {list && list.length == 0 && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', justifyContent: 'center', marginTop: '10px', opacity: '.3' }}>
            <svg width="64" height="41" viewBox="0 0 64 41" xmlns="http://www.w3.org/2000/svg">
              <g transform="translate(0 1)" fill="none" fillRule="evenodd">
                <g fillRule="nonzero" stroke="var(--text-color)">
                  <path d="M55 12.76L44.854 1.258C44.367.474 43.656 0 42.907 0H21.093c-.749 0-1.46.474-1.947 1.257L9 12.761V22h46v-9.24z"></path>
                  <path d="M41.613 15.931c0-1.605.994-2.93 2.227-2.931H55v18.137C55 33.26 53.68 35 52.05 35h-40.1C10.32 35 9 33.259 9 31.137V13h11.16c1.233 0 2.227 1.323 2.227 2.928v.022c0 1.605 1.005 2.901 2.237 2.901h14.752c1.232 0 2.237-1.308 2.237-2.913v-.007z" fill="#fafafa"></path>
                </g>
              </g>
            </svg>
            <span>아직 항목이 없어요</span>
          </div>
        )}

        {list && list.map((item) => (
          <button key={item.sortOrdr} onClick={() => router.push(`/boardView?boardNo=${item.boardNo}&masterNo=${item.masterNo}`)} style={{ paddingLeft: 0 }}>
            <span>{item.title}</span><br />
            <span style={{ opacity: .5, fontSize: '14px' }}>{item.userNm} | {item.registDt.substring(0, 10)}</span>
          </button>
        ))}
      </div>

      <Spacer y={20} />

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
        <button style={{ background: 'var(--card-background)', width: '35px', height: '35px', borderRadius: '50%' }} onClick={handlePreviousPage} disabled={page === 0}>
          <IonIcon name="chevron-back-outline" />
        </button>
        <span>{page + 1} / {totalPages}</span>
        <button style={{ background: 'var(--card-background)', width: '35px', height: '35px', borderRadius: '50%' }} onClick={handleNextPage} disabled={page === totalPages - 1}>
          <IonIcon name="chevron-forward-outline" />
        </button>
      </div>
      <Spacer y={20} />
    </main>
  );
}
