import { useState, useEffect } from "react";
import { KLAS } from "./core/klas";

export const useBoardData = () => {
    const [requestData, setRequestData] = useState({
        path: null,
        token: null,
        subj: null,
        yearHakgi: null
    });

    useEffect(() => {
        window.receivedData = function (token, subj, yearHakgi, path) {
            if (!token || !subj || !yearHakgi || !path) return;
            setRequestData({ path, token, subj, yearHakgi });
        };

        Android.completePageLoad();
    }, []);

    return requestData;
};

export const useBoardList = (requestData, page) => {
    const [list, setList] = useState(null);
    const [totalPages, setTotalPages] = useState(1);

    const fetchBoardList = async (currentPage = 0) => {
        if (!requestData.path || !requestData.token || !requestData.subj || !requestData.yearHakgi) {
            return;
        }

        try {
            const data = await KLAS(
                `https://klas.kw.ac.kr/std/lis/sport/${requestData.path}/BoardStdList.do`,
                requestData.token,
                {
                    "selectYearhakgi": requestData.yearHakgi,
                    "selectSubj": requestData.subj,
                    "selectChangeYn": "Y",
                    "currentPage": currentPage
                }
            );

            setList(data.list);
            setTotalPages(data.page.totalPages);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchBoardList(page);
    }, [page, requestData]);

    useEffect(() => {
        if (requestData.path && requestData.token && requestData.subj && requestData.yearHakgi) {
            fetchBoardList(0);
        }
    }, [requestData]);

    return { list, totalPages };
};

export const useBoardDetail = (requestData, boardNo, masterNo) => {
    const [data, setData] = useState(null);
    const [attachment, setAttachment] = useState(null);

    useEffect(() => {
        if (!boardNo || !masterNo || !requestData.path || !requestData.token || !requestData.subj || !requestData.yearHakgi) {
            return;
        }

        const fetchData = async () => {
            try {
                const result = await KLAS(
                    `https://klas.kw.ac.kr/std/lis/sport/${requestData.path}/BoardStdView.do`,
                    requestData.token,
                    {
                        "cmd": "select",
                        "selectYearhakgi": requestData.yearHakgi,
                        "selectSubj": requestData.subj,
                        "selectChangeYn": "Y",
                        boardNo,
                        masterNo,
                        "storageId": "CLS_BOARD"
                    }
                );
                setData(result);
            } catch (error) {
                console.error(error);
            }
        };

        fetchData();
    }, [boardNo, masterNo, requestData]);

    useEffect(() => {
        if (!data?.board?.atchFileId) return;

        const fetchAttachment = async () => {
            try {
                const result = await KLAS(
                    "https://klas.kw.ac.kr/common/file/UploadFileList.do",
                    requestData.token,
                    {
                        "attachId": data.board.atchFileId,
                        "storageId": "CLS_BOARD"
                    }
                );
                setAttachment(result);
            } catch (error) {
                console.error(error);
            }
        };

        fetchAttachment();
    }, [data]);

    return { data, attachment };
};
